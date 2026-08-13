// 타이머 설정 퍼블리싱 화면
import Header from "@/src/components/Header/Header";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BREAK_MINUTES,
  CYCLE_COUNT_STEP,
  DEFAULT_FOCUS_MINUTES,
  FOCUS_MINUTES_STEP,
  MAX_CYCLE_COUNT,
  MAX_FOCUS_MINUTES,
  MIN_CYCLE_COUNT,
  MIN_FOCUS_MINUTES,
} from "../../constants/timer";
import {
  parseStoredCycleCount,
  parseStoredFocusMinutes,
} from "../../utils/timerSettings";

type SettingCardProps = {
  label: string;
  value: number;
  unit: string;
  adjustable?: boolean;
  cycleCount?: number;
  onDecrease?: () => void;
  onIncrease?: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
};

function SettingCard({
  label,
  value,
  unit,
  adjustable = false,
  cycleCount,
  onDecrease,
  onIncrease,
  decreaseDisabled = false,
  increaseDisabled = false,
}: SettingCardProps) {
  return (
    <View
      className={`${
        cycleCount === undefined ? "mb-4" : "mb-3"
      } h-[124px] w-[80%] self-center rounded-[12px] border border-gray-100 bg-white px-5 pt-5`}
    >
      <View className="flex-row items-center">
        <View className="mr-2 h-4 w-4 rounded-full bg-secondary" />
        <Text className="font-maru text-base text-primary">{label}</Text>
      </View>

      <View
        className={`mt-3 flex-row items-center ${
          adjustable ? "justify-between" : "justify-center"
        }`}
      >
        {adjustable && (
          <TouchableOpacity
            className={`h-9 w-9 items-center justify-center rounded-full border border-gray-300 ${
              decreaseDisabled ? "opacity-30" : ""
            }`}
            activeOpacity={0.6}
            disabled={decreaseDisabled}
            onPress={onDecrease}
          >
            <Ionicons name="remove" size={24} color="#17386B" />
          </TouchableOpacity>
        )}

        <View className="flex-row items-end">
          <Text className="font-maru text-[36px] text-primary">{value}</Text>
          <Text className="mb-2 ml-1 font-maru text-[12px] text-gray-300">
            {unit}
          </Text>
        </View>

        {adjustable && (
          <TouchableOpacity
            className={`h-9 w-9 items-center justify-center rounded-full border border-gray-300 ${
              increaseDisabled ? "opacity-30" : ""
            }`}
            activeOpacity={0.6}
            disabled={increaseDisabled}
            onPress={onIncrease}
          >
            <Ionicons name="add" size={24} color="#17386B" />
          </TouchableOpacity>
        )}
      </View>

      {cycleCount !== undefined && (
        <View className="mt-3 flex-row items-center justify-between px-0.5">
          {Array.from({ length: MAX_CYCLE_COUNT }).map((_, index) => (
            <View
              key={index}
              className={[
                "h-1 w-[23%] rounded-full",
                index < cycleCount ? "bg-primary" : "bg-primary/25",
              ].join(" ")}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function TimerSettingScreen() {
  const router = useRouter();
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [cycleCount, setCycleCount] = useState(MIN_CYCLE_COUNT);

  useEffect(() => {
    const loadSettings = async () => {
      const [savedFocusMinutes, savedCycleCount] = await Promise.all([
        AsyncStorage.getItem("focusMinutes"),
        AsyncStorage.getItem("cycleCount"),
      ]);

      setFocusMinutes(parseStoredFocusMinutes(savedFocusMinutes));
      setCycleCount(parseStoredCycleCount(savedCycleCount));
    };

    loadSettings().catch((error) =>
      console.log("타이머 설정 불러오기 오류:", error),
    );
  }, []);

  const saveSettings = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem("focusMinutes", String(focusMinutes)),
        AsyncStorage.setItem("cycleCount", String(cycleCount)),
      ]);
      router.back();
    } catch (error) {
      console.log("타이머 설정 저장 오류:", error);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/Background.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="relative flex-1">
        <Header title="타이머 설정" showBack />

        <View className="w-full flex-1 pt-12">
          <SettingCard
            label="집중 시간"
            value={focusMinutes}
            unit="분"
            adjustable
            decreaseDisabled={focusMinutes <= MIN_FOCUS_MINUTES}
            increaseDisabled={focusMinutes >= MAX_FOCUS_MINUTES}
            onDecrease={() =>
              setFocusMinutes((previous) =>
                Math.max(MIN_FOCUS_MINUTES, previous - FOCUS_MINUTES_STEP),
              )
            }
            onIncrease={() =>
              setFocusMinutes((previous) =>
                Math.min(MAX_FOCUS_MINUTES, previous + FOCUS_MINUTES_STEP),
              )
            }
          />
          <SettingCard label="휴식 시간" value={BREAK_MINUTES} unit="분 고정" />
          <SettingCard
            label="반복 횟수"
            value={cycleCount}
            unit="회"
            adjustable
            cycleCount={cycleCount}
            decreaseDisabled={cycleCount <= MIN_CYCLE_COUNT}
            increaseDisabled={cycleCount >= MAX_CYCLE_COUNT}
            onDecrease={() =>
              setCycleCount((previous) =>
                Math.max(MIN_CYCLE_COUNT, previous - CYCLE_COUNT_STEP),
              )
            }
            onIncrease={() =>
              setCycleCount((previous) =>
                Math.min(MAX_CYCLE_COUNT, previous + CYCLE_COUNT_STEP),
              )
            }
          />
        </View>

        <View className="absolute bottom-4 w-[80%] self-center pb-10">
          <TouchableOpacity
            className="h-12 w-full items-center justify-center rounded-[8px] bg-primary"
            activeOpacity={0.6}
            onPress={saveSettings}
          >
            <Text className="font-maru text-base text-white">저장하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
