import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface NoticeCardProps {
  isNew?: boolean;
  title: string;
  description: string;
  date: string;
  href?: string; // 이동할 상세 페이지 경로
  onPress?: () => void; // 필요시 별도 클릭 이벤트를 사용할 때
}

export default function NoticeCard({
  isNew = false,
  title,
  description,
  date,
  href,
  onPress,
}: NoticeCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (href) {
      router.push(href as any);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className="mb-5 rounded-2xl border border-gray-300 bg-white/90 p-4 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        {/* 왼쪽 콘텐츠 영역 */}
        <View className="flex-1 pr-3">
          {/* 제목 & NEW 뱃지 */}
          <View className="flex-row items-center gap-2 mb-2">
            {isNew && (
              <View className="rounded bg-secondary px-4 py-0.5">
                <Text className="text-[10px] font-maru text-white">new</Text>
              </View>
            )}
            <Text
              className="text-base font-maru text-primary "
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>

          {/* 한 줄 설명 */}
          <Text
            className="mb-2 text-xs font-maru text-gray-300"
            numberOfLines={1}
          >
            {description}
          </Text>

          {/* 날짜 */}
          <Text className="text-xs font-maru text-gray-300">{date}</Text>
        </View>

        {/* 오른쪽 화살표 아이콘 */}
        <Ionicons name="chevron-forward" size={20} color="#334155" />
      </View>
    </TouchableOpacity>
  );
}
