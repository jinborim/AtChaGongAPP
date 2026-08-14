import { ApiError, clearAuthTokens } from "@/src/api";
import { completeOnboarding, updateNickname } from "@/src/features/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKGROUND = require("../../assets/images/Background.png");
const PENGUIN = require("../../assets/images/Penguin1.png");
const SPEECH_BUBBLE = require("../../assets/images/SpeechBubble.png");
const PLACEHOLDER_COLOR = "#A2AAB0";
const ONBOARDING_HAS_NICKNAME_KEY = "atchagong.onboarding.hasNickname";

function getNicknameErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "닉네임을 저장하거나 화면을 이동하지 못했습니다. 다시 시도해 주세요.";
  }

  switch (error.code) {
    case "INVALID_NICKNAME":
      return "닉네임은 공백을 제외하고 1~20자로 입력해 주세요.";
    case "SUSPENDED_USER":
      return "정지된 계정입니다. 고객센터에 문의해 주세요.";
    case "WITHDRAWN_USER":
      return "탈퇴 처리된 계정입니다.";
    case "NETWORK_ERROR":
      return "네트워크 연결을 확인한 뒤 다시 시도해 주세요.";
    default:
      if (error.status === 401) {
        return "로그인이 만료되었습니다. 다시 로그인해 주세요.";
      }

      if (error.status === 404) {
        return "사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요.";
      }

      return error.message || "닉네임 저장에 실패했습니다. 다시 시도해 주세요.";
  }
}

function getOnboardingCompletionErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "닉네임은 저장됐지만 온보딩 완료 처리에 실패했습니다. 다시 시도해 주세요.";
  }

  switch (error.code) {
    case "BAD_REQUEST":
      return "닉네임은 저장됐지만 온보딩 완료 요청에 실패했습니다. 다시 시도해 주세요.";
    case "NETWORK_ERROR":
      return "닉네임은 저장됐지만 네트워크 문제로 온보딩 완료 처리에 실패했습니다. 다시 시도해 주세요.";
    default:
      return getNicknameErrorMessage(error);
  }
}

export default function OnboardingNickname() {
  const [nickname, setNickname] = useState("");
  const [savedNickname, setSavedNickname] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const trimmedNickname = nickname.trim();
  const canStart = trimmedNickname.length > 0 && !isSaving;

  const startApp = async () => {
    if (!canStart) return;

    setIsSaving(true);
    let failedStep: "nickname" | "onboarding" = "nickname";

    try {
      if (savedNickname !== trimmedNickname) {
        const response = await updateNickname({ nickname: trimmedNickname });
        await AsyncStorage.setItem("nickname", response.nickname);
        setNickname(response.nickname);
        setSavedNickname(response.nickname);
      }

      failedStep = "onboarding";
      await completeOnboarding();
      await AsyncStorage.removeItem(ONBOARDING_HAS_NICKNAME_KEY);
      router.replace("/router/homeSetting");
    } catch (error) {
      const shouldReturnToLogin =
        error instanceof ApiError &&
        (error.status === 401 || error.status === 404);

      if (shouldReturnToLogin) {
        await clearAuthTokens();
      }

      Alert.alert(
        failedStep === "nickname"
          ? "저장에 실패했어요"
          : "처리에 실패했어요",
        failedStep === "nickname"
          ? getNicknameErrorMessage(error)
          : getOnboardingCompletionErrorMessage(error),
        [
          {
            text: "확인",
            onPress: () => {
              if (shouldReturnToLogin) {
                router.replace("/login");
              }
            },
          },
        ],
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ImageBackground
      source={BACKGROUND}
      resizeMode="cover"
      className="flex-1 bg-back"
    >
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1 px-8"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="mt-[180px] flex-row items-center justify-center">
            <Image
              source={PENGUIN}
              className="h-[96px] w-[84px]"
              resizeMode="contain"
            />

            <ImageBackground
              source={SPEECH_BUBBLE}
              className="ml-2 h-[112px] w-[196px] items-center justify-center"
              resizeMode="stretch"
            >
              <Text className="ml-4 font-maru text-[12px] leading-5 text-primary">
                안녕하세요! 반가워요!{"\n"}
                닉네임을 알려주세요!
              </Text>
            </ImageBackground>
          </View>

          <View className="mt-20">
            <Text
              accessible={false}
              className="font-maru text-[12px] text-primary"
            >
              닉네임
            </Text>
            <TextInput
              accessibilityLabel="닉네임"
              value={nickname}
              onChangeText={setNickname}
              editable={!isSaving}
              placeholder="닉네임을 입력해주세요."
              placeholderTextColor={PLACEHOLDER_COLOR}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => {
                void startApp();
              }}
              className="mt-3 h-12 rounded-[8px] border border-gray-100 bg-white px-4 font-maru text-[12px] text-primary"
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canStart }}
            disabled={!canStart}
            onPress={() => {
              void startApp();
            }}
            className={`mb-4 mt-auto h-[52px] w-full items-center justify-center rounded-[8px] bg-primary active:opacity-70 ${
              canStart ? "opacity-100" : "opacity-50"
            }`}
          >
            <Text className="font-maru text-[12px] text-white">
              {isSaving ? "저장 중" : "시작하기"}
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
