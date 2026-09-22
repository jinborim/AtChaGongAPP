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
const ICE_CUP = require("../../assets/images/IceCupCurrentPreview.png");

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
            <View className="h-[270px] w-[250px] items-center justify-center">
              <Text className="font-maru text-[15px] tracking-[3px] text-gray-300">
                NO. 001
              </Text>
              <View className="mt-2 bg-[#E3F0E9] px-3 py-1">
                <Text className="font-maru text-[13px] text-[#416D58]">
                  수집
                </Text>
              </View>
              <Image
                source={ICE_CUP}
                className="mt-2 h-[150px] w-[104px]"
                resizeMode="contain"
                fadeDuration={0}
              />
              <Text className="mt-1 font-maru text-[18px] text-primary">
                얼음컵
              </Text>
              <Text className="mt-1 font-maru text-[10px] tracking-[3px] text-gray-300">
                COLLECTED
              </Text>
            </View>

            <Text className="mt-[18px] text-center font-maru text-[28px] leading-[36px] text-primary">
              나만의 음료 도감을{"\n"}채워보세요
            </Text>
            <Text className="mt-[18px] text-center font-maru text-[16px] leading-[24px] text-gray-300">
              집중으로 모은 코인으로 음료를 구매하고{"\n"}
              도감에 하나씩 기록해 보세요
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
              <Text className="font-maru text-[12px] text-primary">다음</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
