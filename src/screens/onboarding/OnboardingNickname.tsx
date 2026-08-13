import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
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
          className="flex-1 px-8 pb-[84px]"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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
            <Text className="font-maru text-[12px] text-primary">닉네임</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임을 입력해주세요."
              placeholderTextColor={PLACEHOLDER_COLOR}
              maxLength={12}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              className="mt-3 h-12 rounded-[8px] border border-gray-100 bg-white px-4 font-maru text-[12px] text-primary"
            />
          </View>

        </KeyboardAvoidingView>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canStart }}
          disabled={!canStart}
          onPress={() => {
            startApp().catch(() => setIsSaving(false));
          }}
          className={`absolute bottom-4 left-8 right-8 h-[52px] items-center justify-center rounded-[7px] bg-primary ${
            canStart ? "opacity-100" : "opacity-50"
          }`}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : undefined })}
        >
          <Text className="font-maru text-[12px] text-white">
            {isSaving ? "저장 중" : "시작하기"}
          </Text>
        </Pressable>
      </SafeAreaView>
    </ImageBackground>
  );
}
