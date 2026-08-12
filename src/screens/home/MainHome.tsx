// 메인 홈 퍼블리싱 화면
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NavigationBar from "../../components/NavigationBar/NavigationBar";
import {
  DEFAULT_FOCUS_MINUTES,
  MIN_CYCLE_COUNT,
} from "../../constants/timer";
import {
  parseStoredCycleCount,
  parseStoredFocusMinutes,
} from "../../utils/timerSettings";
import Complete from "./Complete";

export default function StudyScreen() {
  const router = useRouter();
  const [remainingMilliseconds, setRemainingMilliseconds] = useState(
    DEFAULT_FOCUS_MINUTES * 60 * 1000
  );
  const [isRunning, setIsRunning] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [cycleCount, setCycleCount] = useState(MIN_CYCLE_COUNT);
  const [currentCycle, setCurrentCycle] = useState(MIN_CYCLE_COUNT);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsSettingsLoaded(false);

      const loadTimerSettings = async () => {
        const [
          savedFocusMinutes,
          savedCycleCount,
          savedCurrentCycle,
          autoStartFocus,
        ] = await Promise.all([
          AsyncStorage.getItem("focusMinutes"),
          AsyncStorage.getItem("cycleCount"),
          AsyncStorage.getItem("currentCycle"),
          AsyncStorage.getItem("autoStartFocus"),
        ]);
        const minutes = parseStoredFocusMinutes(savedFocusMinutes);
        const cycles = parseStoredCycleCount(savedCycleCount);
        const activeCycle = parseStoredCycleCount(savedCurrentCycle);
        const duration = minutes * 60 * 1000;

        setCycleCount(cycles);
        setCurrentCycle(Math.min(cycles, activeCycle));
        setRemainingMilliseconds(duration);

        if (autoStartFocus === "true") {
          await AsyncStorage.removeItem("autoStartFocus");
          setEndTime(Date.now() + duration);
          setIsRunning(true);
        }
      };

      loadTimerSettings()
        .catch((error) =>
          console.log("타이머 설정 불러오기 오류:", error)
        )
        .finally(() => setIsSettingsLoaded(true));
    }, [])
  );

  useEffect(() => {
    if (!isRunning || endTime === null) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setRemainingMilliseconds(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        setIsRunning(false);
        setEndTime(null);

        if (currentCycle < cycleCount) {
          router.replace("/router/RestSetting");
        } else {
          AsyncStorage.multiRemove(["currentCycle", "autoStartFocus"]).catch(
            (error) => console.log("사이클 완료 정보 정리 오류:", error)
          );
          setShowCompleteModal(true);
        }
      }
    }, 50);

    return () => clearInterval(timer);
  }, [currentCycle, cycleCount, endTime, isRunning, router]);

  const minutes = Math.floor(remainingMilliseconds / 60000);
  const seconds = Math.floor((remainingMilliseconds % 60000) / 1000);
  const centiseconds = Math.floor((remainingMilliseconds % 1000) / 10);
  const formattedTime = isRunning
    ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}:${String(centiseconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const startTimer = async () => {
    if (!isSettingsLoaded || isRunning || remainingMilliseconds === 0) return;

    await AsyncStorage.setItem("currentCycle", String(currentCycle));
    setEndTime(Date.now() + remainingMilliseconds);
    setIsRunning(true);
  };

  const closeCompleteModal = async () => {
    const savedFocusMinutes = await AsyncStorage.getItem("focusMinutes");
    const minutes = parseStoredFocusMinutes(savedFocusMinutes);

    setCurrentCycle(MIN_CYCLE_COUNT);
    setRemainingMilliseconds(minutes * 60 * 1000);
    setShowCompleteModal(false);
  };

  return (
    <ImageBackground
      source={require("../../assets/images/Homebg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 items-center">
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/images/Penguin1.png")}
            className="mr-3 h-20 w-20"
          />

          <ImageBackground
            source={require("../../assets/images/SpeechBubble.png")}
            className="h-[120px] w-[240px] items-center justify-center"
            resizeMode="contain"
          >
            <Text className="font-maru text-base leading-6 text-primary">
              안녕하세요 사용자님{"\n"}
              음료가 준비되었어요.{"\n"}
              함께 얼음을 녹여 볼까요?
            </Text>
          </ImageBackground>
        </View>

        <View className="mt-12">
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isRunning}
            onPress={() => router.push("/router/TimerSetting")}
          >
            <Text className="font-maru text-[52px] font-bold text-primary">
              {formattedTime}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center">
          <Image
            source={require("../../assets/images/Icecup1.png")}
            className="mt-7 h-[300px] w-[220px]"
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          className={`mt-4 h-[72px] w-[100px] items-center justify-center ${
            isRunning
              ? "opacity-0"
              : isSettingsLoaded
                ? "opacity-100"
                : "opacity-50"
          }`}
          disabled={
            !isSettingsLoaded || isRunning || remainingMilliseconds === 0
          }
          onPress={startTimer}
        >
          <Image
            source={require("../../assets/images/PlayButton.png")}
            className="h-[72px] w-[100px]"
            resizeMode="contain"
          />
        </TouchableOpacity>

        <NavigationBar />

        <Complete
          visible={showCompleteModal}
          onClose={() => {
            closeCompleteModal().catch((error) =>
              console.log("완료 모달 닫기 오류:", error)
            );
          }}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}
