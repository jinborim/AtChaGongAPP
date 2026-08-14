import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CalendarDays } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createAdminNotice,
  getAdminNotice,
  updateAdminNotice,
  type AdminNoticeStatus,
} from "@/src/features/auth/api/adminApi";
import Header from "../../components/Header/Header";
import Admin4 from "./Admin.4";

const BACKGROUND = require("../../assets/images/Background.png");
const PRIMARY_COLOR = "#18335E";
const PLACEHOLDER_COLOR = "#A2AAB0";

export default function Admin3() {
  const today = startOfDay(new Date());
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    content?: string;
    startDate?: string;
    endDate?: string;
  }>();
  const editingStartDate = parseDate(params.startDate) ?? today;
  const editingEndDate = parseDate(params.endDate) ?? today;
  const [title, setTitle] = useState(params.title ?? "");
  const [content, setContent] = useState(params.content ?? "");
  const [isImmediate, setIsImmediate] = useState(
    formatDate(editingStartDate) === formatDate(today)
  );
  const [startDate, setStartDate] = useState(editingStartDate);
  const [endDate, setEndDate] = useState(editingEndDate);
  const [pickerTarget, setPickerTarget] = useState<"start" | "end" | null>(
    null
  );
  const [draftDate, setDraftDate] = useState(new Date());
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNotice, setIsLoadingNotice] = useState(Boolean(params.id));
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [noticeStatus, setNoticeStatus] =
    useState<AdminNoticeStatus>("published");

  useEffect(() => {
    if (!params.id) return;

    const noticeId = Number(params.id);
    if (!Number.isInteger(noticeId) || noticeId < 1) {
      Alert.alert("공지 조회 실패", "유효하지 않은 공지 ID입니다.");
      setIsLoadingNotice(false);
      return;
    }

    let isActive = true;
    const currentDay = startOfDay(new Date());
    setIsLoadingNotice(true);

    getAdminNotice(noticeId)
      .then((notice) => {
        if (!isActive) return;

        const loadedStartDate =
          parseDate(notice.publishStartsAt) ?? currentDay;
        const loadedEndDate = parseDate(notice.publishEndsAt) ?? loadedStartDate;

        setTitle(notice.title);
        setContent(notice.content);
        setImgUrl(notice.imgUrl);
        setNoticeStatus(notice.status);
        setStartDate(loadedStartDate);
        setEndDate(loadedEndDate);
        setIsImmediate(
          formatDate(loadedStartDate) === formatDate(currentDay),
        );
      })
      .catch((error: unknown) => {
        if (!isActive) return;

        Alert.alert(
          "공지 조회 실패",
          error instanceof Error
            ? error.message
            : "공지 내용을 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoadingNotice(false);
      });

    return () => {
      isActive = false;
    };
  }, [params.id]);

  const openDatePicker = (target: "start" | "end") => {
    if (isImmediate && target === "start") return;

    setDraftDate(target === "start" ? startDate : endDate);
    setPickerTarget(target);
  };

  const selectImmediatePosting = () => {
    const currentDate = startOfDay(new Date());

    setIsImmediate(true);
    setStartDate(currentDate);
    setEndDate((currentEndDate) =>
      currentEndDate < currentDate ? currentDate : currentEndDate
    );
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === "dismissed" || !selectedDate) {
      setPickerTarget(null);
      return;
    }

    if (Platform.OS === "ios") {
      setDraftDate(selectedDate);
      return;
    }

    applySelectedDate(selectedDate);
    setPickerTarget(null);
  };

  const applySelectedDate = (selectedDate: Date) => {

    if (pickerTarget === "start") {
      setStartDate(selectedDate);

      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
      return;
    }

    if (pickerTarget === "end") {
      setEndDate(selectedDate);
    }
  };

  const confirmIOSDate = () => {
    applySelectedDate(draftDate);
    setPickerTarget(null);
  };

  const submitNotice = async () => {
    if (
      !title.trim() ||
      !content.trim() ||
      isSubmitting ||
      isLoadingNotice
    )
      return;

    setIsSubmitting(true);

    try {
      const noticeValues = {
        title: title.trim(),
        content: content.trim(),
        imgUrl,
        status: noticeStatus,
        publishStartsAt: startOfDay(startDate).toISOString(),
        publishEndsAt: endOfDay(endDate).toISOString(),
      };

      if (params.id) {
        const noticeId = Number(params.id);

        if (!Number.isInteger(noticeId) || noticeId < 1) {
          throw new Error("유효하지 않은 공지 ID입니다.");
        }

        await updateAdminNotice(noticeId, noticeValues);
      } else {
        await createAdminNotice(noticeValues);
      }
      router.replace("/admin.2" as never);
    } catch (error) {
      console.error("관리자 공지 저장 실패:", error);
      Alert.alert(
        "공지 저장에 실패했어요",
        "공지를 저장하거나 목록 화면으로 이동하지 못했습니다. 다시 시도해 주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showPreview) {
    return (
      <Admin4
        noticeTitle={title}
        noticeContent={content}
        startDate={formatDate(startDate)}
        endDate={formatDate(endDate)}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <ImageBackground
      source={BACKGROUND}
      resizeMode="cover"
      className="flex-1 bg-back"
    >
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Header
            title={params.id ? "공지 수정" : "새 공지 작성"}
            showBack
            rightAction={
              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isSubmitting || isLoadingNotice,
                }}
                disabled={isSubmitting || isLoadingNotice}
                onPress={() => {
                  void submitNotice();
                }}
                className="rounded-full bg-primary px-5 py-2"
                style={({ pressed }) => ({
                  opacity: pressed || isSubmitting || isLoadingNotice ? 0.7 : 1,
                })}
              >
                <Text className="font-maru text-[12px] text-white">
                  {params.id ? "수정" : "작성"}
                </Text>
              </Pressable>
            }
          />

          {isLoadingNotice ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={PRIMARY_COLOR} />
            </View>
          ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-7 pb-10 pt-8"
            keyboardShouldPersistTaps="handled"
          >
            <Text className="font-maru text-[12px] text-primary">제목</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              placeholder="공지 제목을 입력하세요"
              placeholderTextColor={PLACEHOLDER_COLOR}
              className="mt-3 h-12 rounded-[8px] border border-gray-100 bg-white px-4 font-maru text-[12px] text-primary"
            />

            <Text className="mt-7 font-maru text-[12px] text-primary">
              내용
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="공지 내용을 입력하세요"
              placeholderTextColor={PLACEHOLDER_COLOR}
              multiline
              textAlignVertical="top"
              className="mt-3 h-[180px] rounded-[8px] border border-gray-100 bg-white p-4 font-maru text-[12px] leading-5 text-primary"
            />

            <Text className="mt-8 font-maru text-[12px] text-primary">
              게시 기간
            </Text>
            <View className="mt-3 rounded-[8px] border border-gray-100 bg-white px-5 py-4">
              <View className="flex-row items-center gap-8">
                <PeriodOption
                  label="즉시 게시"
                  selected={isImmediate}
                  onPress={selectImmediatePosting}
                />
                <PeriodOption
                  label="기간 설정"
                  selected={!isImmediate}
                  onPress={() => setIsImmediate(false)}
                />
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <DateField
                  label="시작일"
                  date={formatDate(startDate)}
                  onPress={() => openDatePicker("start")}
                  disabled={isImmediate}
                />
                <Text className="font-maru text-[16px] text-primary">↔</Text>
                <DateField
                  label="종료일"
                  date={formatDate(endDate)}
                  onPress={() => openDatePicker("end")}
                />
              </View>
            </View>

            {pickerTarget && Platform.OS !== "ios" && (
              <DateTimePicker
                value={pickerTarget === "start" ? startDate : endDate}
                mode="date"
                display="default"
                minimumDate={pickerTarget === "end" ? startDate : today}
                onChange={handleDateChange}
              />
            )}

            <View className="mt-7 flex-row items-center justify-between">
              <Text className="font-maru text-[12px] text-primary">
                미리보기
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowPreview(true)}
                className="rounded-full bg-secondary px-5 py-2"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="font-maru text-[12px] text-white">
                  미리보기
                </Text>
              </Pressable>
            </View>
          </ScrollView>
          )}

          <Modal
            visible={pickerTarget !== null && Platform.OS === "ios"}
            transparent
            animationType="fade"
            onRequestClose={() => setPickerTarget(null)}
          >
            <View className="flex-1 justify-end bg-primary/20">
              <Pressable
                accessibilityLabel="날짜 선택 닫기"
                className="absolute inset-0"
                onPress={() => setPickerTarget(null)}
              />

              <View className="rounded-t-[20px] bg-white px-5 pb-8 pt-4">
                <View className="flex-row items-center justify-between">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setPickerTarget(null)}
                    className="px-3 py-2"
                  >
                    <Text className="font-maru text-[12px] text-gray-300">
                      취소
                    </Text>
                  </Pressable>

                  <Text className="font-maru text-[16px] text-primary">
                    {pickerTarget === "start" ? "시작일 선택" : "종료일 선택"}
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    onPress={confirmIOSDate}
                    className="px-3 py-2"
                  >
                    <Text className="font-maru text-[12px] text-secondary">
                      완료
                    </Text>
                  </Pressable>
                </View>

                <DateTimePicker
                  value={draftDate}
                  mode="date"
                  display="spinner"
                  themeVariant="light"
                  textColor={PRIMARY_COLOR}
                  minimumDate={pickerTarget === "end" ? startDate : today}
                  onChange={handleDateChange}
                />
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

type PeriodOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function PeriodOption({ label, selected, onPress }: PeriodOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="flex-row items-center"
    >
      <View
        className={`h-4 w-4 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary" : "border-gray-300"
        }`}
      >
        {selected && <View className="h-2 w-2 rounded-full bg-primary" />}
      </View>
      <Text className="ml-2 font-maru text-[12px] text-primary">{label}</Text>
    </Pressable>
  );
}

type DateFieldProps = {
  label: string;
  date: string;
  onPress: () => void;
  disabled?: boolean;
};

function DateField({
  label,
  date,
  onPress,
  disabled = false,
}: DateFieldProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} 선택`}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      className={`h-[52px] w-[120px] flex-row items-center justify-between rounded-[7px] border border-gray-100 bg-white px-3 ${
        disabled ? "opacity-50" : "opacity-100"
      }`}
    >
      <View>
        <Text className="font-maru text-[12px] text-gray-300">{label}</Text>
        <Text className="mt-1 font-maru text-[12px] text-gray-300">{date}</Text>
      </View>
      <CalendarDays size={18} color={PRIMARY_COLOR} strokeWidth={2} />
    </Pressable>
  );
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function parseDate(value?: string | null) {
  if (!value) return null;

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return startOfDay(parsedDate);
}
