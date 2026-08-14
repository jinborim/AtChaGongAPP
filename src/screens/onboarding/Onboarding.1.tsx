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

const BACKGROUND = require("../../assets/images/Background.png");
const ICE_CUP = require("../../assets/images/IceCup1.png");

export default function Onboarding1() {
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
            onPress={() => router.replace("/onboardingnickname")}
            className="absolute right-4 top-2 z-10 px-3 py-2"
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

            <Text className="mt-[20px] text-center font-maru text-[28px] leading-[36px] text-primary">
              얼음이 녹는{"\n"}집중 타이머
            </Text>
            <Text className="mt-[20px] text-center font-maru text-[16px] leading-[24px] text-gray-300">
              집중하면 얼음이 천천히 녹아요{"\n"}
              당신의 시간을 녹여보세요
            </Text>
          </View>

          <View
            className="absolute bottom-[160px] flex-row items-center gap-8"
            accessibilityLabel="온보딩 1/4"
          >
            <View className="h-5 w-[52px] rounded-full bg-secondary" />
            <View className="h-5 w-5 rounded-full bg-gray-300" />
            <View className="h-5 w-5 rounded-full bg-gray-300" />
            <View className="h-5 w-5 rounded-full bg-gray-300" />
          </View>

          <View className="absolute bottom-4 left-10 right-10 h-12 overflow-hidden rounded-[7px] border border-primary bg-white">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/onboarding.2")}
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
