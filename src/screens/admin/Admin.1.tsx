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
const ADMIN_PENGUIN = require("../../assets/images/AdminPenguin.gif");
const ADMINNOTICE = require("../../assets/images/AdminNotice.png");

export default function Admin1() {
  return (
    <ImageBackground
      source={BACKGROUND}
      resizeMode="cover"
      className="flex-1 bg-back"
    >
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1" style={{ flex: 1 }}>
        <View className="flex-1 px-6 pt-12">
          <Text className="text-center font-maru text-[20px] text-primary">
            관리자 대시보드
          </Text>

          <View className="mt-10 h-[136px] flex-row items-center rounded-[8px] border border-gray-100 bg-white px-6">
            <View className="flex-1">
              <Text className="font-maru text-[14px] text-primary">
                활성 유저 수
              </Text>
              <View className="mt-4 flex-row items-end">
                <Text className="font-maru text-[28px] text-primary">
                  1,234
                </Text>
                <Text className="mb-1 ml-1 font-maru text-[12px] text-gray-300">
                  명
                </Text>
              </View>
              <Text className="mt-3 font-maru text-[10px] text-gray-300">
                오늘 기준
              </Text>
            </View>

            <Image
              source={ADMIN_PENGUIN}
              className="h-[92px] w-[92px]"
              resizeMode="contain"
            />
          </View>

          <View className="mt-5 gap-4">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/admin.2")}
              className="h-[76px] flex-row items-center rounded-[8px] border border-gray-100 bg-white px-5"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Image
                source={ADMINNOTICE}
                className="mr-4 h-[28px] w-[28px]"
                resizeMode="contain"
              />
              <View>
                <Text className="font-maru text-[14px] text-primary">
                  공지사항 관리
                </Text>
                <Text className="mt-2 font-maru text-[10px] text-gray-300">
                  공지사항을 작성하고 관리할 수 있어요
                </Text>
              </View>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/login")}
            className="mb-8 mt-auto h-[52px] flex-row items-center justify-center rounded-[8px] border border-primary bg-white"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text className="font-maru text-[12px] text-primary">로그아웃</Text>
          </Pressable>
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}
