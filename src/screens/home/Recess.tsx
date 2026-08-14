import TimerProgressBar from "@/src/components/TimerProgressBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NavigationBar from "../../components/NavigationBar/NavigationBar";
import {
  DEFAULT_CYCLE_COUNT,
  DEFAULT_FOCUS_MINUTES,
  getBreakDurationMilliseconds,
  MIN_CYCLE_COUNT,
} from "../../constants/timer";
import {
  parseStoredCycleCount,
  parseStoredFocusMinutes,
} from "../../utils/timerSettings";

const BREAK_DURATION = getBreakDurationMilliseconds();

export default function CoolingScreen() {
  const router = useRouter();
  const [cycleCount, setCycleCount] = useState(DEFAULT_CYCLE_COUNT);
  const [currentCycle, setCurrentCycle] = useState(MIN_CYCLE_COUNT);
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [remainingMilliseconds, setRemainingMilliseconds] =
    useState(BREAK_DURATION);
  const [endTime, setEndTime] = useState<number | null>(null);

  useEffect(() => {
    const startRest = async () => {
      const [savedCycleCount, savedFocusMinutes] = await Promise.all([
        AsyncStorage.getItem("cycleCount"),
        AsyncStorage.getItem("focusMinutes"),
      ]);

      const cycles = parseStoredCycleCount(savedCycleCount);

      setCycleCount(cycles);
      setCurrentCycle(MIN_CYCLE_COUNT);
      setFocusMinutes(parseStoredFocusMinutes(savedFocusMinutes));
      setRemainingMilliseconds(BREAK_DURATION);
      setEndTime(Date.now() + BREAK_DURATION);
    };

    startRest().catch((error) =>
      console.log("휴식 설정 불러오기 오류:", error),
    );
  }, []);

  useEffect(() => {
    if (endTime === null) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setRemainingMilliseconds(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        setEndTime(null);

        router.replace("/router/homeSetting");
      }
    }, 50);

    return () => clearInterval(timer);
  }, [endTime, router]);

  const minutes = Math.floor(remainingMilliseconds / 60000);
  const seconds = Math.floor((remainingMilliseconds % 60000) / 1000);
  const centiseconds = Math.floor((remainingMilliseconds % 1000) / 10);
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}:${String(centiseconds).padStart(2, "0")}`;
  const breakProgress =
    BREAK_DURATION === 0 ? 0 : 1 - remainingMilliseconds / BREAK_DURATION;

  return (
    <ImageBackground
      source={require("../../assets/images/HomeBg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 items-center">
        <View className="mt-14">
          <Text className="font-maru text-2xl font-bold text-primary">
            {currentCycle}회
          </Text>
        </View>

        <View className="mt-6 w-[80%]">
          <TimerProgressBar
            cycleCount={cycleCount}
            focusMinutes={focusMinutes}
            activeCycle={currentCycle}
            activeProgress={breakProgress}
            phase="break"
            heightClassName="h-1"
          />
        </View>

        <View className="mt-11">
          <Text className="font-maru text-[52px] font-bold text-primary">
            {formattedTime}
          </Text>
        </View>

        <Text className="mt-8 font-maru text-base font-bold text-gray-300">
          얼음을 다시 냉장고에 넣는중...
        </Text>

        <View className="flex-1 justify-center">
          <Image
            source={require("../../assets/images/EmptyCup.png")}
            className="mt-7 h-[300px] w-[220px]"
            resizeMode="contain"
          />
        </View>

        <View className="mt-4 h-[72px] w-[100px]" />

        <NavigationBar />
      </SafeAreaView>
    </ImageBackground>
  );
}
