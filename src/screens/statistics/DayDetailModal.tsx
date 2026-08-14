import React from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";

interface DayDetailModalProps {
  visible: boolean;
  onClose: () => void;
  month: number;
  day: number;
  focusTime?: string; // 예: "12:34"
  meltedIceCount?: number; // 예: 3
}

export default function DayDetailModal({
  visible,
  onClose,
  month,
  day,
  focusTime = "00:00",
  meltedIceCount = 0,
}: DayDetailModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 배경 오버레이 (클릭 시 팝업 닫힘) */}
      <Pressable
        className="flex-1 items-center justify-center bg-black/40"
        onPress={onClose}
      >
        {/* 모달 본체 (내부 클릭 시 이벤트 전파 방지) */}
        <Pressable
          className="relative w-64 p-4"
          onPress={(e) => e.stopPropagation()}
        >
          {/* 팝업 흰색 배경 */}
          <View className="absolute bottom-1 left-1 right-1 top-1 bg-back/90" />

          {/* 픽셀 테두리라인 */}
          <View className="absolute left-1 right-1 top-0 h-[2px] bg-primary" />
          <View className="absolute bottom-0 left-1 right-1 h-[2px] bg-primary" />
          <View className="absolute bottom-1 left-0 top-1 w-[2px] bg-primary" />
          <View className="absolute bottom-1 right-0 top-1 w-[2px] bg-primary" />

          {/* 내부 컨텐츠 */}
          <View className="relative items-center py-2">
            {/* 날짜 제목 */}
            <Text className="font-maru text-lg text-primary">
              {month}월 {day}일
            </Text>

            {/* 본문 (펭귄 아이콘 + 통계 정보) */}
            <View className="mt-3 w-full flex-row items-center justify-center gap-3">
              <Image
                source={require("../../assets/images/Penguin1.png")}
                className="h-12 w-12"
                resizeMode="contain"
              />

              <View className="flex-col">
                <Text className="font-maru text-xs text-primary">
                  총 집중시간: <Text>{focusTime}</Text>
                </Text>
                <Text className="mt-1 font-maru text-xs text-primary">
                  녹인 얼음 개수: <Text>{meltedIceCount}개</Text>
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
