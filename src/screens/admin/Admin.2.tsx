import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/Header/Header";
import {
  deleteAdminNotice,
  endAdminNotice,
  type AdminNotice,
  getAdminNotices,
  isAdminNoticeEnded,
} from "./noticeStorage";

const BACKGROUND = require("../../assets/images/Background.png");

export default function Admin2() {
  const router = useRouter();
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const reloadNotices = useCallback(async () => {
    setLoadError(null);

    try {
      setNotices(await getAdminNotices());
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "공지사항을 불러오지 못했습니다."
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsLoading(true);
      setLoadError(null);
      getAdminNotices()
        .then((storedNotices) => {
          if (isActive) setNotices(storedNotices);
        })
        .catch((error: unknown) => {
          if (!isActive) return;

          setLoadError(
            error instanceof Error
              ? error.message
              : "공지사항을 불러오지 못했습니다."
          );
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <ImageBackground
      source={BACKGROUND}
      resizeMode="cover"
      className="flex-1 bg-back"
    >
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <Header
          title="공지사항 관리"
          showBack
          rightAction={
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/admin.3")}
              className="rounded-full bg-primary px-4 py-2"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="font-maru text-[12px] text-white">
                + 새 공지 작성
              </Text>
            </Pressable>
          }
        />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator className="text-primary" />
          </View>
        ) : loadError ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center font-maru text-[16px] leading-6 text-primary">
              공지사항을 불러오지 못했습니다
            </Text>
            <Text className="mt-3 text-center font-maru text-[12px] leading-5 text-gray-300">
              {loadError}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setIsLoading(true);
                reloadNotices().finally(() => setIsLoading(false));
              }}
              className="mt-6 rounded-[8px] bg-primary px-5 py-3"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="font-maru text-[12px] text-white">
                다시 시도
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-4 px-7 pb-10 pt-8"
          >
            {notices.length === 0 ? (
              <View className="mt-20 items-center">
                <Text className="font-maru text-[16px] text-primary">
                  작성된 공지사항이 없습니다
                </Text>
                <Text className="mt-3 font-maru text-[12px] text-gray-300">
                  새 공지를 작성해 주세요
                </Text>
              </View>
            ) : (
              notices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  menuOpen={openMenuId === notice.id}
                  onToggleMenu={() =>
                    setOpenMenuId((currentId) =>
                      currentId === notice.id ? null : notice.id
                    )
                  }
                  onEdit={() => {
                    setOpenMenuId(null);
                    router.push({
                      pathname: "/admin.3",
                      params: {
                        id: notice.id,
                        title: notice.title,
                        content: notice.content,
                        startDate: notice.startDate,
                        endDate: notice.endDate,
                      },
                    });
                  }}
                  onEnd={() => {
                    endAdminNotice(notice.id)
                      .then(reloadNotices)
                      .finally(() => setOpenMenuId(null));
                  }}
                  onDelete={() => {
                    deleteAdminNotice(notice.id)
                      .then(reloadNotices)
                      .finally(() => setOpenMenuId(null));
                  }}
                />
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

type NoticeCardProps = {
  notice: AdminNotice;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onEdit: () => void;
  onEnd: () => void;
  onDelete: () => void;
};

function NoticeCard({
  notice,
  menuOpen,
  onToggleMenu,
  onEdit,
  onEnd,
  onDelete,
}: NoticeCardProps) {
  const isEnded = isAdminNoticeEnded(notice);

  return (
    <View
      className={`relative min-h-[96px] rounded-[8px] border border-gray-100 bg-white px-4 py-4 ${
        menuOpen ? "z-20" : "z-0"
      }`}
    >
      <View className="flex-row items-start">
        <View
          className={`mr-3 mt-1 px-3 py-1 ${
            isEnded ? "bg-gray-100" : "bg-secondary"
          }`}
        >
          <Text className="font-maru text-[12px] text-white">
            {isEnded ? "종료" : "게시 중"}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="font-maru text-[16px] leading-6 text-primary">
            {notice.title}
          </Text>
          <Text className="mt-1 font-maru text-[12px] text-gray-300">
            {notice.startDate} ~ {notice.endDate}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="공지사항 메뉴"
          onPress={onToggleMenu}
          className="h-8 w-8 items-center justify-center"
        >
          <Text className="font-maru text-[20px] leading-5 text-gray-300">⋮</Text>
        </Pressable>
      </View>

      {menuOpen && (
        <View className="absolute right-3 top-11 z-10 w-[112px] rounded-[8px] border border-gray-100 bg-white py-1">
          <MenuButton label="수정하기" onPress={onEdit} />
          {!isEnded && <MenuButton label="종료하기" onPress={onEnd} />}
          <MenuButton label="삭제하기" onPress={onDelete} />
        </View>
      )}
    </View>
  );
}

function MenuButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="px-4 py-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <Text className="font-maru text-[12px] text-primary">{label}</Text>
    </Pressable>
  );
}
