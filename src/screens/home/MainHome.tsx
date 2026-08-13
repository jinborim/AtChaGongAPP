// 메인 홈 퍼블리싱 화면
import CustomModal from "@/src/components/Modal/CustomModal";
import {
  getStatisticsSummary,
  type StatisticsSummary,
} from "@/src/features/statistics";
import { getTimerSettings, type Beverage } from "@/src/features/timer";
import { getMe } from "@/src/features/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import { DEFAULT_FOCUS_MINUTES, MIN_CYCLE_COUNT } from "../../constants/timer";
import {
  normalizeCycleCount,
  normalizeFocusMinutes,
  parseStoredCycleCount,
  parseStoredFocusMinutes,
} from "../../utils/timerSettings";

const DEFAULT_NICKNAME = "사용자";

export default function StudyScreen() {
  const router = useRouter();
  const [remainingMilliseconds, setRemainingMilliseconds] = useState(
    DEFAULT_FOCUS_MINUTES * 60 * 1000,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [cycleCount, setCycleCount] = useState(MIN_CYCLE_COUNT);
  const [currentCycle, setCurrentCycle] = useState(MIN_CYCLE_COUNT);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [nickname, setNickname] = useState(DEFAULT_NICKNAME);
  const [beverage, setBeverage] = useState<Beverage | null>(null);
  const [todaySummary, setTodaySummary] = useState<StatisticsSummary | null>(
    null,
  );
  const isRunningRef = useRef(isRunning);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

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

        if (!isActive) return;

        setCycleCount(cycles);
        setCurrentCycle(Math.min(cycles, activeCycle));
        setRemainingMilliseconds(duration);

        if (autoStartFocus === "true") {
          await AsyncStorage.removeItem("autoStartFocus");
          setEndTime(Date.now() + duration);
          setIsRunning(true);
        }

        try {
          const [me, timerSettings, statisticsSummary] = await Promise.all([
            getMe(),
            getTimerSettings(),
            getStatisticsSummary("TODAY"),
          ]);

          if (!isActive) return;

          const serverFocusMinutes = normalizeFocusMinutes(
            timerSettings.focusMinutes,
          );
          const serverCycleCount = normalizeCycleCount(
            timerSettings.cycleCount,
          );
          const serverDuration = serverFocusMinutes * 60 * 1000;

          setNickname(me.nickname || DEFAULT_NICKNAME);
          setBeverage(timerSettings.beverage);
          setTodaySummary(statisticsSummary);
          setCycleCount(serverCycleCount);
          setCurrentCycle((previous) =>
            Math.min(serverCycleCount, previous),
          );

          if (!isRunningRef.current) {
            setRemainingMilliseconds(serverDuration);
          }

          await Promise.all([
            AsyncStorage.setItem(
              "focusMinutes",
              String(serverFocusMinutes),
            ),
            AsyncStorage.setItem("cycleCount", String(serverCycleCount)),
          ]);
        } catch (error) {
          console.log("홈 서버 데이터 불러오기 오류:", error);
        }
      };

      loadTimerSettings()
        .catch((error) => console.log("타이머 설정 불러오기 오류:", error))
        .finally(() => {
          if (isActive) {
            setIsSettingsLoaded(true);
          }
        });

      return () => {
        isActive = false;
      };
    }, []),
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
            (error) => console.log("사이클 완료 정보 정리 오류:", error),
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
        "0",
      )}:${String(centiseconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const focusedMinutes = Math.floor(
    (todaySummary?.totalFocusedSeconds ?? 0) / 60,
  );

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
      source={require("../../assets/images/HomeBg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 items-center">
        <View className="flex-row items-center mt-10">
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
              안녕하세요 {nickname}님{"\n"}
              음료가 준비되었어요.{"\n"}
              함께 얼음을 녹여 볼까요?
            </Text>
          </ImageBackground>
        </View>

        <View>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isRunning}
            onPress={() => router.push("/router/TimerSetting")}
          >
            <Text className="font-maru mt-10 text-[52px] text-primary">
              {formattedTime}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="justify-center">
          <Image
            source={require("../../assets/images/IceCup1.png")}
            className="h-[300px] w-[220px]"
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          className={`mt-2 h-[72px] w-[100px] items-center justify-center ${
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

        <CustomModal
          visible={showCompleteModal}
          onClose={() => {
            closeCompleteModal().catch((error) =>
              console.log("완료 모달 닫기 오류:", error),
            );
          }}
          title="수고하셨어요!"
          description="설정한 사이클을 모두 완료했습니다."
          buttonCount={1}
          confirmText="확인"
        />
      </SafeAreaView>
      <NavigationBar />
    </ImageBackground>
  );
}
