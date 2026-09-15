import { StatusBar } from "expo-status-bar";
import React from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/Header/Header";

const BACKGROUND = require("../../assets/images/Background.png");

type Admin4Props = {
  noticeTitle?: string;
  noticeContent?: string;
  startDate?: string;
  endDate?: string;
  onBack?: () => void;
};

export default function Admin4({
  noticeTitle = "공지 제목",
  noticeContent = "작성한 공지 내용이 이곳에 표시됩니다.",
  startDate = "-",
  endDate = "-",
  onBack,
}: Admin4Props) {
  const displayedTitle = noticeTitle.trim() || "제목이 입력되지 않았습니다";
  const displayedContent =
    noticeContent.trim() || "내용이 입력되지 않았습니다";

  return (
    <ImageBackground
      source={BACKGROUND}
      resizeMode="cover"
      className="flex-1 bg-back"
    >
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <Header title="공지사항 미리보기" showBack onBack={onBack} />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-7 pb-10 pt-8"
        >
          <View className="min-h-[480px] rounded-[8px] border border-gray-100 bg-white px-5 py-6">
            <View className="flex-row items-center">
              <View className="mr-3 rounded-[4px] bg-secondary px-3 py-1">
                <Text className="font-maru text-[12px] text-white">NEW</Text>
              </View>
              <Text className="flex-1 font-maru text-[16px] leading-6 text-primary">
                {displayedTitle}
              </Text>
            </View>

            <Text className="mt-3 font-maru text-[12px] text-gray-300">
              {startDate}
            </Text>

            <Text className="mt-8 font-maru text-[12px] leading-6 text-gray-300">
              {displayedContent}
            </Text>

            <View className="mt-10">
              <Text className="font-maru text-[16px] text-primary">
                이벤트 기간
              </Text>
              <Text className="mt-3 font-maru text-[12px] text-gray-300">
                {startDate} ~ {endDate}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
