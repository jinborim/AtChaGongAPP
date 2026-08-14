import React from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Header from "@/src/components/Header/Header";
import { useNotices } from "@/src/features/notice/hooks/useNotices";
import NoticeCard from "../../components/NoticeCard/NoticeCard";

export default function NoticePage() {
  const { notices, isLoading, error, refetch } = useNotices(0, 10);
  return (
    <ImageBackground
      source={require("../../assets/images/Background.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <Header title="공지사항" showBack />

      <ScrollView
        className="flex-1 px-4 pt-12"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 로딩 상태 */}
        {isLoading && (
          <View className="flex-1 items-center justify-center pb-24">
            <ActivityIndicator size="large" color="#334155" />
          </View>
        )}
        {/* 에러 상태 */}
        {!isLoading && error && (
          <View className="py-20 items-center justify-center">
            <Text className="text-gray-300 font-maru mb-4">
              공지사항을 불러오지 못했습니다.
            </Text>
            <TouchableOpacity
              onPress={refetch}
              className="px-4 py-2 bg-primary rounded-lg"
            >
              <Text className="text-white font-maru">다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 데이터 목록 표시 */}
        {!isLoading &&
          !error &&
          notices.map((item) => (
            <NoticeCard
              key={item.noticeId}
              isNew={item.isNew}
              title={item.title}
              date={item.createdAtFormatted}
              href={`/notice/${item.noticeId}`} // 상세 페이지 경로 지정
            />
          ))}
        {/* 하단 여백 확보 */}
        <View className="h-10" />
      </ScrollView>
    </ImageBackground>
  );
}
