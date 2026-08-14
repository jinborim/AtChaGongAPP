// 메인 홈 퍼블리싱 화면
import CustomModal from "@/src/components/Modal/CustomModal";
import TimerProgressBar from "@/src/components/TimerProgressBar";
import TimerSessionContent, {
  type TimerSessionPhase,
} from "@/src/components/TimerSessionContent";
import {
  completeFocusRecord,
  getTimerSettings,
  updateTimerSettings,
} from "@/src/features/timer";
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
import {
  BREAK_MINUTES,
  DEFAULT_BEVERAGE_ID,
  DEFAULT_CYCLE_COUNT,
  DEFAULT_FOCUS_MINUTES,
  getBreakDurationMilliseconds,
  getFocusDurationMilliseconds,
  MAX_CYCLE_COUNT,
  MIN_CYCLE_COUNT,
  TIMER_QA_MODE,
} from "../../constants/timer";
import {
  normalizeCycleCount,
  normalizeFocusMinutes,
  parseStoredCycleCount,
  parseStoredFocusMinutes,
} from "../../utils/timerSettings";

const DEFAULT_NICKNAME = "사용자";

export default function StudyScreen() {
  const router = useRouter();
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [remainingMilliseconds, setRemainingMilliseconds] = useState(
    getFocusDurationMilliseconds(DEFAULT_FOCUS_MINUTES),
  );
  const [timerPhase, setTimerPhase] = useState<TimerSessionPhase>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [cycleCount, setCycleCount] = useState(DEFAULT_CYCLE_COUNT);
  const [currentCycle, setCurrentCycle] = useState(MIN_CYCLE_COUNT);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [nickname, setNickname] = useState(DEFAULT_NICKNAME);
  const isRunningRef = useRef(isRunning);
  const timerStartedAtRef = useRef<string | null>(null);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsSettingsLoaded(false);

      const loadTimerSettings = async () => {
        const [savedFocusMinutes, savedCycleCount] = await Promise.all([
          AsyncStorage.getItem("focusMinutes"),
          AsyncStorage.getItem("cycleCount"),
        ]);
        const minutes = parseStoredFocusMinutes(savedFocusMinutes);
        const cycles = parseStoredCycleCount(savedCycleCount);
        const duration = getFocusDurationMilliseconds(minutes);
        await AsyncStorage.multiRemove(["currentCycle", "autoStartFocus"]);

        if (!isActive) return;

        if (!isRunningRef.current) {
          setFocusMinutes(minutes);
          setCycleCount(cycles);
          setCurrentCycle(MIN_CYCLE_COUNT);
          setTimerPhase("focus");
          setRemainingMilliseconds(duration);
          setEndTime(null);
          setIsRunning(false);
        }

        if (TIMER_QA_MODE) {
          setNickname("QA 사용자");
          if (!isRunningRef.current) {
            setFocusMinutes(DEFAULT_FOCUS_MINUTES);
            setCycleCount(MAX_CYCLE_COUNT);
            setCurrentCycle(MIN_CYCLE_COUNT);
          }
          await AsyncStorage.setItem("cycleCount", String(MAX_CYCLE_COUNT));
          return;
        }

        try {
          const [me, timerSettings] = await Promise.all([
            getMe(),
            getTimerSettings(),
          ]);

          if (!isActive) return;

          const serverFocusMinutes = normalizeFocusMinutes(
            timerSettings.focusMinutes,
          );
          const serverCycleCount = normalizeCycleCount(
            timerSettings.cycleCount,
          );
          const serverDuration =
            getFocusDurationMilliseconds(serverFocusMinutes);

          setNickname(me.nickname || DEFAULT_NICKNAME);

          if (!isRunningRef.current) {
            setFocusMinutes(serverFocusMinutes);
            setCycleCount(serverCycleCount);
            setCurrentCycle((previous) =>
              Math.min(serverCycleCount, previous),
            );
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

  const sendFocusCompletion = useCallback(
    async (completedCycleCount: number) => {
      const completedAt = new Date().toISOString();

      await completeFocusRecord({
        beverageId: DEFAULT_BEVERAGE_ID,
        focusMinutes,
        focusedSeconds: focusMinutes * 60 * completedCycleCount,
        startedAt: timerStartedAtRef.current ?? completedAt,
        completedAt,
      });

      timerStartedAtRef.current = null;
    },
    [focusMinutes],
  );

  useEffect(() => {
    if (!isRunning || endTime === null) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());

      if (remaining > 0) {
        setRemainingMilliseconds(remaining);
        return;
      }

      clearInterval(timer);

      if (timerPhase === "focus") {
        if (currentCycle < cycleCount) {
          const breakDuration = getBreakDurationMilliseconds();

          setTimerPhase("break");
          setRemainingMilliseconds(breakDuration);
          setEndTime(Date.now() + breakDuration);
          return;
        }

        setEndTime(null);
        setIsRunning(false);
        sendFocusCompletion(cycleCount).catch((error) =>
          console.log("집중 완료 기록 전송 오류:", error),
        );
        setShowCompleteModal(true);
        return;
      }

      const nextCycle = Math.min(cycleCount, currentCycle + 1);
      const focusDuration = getFocusDurationMilliseconds(focusMinutes);

      setTimerPhase("focus");
      setCurrentCycle(nextCycle);
      setRemainingMilliseconds(focusDuration);
      setEndTime(Date.now() + focusDuration);
    }, 50);

    return () => clearInterval(timer);
  }, [
    currentCycle,
    cycleCount,
    endTime,
    focusMinutes,
    isRunning,
    sendFocusCompletion,
    timerPhase,
  ]);

  const minutes = Math.floor(remainingMilliseconds / 60000);
  const seconds = Math.floor((remainingMilliseconds % 60000) / 1000);
  const centiseconds = Math.floor((remainingMilliseconds % 1000) / 10);
  const formattedTime = isRunning
    ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0",
      )}:${String(centiseconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const focusDurationMilliseconds = getFocusDurationMilliseconds(focusMinutes);
  const breakDurationMilliseconds = getBreakDurationMilliseconds();
  const timerProgress =
    timerPhase === "focus"
      ? focusDurationMilliseconds === 0
        ? 0
        : 1 - remainingMilliseconds / focusDurationMilliseconds
      : breakDurationMilliseconds === 0
        ? 0
        : 1 - remainingMilliseconds / breakDurationMilliseconds;

  const startTimer = async () => {
    if (!isSettingsLoaded || isRunning || remainingMilliseconds === 0) return;

    setTimerPhase("focus");
    timerStartedAtRef.current = new Date().toISOString();
    if (TIMER_QA_MODE) {
      updateTimerSettings({
        beverageId: DEFAULT_BEVERAGE_ID,
        focusMinutes: DEFAULT_FOCUS_MINUTES,
        breakMinutes: BREAK_MINUTES,
        cycleCount: MAX_CYCLE_COUNT,
      }).catch((error) => console.log("QA 타이머 설정 전송 오류:", error));
    }
    setEndTime(Date.now() + remainingMilliseconds);
    setIsRunning(true);
  };

  const closeCompleteModal = async () => {
    const savedFocusMinutes = await AsyncStorage.getItem("focusMinutes");
    const minutes = parseStoredFocusMinutes(savedFocusMinutes);

    setCurrentCycle(MIN_CYCLE_COUNT);
    setTimerPhase("focus");
    setRemainingMilliseconds(getFocusDurationMilliseconds(minutes));
    setShowCompleteModal(false);
  };

  return (
    <ImageBackground
      source={require("../../assets/images/HomeBg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 items-center">
        <View className="mt-10 h-[120px] w-full items-center justify-center">
          {isRunning ? (
            <View className="h-[120px] w-[80%] justify-center">
              <TimerProgressBar
                cycleCount={cycleCount}
                focusMinutes={focusMinutes}
                activeCycle={currentCycle}
                activeProgress={timerProgress}
                phase={timerPhase}
                heightClassName="h-3"
                gapClassName="gap-2"
              />
            </View>
          ) : (
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
                  안녕하세요 {nickname}님{"\n"}
                  음료가 준비되었어요.{"\n"}
                  함께 얼음을 녹여 볼까요?
                </Text>
              </ImageBackground>
            </View>
          )}
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

        <TimerSessionContent phase={timerPhase} />

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
