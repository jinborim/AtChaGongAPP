import { getAdminNotice } from "@/src/features/auth/api/adminApi";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/Header/Header";

const BACKGROUND = require("../../assets/images/Background.png");
const PRIMARY_COLOR = "#18335E";

type NoticeDetail = Awaited<ReturnType<typeof getAdminNotice>>;

export default function Admin5() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const noticeId = Number(id);

    if (!Number.isInteger(noticeId) || noticeId < 1) {
      setLoadError("유효하지 않은 공지 ID입니다.");
      setIsLoading(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setLoadError(null);

    getAdminNotice(noticeId)
      .then((response) => {
        if (isActive) setNotice(response);
      })
      .catch((error: unknown) => {
        if (!isActive) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "공지사항을 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  return (
    <ImageBackground
      source={BACKGROUND}
      resizeMode="cover"
      className="flex-1 bg-back"
    >
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <Header title="공지사항" showBack />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={PRIMARY_COLOR} />
          </View>
        ) : loadError || !notice ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center font-maru text-[14px] text-primary">
              {loadError ?? "공지사항을 찾을 수 없습니다."}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-7 pb-10 pt-8"
          >
            <View className="min-h-[480px] rounded-[8px] border border-gray-100 bg-white px-5 py-6">
              <View className="flex-row items-center">
                {notice.isNew && (
                  <View className="mr-3 rounded-[4px] bg-secondary px-3 py-1">
                    <Text className="font-maru text-[12px] text-white">
                      NEW
                    </Text>
                  </View>
                )}
                <Text className="flex-1 font-maru text-[16px] leading-6 text-primary">
                  {notice.title}
                </Text>
              </View>

              <Text className="mt-3 font-maru text-[12px] text-gray-300">
                {formatApiDate(notice.publishStartsAt)}
              </Text>

              <Text className="mt-8 font-maru text-[12px] leading-6 text-gray-300">
                {notice.content}
              </Text>

              <View className="mt-10">
                <Text className="font-maru text-[16px] text-primary">
                  이벤트 기간
                </Text>
                <Text className="mt-3 font-maru text-[12px] text-gray-300">
                  {formatApiDate(notice.publishStartsAt)} ~{" "}
                  {notice.publishEndsAt
                    ? formatApiDate(notice.publishEndsAt)
                    : "종료일 없음"}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

function formatApiDate(value: string) {
  return value.slice(0, 10);
}
