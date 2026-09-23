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
const COIN = require("../../assets/images/Coin.png");
const ATTENDANCE_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export default function Onboarding2() {
  return (
    <ImageBackground
      source={BACKGROUND}
      resizeMode="cover"
      className="flex-1 bg-back"
    >
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1" style={{ flex: 1 }}>
        <View
          className="relative flex-1 items-center px-7 pt-[34px]"
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
            <View className="h-[270px] w-[320px] items-center justify-center">
              <Image
                source={COIN}
                className="h-[92px] w-[92px]"
                resizeMode="contain"
                fadeDuration={0}
              />
              <Text className="mt-2 font-maru text-[30px] text-[#E18B00]">
                +10 코인
              </Text>

              <View className="mt-5 flex-row gap-[7px]">
                {ATTENDANCE_DAYS.map((day) => {
                  const attended = day <= 2;

                  return (
                    <View key={day} className="items-center">
                      <View
                        className={`h-10 w-9 items-center justify-center rounded-[7px] border-2 ${
                          attended
                            ? "border-primary bg-[#B7DEFF]"
                            : "border-[#CBD8E4] bg-transparent"
                        }`}
                      >
                        <Text className="font-maru text-[12px] text-primary">
                          {attended ? "✓" : day}
                        </Text>
                      </View>
                      <Text className="mt-1 font-maru text-[9px] text-primary">
                        {day === 7 ? "10/70" : "+10"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <Text className="mt-[18px] text-center font-maru text-[28px] leading-[36px] text-primary">
              매일 출석하고{"\n"}코인을 받아요
            </Text>
            <Text className="mt-[18px] text-center font-maru text-[16px] leading-[24px] text-gray-300">
              앱에 방문해 출석하면 매일 10코인{"\n"}
              7일 연속 출석 시 70코인을 받아요
            </Text>
          </View>

          <View
            className="absolute bottom-[200px] flex-row items-center gap-8"
            accessibilityLabel="온보딩 2/4"
          >
            <View className="h-5 w-5 rounded-full bg-gray-300" />
            <View className="h-5 w-[52px] rounded-full bg-secondary" />
            <View className="h-5 w-5 rounded-full bg-gray-300" />
            <View className="h-5 w-5 rounded-full bg-gray-300" />
          </View>

          <View className="absolute bottom-14 left-10 right-10 h-12 overflow-hidden rounded-[7px] border border-primary bg-white">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/onboarding.3")}
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
