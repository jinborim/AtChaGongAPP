import Header from "@/src/components/Header/Header";
import NavigationBar from "@/src/components/NavigationBar/NavigationBar";
import { useMonthStatistics } from "@/src/features/statistics/hooks/useStatistics";
import { ChevronLeft, ChevronRight, Star } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";
import DayDetailModal from "./DayDetailModal";
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function MonthStatistics() {
  const {
    year,
    month,
    monthData,
    selectedDate,
    selectedDayDetail,
    isLoadingMonth,
    isLoadingDay,
    moveMonth,
    selectDay,
  } = useMonthStatistics();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const dayIntensityMap = useMemo(() => {
    const map = new Map<number, number>();
    if (monthData?.days) {
      monthData.days.forEach((item) => {
        // "YYYY-MM-DD"에서 DD 추출
        const dayNum = parseInt(item.date.split("-")[2], 10);
        map.set(dayNum, item.intensityLevel);
      });
    }
    return map;
  }, [monthData]);

  const firstDay = useMemo(() => {
    return new Date(year, month - 1, 1).getDay();
  }, [year, month]);

  const daysInMonth = useMemo(() => {
    return new Date(year, month, 0).getDate(); // month월의 0일 = month월 1일의 전날 (즉, 해당 월 마지막날)
  }, [year, month]);

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
    selectDay(day); // API 호출
  };
  // intensity 수치에 따라 색상 변동
  const getIntensityBgClass = (intensity: number) => {
    if (intensity <= 0) return "bg-gray-100";
    if (intensity <= 2) return "bg-[#B7DEFF]";
    if (intensity <= 4) return "bg-secondary";
    return "bg-[#4088FD]"; // 5 이상
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
            {year}년 {month}월
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
            const intensity = dayIntensityMap.get(day) || 0; // 해당 날짜의 intensityLevel

            return (
              <Pressable
                key={day}
                onPress={() => handleDayPress(day)}
                className="mb-5 w-[14.285%] items-center"
              >
                <View className="relative h-10 w-10">
                  {/* 내부 배경 */}
                  <View
                    className={`absolute bottom-1 left-1 right-1 top-1 ${getIntensityBgClass(intensity)}`}
                  />

                  <View className="absolute left-1 right-1 top-0 h-1 bg-primary" />
                  <View className="absolute bottom-0 left-1 right-1 h-1 bg-primary" />
                  <View className="absolute bottom-1 left-0 top-1 w-1 bg-primary" />
                  <View className="absolute bottom-1 right-0 top-1 w-1 bg-primary" />
                  <View className="flex-1 items-center justify-center">
                    <Text className="font-maru text-xs text-primary">
                      {day}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View className="items-end">
          <Text className="font-maru color-primary text-sm">
            {month}월 집중시간:
            {monthData ? monthData.totalFocusedTimeFormatted : "00:00:00"}
          </Text>
          <Text className="font-maru color-primary text-sm">
            {month}월 녹인 컵의 개수:
            {monthData ? `${monthData.completedCupCount}개` : "0개"}
          </Text>
        </View>
        <View className="relative mx-5 mt-5 h-[100px]">
          {/* 박스 배경 */}
          <View className="absolute bottom-1 left-1 right-1 top-1 bg-white" />

          {/* 픽셀 테두리 */}
          <View className="absolute left-1 right-1 top-0 h-[2px] bg-primary" />
          <View className="absolute bottom-0 left-1 right-1 h-[2px] bg-primary" />
          <View className="absolute bottom-1 left-0 top-1 w-[2px] bg-primary" />
          <View className="absolute bottom-1 right-0 top-1 w-[2px] bg-primary" />

          {/* 픽셀 그림자 */}
          <View className="absolute -bottom-1 left-2 right-0 h-[3px] bg-gray-100" />
          <View className="absolute -right-1 bottom-2 top-2 w-[3px] bg-gray-100" />

          {/* 내용 */}
          <View className="flex-1 items-center justify-center pr-14">
            <Text className="font-maru text-lg text-primary">
              이번달 최대 집중 날
            </Text>

            {monthData?.bestDay ? (
              <>
                <Text className="mt-1 font-maru text-xl text-primary">
                  {parseInt(monthData.bestDay.date.split("-")[1], 10)}월{" "}
                  {parseInt(monthData.bestDay.date.split("-")[2], 10)}일
                </Text>

                <Text className="mt-2 font-maru text-sm text-primary">
                  총 시간: {monthData.bestDayFormattedTime} | 녹인 얼음:{" "}
                  {monthData.bestDay.completedCupCount}개
                </Text>
              </>
            ) : (
              <Text className="mt-2 font-maru text-sm text-gray-300">
                집중 기록이 없습니다.
              </Text>
            )}
          </View>

          {/* 별 */}
          <View className="absolute right-5 top-1/2 -translate-y-1/2">
            <Star size={42} color="#183765" fill="#FFB928" />
          </View>
        </View>
      </View>
      <DayDetailModal
        visible={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        month={month}
        day={selectedDay ?? 1}
        focusTime={
          selectedDayDetail
            ? selectedDayDetail.totalFocusedTimeFormatted
            : "00:00:00"
        }
        meltedIceCount={
          selectedDayDetail ? selectedDayDetail.completedCupCount : 0
        }
      />
      <NavigationBar />
    </ImageBackground>
  );
}
