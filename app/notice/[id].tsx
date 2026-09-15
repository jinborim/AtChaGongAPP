import { useNoticeDetail } from "@/src/features/notice/hooks/useNoticeDetail";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NoticeDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // id에 해당하는 데이터 조회 (없을 경우 예외 처리)
  const noticeId = id ? Number(id) : 0;
  const { notice, isLoading, error, refetch } = useNoticeDetail(noticeId);

  return (
    <ImageBackground
      source={require("../../src/assets/images/Background.png")}
      className="flex-1"
      resizeMode="cover"
    >
      {/* 상세페이지용 간단 헤더 */}
      <View className="flex-row items-center px-4 pt-12 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-maru text-lg text-primary mr-8">
          공지사항
        </Text>
      </View>
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#334155" />
        </View>
      )}
      {!isLoading && error && (
        <View className="flex-1 items-center justify-center">
          <Text className="font-maru text-gray-500 mb-4">
            공지사항을 불러올 수 없습니다.
          </Text>
          <TouchableOpacity
            onPress={refetch}
            className="px-4 py-2 bg-primary rounded-lg"
          >
            <Text className="font-maru text-white">다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && notice && (
        <ScrollView className="flex-1 bg-white p-6 m-10 border rounded-[16px] border-gray-300">
          {/* 제목 & 날짜 영역 */}
          <View className="border-b border-gray-200 pb-4 mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              {notice.isNew && (
                <View className="rounded bg-secondary px-2 py-0.5">
                  <Text className="text-[10px] font-maru text-white">new</Text>
                </View>
              )}
              <Text className="text-xl font-maru text-primary flex-1">
                {notice.title}
              </Text>
            </View>
            <Text className="text-xs font-maru text-gray-400">
              {notice.createdAtFormatted}
            </Text>
          </View>

          {/* 이미지 영역 (imgUrl이 존재하는 경우에만 출력) */}
          {notice.imgUrl && (
            <Image
              source={{ uri: notice.imgUrl }}
              className="w-full h-48 rounded-lg mb-6"
              resizeMode="cover"
            />
          )}

          {/* 본문 영역 */}
          <Text className="font-maru text-base text-gray-600 leading-6">
            {notice.content}
          </Text>
        </ScrollView>
      )}

      {/* 4. 데이터가 없는 경우 */}
      {!isLoading && !error && !notice && (
        <View className="flex-1 items-center justify-center">
          <Text className="font-maru text-gray-400">
            존재하지 않는 공지사항입니다.
          </Text>
        </View>
      )}
    </ImageBackground>
  );
}
