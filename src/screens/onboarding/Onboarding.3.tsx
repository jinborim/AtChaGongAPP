import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { completeOnboardingWithAlert } from "./onboardingCompletion";

const BACKGROUND = require("../../assets/images/Background.png");
const ICE_CUP = require("../../assets/images/IceCup3.png");

export default function Onboarding3() {
  return (
    <ImageBackground
      source={BACKGROUND}
      resizeMode="cover"
      className="flex-1 bg-back"
    >
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1" style={{ flex: 1 }}>
        <View
          className="relative flex-1 items-center px-7 pt-[32px]"
          style={{ flex: 1 }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="온보딩 건너뛰기"
            onPress={() => {
              void completeOnboardingWithAlert();
            }}
            className="absolute right-4 top-6 z-10 px-3 py-2"
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
           <Text className="border-b border-gray-300 font-maru text-[16px] text-gray-300">
           Skip
          </Text>
          </Pressable>

          <View className="items-center">
            <Image
              source={ICE_CUP}
              className="h-[210px] w-[174px]"
              resizeMode="contain"
            />

            <Text className="mt-[18px] text-center font-maru text-[28px] leading-[36px] text-primary">
              다 녹으면, {"\n"}얼음으로 가득채워요
            </Text>
            <Text className="mt-[18px] text-center font-maru text-[16px] leading-[24px] text-gray-300">
              집중이 끝나면 휴식 시간 동안{"\n"}
              새 얼음이 만들어져요{"\n"}
              녹이고 채우며 리듬을 만들어요.
            </Text>
          </View>

          <View
            className="absolute bottom-[200px] flex-row items-center gap-8"
            accessibilityLabel="온보딩 3/4"
          >
            <View className="h-5 w-5 rounded-full bg-gray-300" />
            <View className="h-5 w-5 rounded-full bg-gray-300" />
            <View className="h-5 w-[52px] rounded-full bg-secondary" />
            <View className="h-5 w-5 rounded-full bg-gray-300" />
          </View>

          <View className="absolute bottom-14 left-10 right-10 h-12 overflow-hidden rounded-[7px] border border-primary bg-white">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/onboarding.4")} 
              className="flex-1 items-center justify-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
            >
              <Text className="font-maru text-[12px] text-primary">
                다음
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
