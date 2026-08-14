import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 실제 프로젝트에서는 API 호출이나 별도 data/mockNotice.ts 파일에서 불러옵니다.
const MOCK_NOTICES: Record<
  string,
  { title: string; date: string; content: string; isNew?: boolean }
> = {
  "1": {
    title: "여름 이벤트 안내",
    date: "2026-08-01",
    isNew: true,
    content:
      "안녕하세요. 여름을 맞아 특별한 이벤트가 시작됩니다!\n\n이벤트 기간 동안 다양한 혜택을 제공해 드릴 예정이니 많은 관심과 참여 부탁드립니다.",
  },
  "2": {
    title: "점검 안내(8/5)",
    date: "2026-08-05",
    content:
      "안정적인 서비스 제공을 위한 서버 점검이 진행될 예정입니다.\n\n- 점검 시간: 2026년 8월 5일 02:00 ~ 06:00 (4시간)\n- 점검 영향: 서비스 이용 불가",
  },
  "3": {
    title: "업데이트 소식",
    date: "2026-08-05",
    content:
      "안정적인 서비스 제공을 위한 점검이 필요합니다.점검 시간: 2026년 8월 5일 02:00 ~ 06:00 (4시간)\n- 점검 영향: 서비스 이용 불가",
  },
  "4": {
    title: "버그 수정 안내 (완료)",
    date: "2026-08-05",
    content: "안정적인 서비스 제공을 위한 점검이 완료되었습니다.",
  },
};

export default function NoticeDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // id에 해당하는 데이터 조회 (없을 경우 예외 처리)
  const notice = id ? MOCK_NOTICES[id] : null;

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

      {notice ? (
        <ScrollView className="flex-1  bg-white p-6 m-10 border rounded-[16px] border-gray-300">
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
              {notice.date}
            </Text>
          </View>

          {/* 본문 영역 */}
          <Text className="font-maru text-base text-gray-600 leading-6">
            {notice.content}
          </Text>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="font-maru text-gray-400">
            존재하지 않는 공지사항입니다.
          </Text>
        </View>
      )}
    </ImageBackground>
  );
}
