import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { completeOnboardingWithAlert } from "./onboardingCompletion";

const BACKGROUND = require("../../assets/images/Background.png");

export default function Onboarding4() {
  const [isCompleting, setIsCompleting] = useState(false);

  const finishOnboarding = async () => {
    if (isCompleting) {
      return;
    }

    setIsCompleting(true);

    try {
      await completeOnboardingWithAlert();
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <ImageBackground
      source={BACKGROUND}
      resizeMode="cover"
      className="flex-1 bg-back"
    >
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1" style={{ flex: 1 }}>
        <View
          className="relative flex-1 items-center px-7 pt-16"
          style={{ flex: 1 }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="온보딩 건너뛰기"
            accessibilityState={{ disabled: isCompleting }}
            disabled={isCompleting}
            onPress={() => {
              void finishOnboarding();
            }}
            className="absolute right-4 top-2 z-10 px-3 py-2"
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Text className="border-b border-gray-300 font-maru text-[16px] text-gray-300">
              Skip
            </Text>
          </Pressable>

          <View className="items-center">
            <View className="rounded-full bg-secondary px-5 py-2">
              <Text className="font-maru text-[12px] text-back">MY STATS</Text>
            </View>

            <Text className="mt-8 text-center font-maru text-[28px] leading-[36px] text-primary">
              매일의 집중을{"\n"}기록으로 쌓아봐요
            </Text>

            <Text className="mt-[18px] text-center font-maru text-[16px] leading-[28px] text-gray-300">
              스트릭과 총 집중 시간으로{"\n"}
              꾸준함을 확인해 보세요
            </Text>

            <View className="mt-10 flex-row self-stretch gap-4">
              <View className="h-32 flex-1 items-center justify-center rounded-2xl border border-gray-100 bg-white">
                <Text className="font-maru text-[20px] text-primary">7일</Text>
                <Text className="mt-3 font-maru text-[12px] text-gray-300">
                  연속 스트릭
                </Text>
              </View>

              <View className="h-32 flex-1 items-center justify-center rounded-2xl border border-gray-100 bg-white">
                <Text className="font-maru text-[20px] text-primary">25h</Text>
                <Text className="mt-3 font-maru text-[12px] text-gray-300">
                  총 집중 시간
                </Text>
              </View>
            </View>
          </View>

          <View
            className="absolute bottom-[160px] flex-row items-center gap-8"
            accessibilityLabel="온보딩 4/4"
          >
            <View className="h-5 w-5 rounded-full bg-gray-300" />
            <View className="h-5 w-5 rounded-full bg-gray-300" />
            <View className="h-5 w-5 rounded-full bg-gray-300" />
            <View className="h-5 w-[52px] rounded-full bg-secondary" />
          </View>

          <View className="absolute bottom-4 left-10 right-10 h-12 overflow-hidden rounded-[7px] border border-primary bg-white">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isCompleting }}
              disabled={isCompleting}
              onPress={() => {
                void finishOnboarding();
              }}
              className="flex-1 items-center justify-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
            >
              <Text className="font-maru text-[12px] text-primary">
                {isCompleting ? "처리 중" : "다음"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
