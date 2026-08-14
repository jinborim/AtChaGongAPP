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

export default function OnboardingNickname() {
  const [nickname, setNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const trimmedNickname = nickname.trim();
  const canStart = trimmedNickname.length > 0 && !isSaving;

  const startApp = async () => {
    if (!canStart) return;

    setIsSaving(true);

    try {
      await AsyncStorage.setItem("nickname", trimmedNickname);
      router.replace("/router/homeSetting");
    } catch {
      Alert.alert(
        "저장에 실패했어요",
        "닉네임을 저장하거나 화면을 이동하지 못했습니다. 다시 시도해 주세요."
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
              maxLength={12}
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
