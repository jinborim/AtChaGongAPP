import React from "react";
import { ImageBackground, ScrollView, View } from "react-native";

import Header from "@/src/components/Header/Header";
import NoticeCard from "../../components/NoticeCard/NoticeCard";

// 예시 데이터
const NOTICE_DATA = [
  {
    id: "1",
    isNew: true,
    title: "여름 이벤트 안내",
    description: "무더운 여름, 특별 이벤트가 시작 됩니다.",
    date: "2026-08-01",
    href: "/notice/1",
  },
  {
    id: "2",
    isNew: false,
    title: "점검 안내(8/5)",
    description: "안정적인 서비스 제공을 위한 점검이 필요합니다.",
    date: "2026-08-05",
    href: "/notice/2",
  },
  {
    id: "3",
    isNew: false,
    title: "업데이트 소식",
    description: "안정적인 서비스 제공을 위한 점검이 필요합니다.",
    date: "2026-08-05",
    href: "/notice/3",
  },
  {
    id: "4",
    isNew: false,
    title: "버그 수정 안내 (완료)",
    description: "안정적인 서비스 제공을 위한 점검이 완료되었습니다.",
    date: "2026-08-05",
    href: "/notice/4",
  },
];

export default function NoticePage() {
  return (
    <ImageBackground
      source={require("../../assets/images/Background.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <Header title="공지사항" showBack />

      <ScrollView
        className="flex-1 px-4 pt-12"
        showsVerticalScrollIndicator={false}
      >
        {NOTICE_DATA.map((item) => (
          <NoticeCard
            key={item.id}
            isNew={item.isNew}
            title={item.title}
            description={item.description}
            date={item.date}
            href={item.href}
          />
        ))}
        {/* 하단 여백 확보 */}
        <View className="h-10" />
      </ScrollView>
    </ImageBackground>
  );
}
