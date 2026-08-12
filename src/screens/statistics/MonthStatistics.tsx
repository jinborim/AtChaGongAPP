import Header from "@/src/components/Header/Header";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function MonthStatistics() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 이번 달의 1일이 무슨 요일인지
  // 일요일 = 0, 월요일 = 1 ... 토요일 = 6
  const firstDay = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  // 이번 달이 총 며칠인지
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const moveMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };
  return (
    <ImageBackground
      source={require("../../assets/images/Background.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <Header title="집중기록" />
      <View className="w-full px-7 mt-8">
        {/* 월 이동 */}
        <View className="mb-8 flex-row items-center justify-between">
          <Pressable
            onPress={() => moveMonth(-1)}
            className="h-10 w-10 items-center justify-center"
          >
            <ChevronLeft size={30} color="#183765" strokeWidth={3} />
          </Pressable>

          <Text className="font-maru text-md text-primary">
            {year}년 {month + 1}월
          </Text>

          <Pressable
            onPress={() => moveMonth(1)}
            className="h-10 w-10 items-center justify-center"
          >
            <ChevronRight size={30} color="#183765" strokeWidth={3} />
          </Pressable>
        </View>

        {/* 요일 */}
        <View className="mb-5 flex-row">
          {WEEKDAYS.map((day) => (
            <View key={day} className="w-[14.285%] items-center">
              <Text className="font-maru text-base text-primary">{day}</Text>
            </View>
          ))}
        </View>

        {/* 날짜 박스 */}
        <View className="flex-row flex-wrap">
          {/* 1일 이전의 빈 공간 */}
          {Array.from({ length: firstDay }).map((_, index) => (
            <View
              key={`empty-${index}`}
              className="mb-6 w-[14.285%] items-center"
            />
          ))}

          {/* 실제 날짜 */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;

            return (
              <View key={day} className="mb-6 w-[14.285%] items-center">
                <View className="relative h-10 w-10">
                  {/* 내부 배경 */}
                  <View className="absolute bottom-1 left-1 right-1 top-1 bg-gray-100" />
                  <View className="absolute left-1 right-1 top-0 h-1 bg-primary" />
                  <View className="absolute bottom-0 left-1 right-1 h-1 bg-primary" />
                  <View className="absolute bottom-1 left-0 top-1 w-1 bg-primary" />
                  <View className="absolute bottom-1 right-0 top-1 w-1 bg-primary" />
                </View>
              </View>
            );
          })}
        </View>
        <View className="items-end">
          <Text className="font-maru color-primary text-sm">
            {month + 1}월 집중시간:
          </Text>
          <Text className="font-maru color-primary text-sm">
            {month + 1}월 녹인 컵의 개수:
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}
