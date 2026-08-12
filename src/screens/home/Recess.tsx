import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NavigationBar from "../../components/NavigationBar/NavigationBar";
import { BREAK_MINUTES, MIN_CYCLE_COUNT } from "../../constants/timer";
import { parseStoredCycleCount } from "../../utils/timerSettings";

const BREAK_DURATION = BREAK_MINUTES * 60 * 1000;

export default function CoolingScreen() {
  const router = useRouter();
  const [cycleCount, setCycleCount] = useState(MIN_CYCLE_COUNT);
  const [currentCycle, setCurrentCycle] = useState(MIN_CYCLE_COUNT);
  const [remainingMilliseconds, setRemainingMilliseconds] =
    useState(BREAK_DURATION);
  const [endTime, setEndTime] = useState<number | null>(null);

  useEffect(() => {
    const startRest = async () => {
      const [savedCycleCount, savedCurrentCycle] = await Promise.all([
        AsyncStorage.getItem("cycleCount"),
        AsyncStorage.getItem("currentCycle"),
      ]);

      const cycles = parseStoredCycleCount(savedCycleCount);
      const activeCycle = Math.min(
        cycles,
        parseStoredCycleCount(savedCurrentCycle)
      );

      setCycleCount(cycles);
      setCurrentCycle(activeCycle);
      setRemainingMilliseconds(BREAK_DURATION);
      setEndTime(Date.now() + BREAK_DURATION);
    };

    startRest().catch((error) =>
      console.log("휴식 설정 불러오기 오류:", error)
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

        const nextCycle = Math.min(cycleCount, currentCycle + 1);
        Promise.all([
          AsyncStorage.setItem("currentCycle", String(nextCycle)),
          AsyncStorage.setItem("autoStartFocus", "true"),
        ])
          .then(() => router.replace("/router/homeSetting"))
          .catch((error) => console.log("다음 사이클 시작 오류:", error));
      }
    }, 50);

    return () => clearInterval(timer);
  }, [currentCycle, cycleCount, endTime, router]);

  const minutes = Math.floor(remainingMilliseconds / 60000);
  const seconds = Math.floor((remainingMilliseconds % 60000) / 1000);
  const centiseconds = Math.floor((remainingMilliseconds % 1000) / 10);
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}:${String(centiseconds).padStart(2, "0")}`;

  return (
    <ImageBackground
      source={require("../../assets/images/Homebg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 items-center">
        <View className="mt-14">
          <Text className="font-maru text-2xl font-bold text-primary">
            {currentCycle}회
          </Text>
        </View>

        <View className="mt-6 flex-row gap-2">
          {Array.from({ length: cycleCount }).map((_, index) => (
            <View
              key={index}
              className={
                index < currentCycle
                  ? "h-1 w-12 rounded-[4px] bg-primary"
                  : "h-1 w-12 rounded-[4px] bg-gray-300 opacity-[0.35]"
              }
            />
          ))}
        </View>

        <View className="mt-11">
          <Text className="font-maru text-[52px] font-bold text-primary">
            {formattedTime}
          </Text>
        </View>

        <Text className="mt-8 font-maru text-base font-bold text-gray-300">
          얼음을 다시 냉장고에 넣는중...
        </Text>

        <Image
          source={require("../../assets/images/EmptyCup.png")}
          className="h-[300px] w-[220px]"
          resizeMode="contain"
        />

        <NavigationBar fixedToBottom />
      </SafeAreaView>
    </ImageBackground>
  );
}
