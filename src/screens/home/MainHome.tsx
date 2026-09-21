// 메인 홈 퍼블리싱 화면
import CustomModal from "@/src/components/Modal/CustomModal";
import CoinRewardModal from "@/src/components/Modal/CoinRewardModal";
import CoinBalance from "@/src/components/CoinBalance";
import TimerProgressBar from "@/src/components/TimerProgressBar";
import TimerSessionContent, {
  type TimerSessionPhase,
} from "@/src/components/TimerSessionContent";
import {
  completeFocusRecord,
  getTimerSettings,
} from "@/src/features/timer";
import {
  attendToday,
  type AttendanceReward,
} from "@/src/features/attendance";
import { getCoinBalance } from "@/src/features/coin";
import { useAuth } from "@/src/features/auth";
import { ApiError } from "@/src/api/types";
import { FOCUS_COMPLETION_REWARD } from "@/src/constants/coin";
import {
  clearActiveTimerSession,
  getActiveTimerSession,
  setActiveTimerSession,
} from "@/src/features/timer/activeTimerSession";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { prepareTimerSurfaces } from "@/src/features/timer/timerSurfaces";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  AppState,
  type AppStateStatus,
  Image,
  ImageBackground,
  PanResponder,
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
  MIN_CYCLE_COUNT,
} from "../../constants/timer";
import {
  normalizeBreakMinutes,
  normalizeCycleCount,
  normalizeFocusMinutes,
  parseStoredBreakMinutes,
  parseStoredCycleCount,
  parseStoredFocusMinutes,
} from "../../utils/timerSettings";

const DEFAULT_NICKNAME = "사용자";
const SEOUL_UTC_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1000;

function getMillisecondsUntilNextSeoulMidnight(now = Date.now()) {
  const seoulNow = new Date(now + SEOUL_UTC_OFFSET_MILLISECONDS);
  const nextSeoulMidnight =
    Date.UTC(
      seoulNow.getUTCFullYear(),
      seoulNow.getUTCMonth(),
      seoulNow.getUTCDate() + 1,
    ) - SEOUL_UTC_OFFSET_MILLISECONDS;

  return Math.max(1000, nextSeoulMidnight - now + 1000);
}

export default function StudyScreen() {
  const router = useRouter();
  const { isAuthenticated, isGuest, user } = useAuth();
  const [initialSession] = useState(() => getActiveTimerSession());
  const [focusMinutes, setFocusMinutes] = useState(
    initialSession?.focusMinutes ?? DEFAULT_FOCUS_MINUTES,
  );
  const [breakMinutes, setBreakMinutes] = useState(
    initialSession?.breakMinutes ?? BREAK_MINUTES,
  );
  const [remainingMilliseconds, setRemainingMilliseconds] = useState(() =>
    initialSession
      ? Math.max(0, initialSession.endTime - Date.now())
      : getFocusDurationMilliseconds(DEFAULT_FOCUS_MINUTES),
  );
  const [timerPhase, setTimerPhase] = useState<TimerSessionPhase>(
    initialSession?.phase ?? "focus",
  );
  const [isRunning, setIsRunning] = useState(initialSession !== null);
  const [endTime, setEndTime] = useState<number | null>(
    initialSession?.endTime ?? null,
  );
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceReward, setAttendanceReward] =
    useState<AttendanceReward | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);
  const [interactionSignal, setInteractionSignal] = useState(0);
  const [selectedBeverageId, setSelectedBeverageId] = useState(
    initialSession?.beverageId ?? DEFAULT_BEVERAGE_ID,
  );
  const [cycleCount, setCycleCount] = useState(
    initialSession?.cycleCount ?? DEFAULT_CYCLE_COUNT,
  );
  const [currentCycle, setCurrentCycle] = useState(
    initialSession?.currentCycle ?? MIN_CYCLE_COUNT,
  );
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [nickname, setNickname] = useState(
    isGuest ? "게스트" : user?.nickname || DEFAULT_NICKNAME,
  );
  const isRunningRef = useRef(isRunning);
  const isStartingRef = useRef(false);
  const isMountedRef = useRef(true);
  const timerStartedAtRef = useRef<string | null>(
    initialSession?.startedAt ?? null,
  );
  const focusBeverageIdRef = useRef(
    initialSession?.beverageId ?? DEFAULT_BEVERAGE_ID,
  );
  const settingsHandleTranslateX = useRef(new Animated.Value(0)).current;
  const settingsHandlePanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dx < -4 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderMove: (_, gestureState) => {
          settingsHandleTranslateX.setValue(
            Math.max(-48, Math.min(0, gestureState.dx)),
          );
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx <= -24 || gestureState.vx <= -0.5) {
            Animated.timing(settingsHandleTranslateX, {
              toValue: -48,
              duration: 120,
              useNativeDriver: true,
            }).start(({ finished }) => {
              if (!finished) return;

              settingsHandleTranslateX.setValue(0);
              router.push("/timerSetting");
            });
            return;
          }

          Animated.spring(settingsHandleTranslateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(settingsHandleTranslateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [router, settingsHandleTranslateX],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (!isAuthenticated) {
        setCoinBalance(0);
        return () => {
          isActive = false;
        };
      }

      getCoinBalance()
        .then((response) => {
          if (isActive) setCoinBalance(response.balance);
        })
        .catch((error) => console.log("코인 잔액 조회 오류:", error));

      return () => {
        isActive = false;
      };
    }, [isAuthenticated]),
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAttendanceModal(false);
      setAttendanceReward(null);
      setCoinBalance(0);
      return;
    }

    let isActive = true;
    let isAttendanceRequestInFlight = false;
    let midnightTimer: ReturnType<typeof setTimeout> | undefined;

    const processAttendance = async () => {
      if (isAttendanceRequestInFlight) return;
      isAttendanceRequestInFlight = true;

      try {
        const reward = await attendToday();

        if (!isActive) return;

        setAttendanceReward(reward);
        setCoinBalance(reward.balance);
        setShowAttendanceModal(true);
      } catch (error) {
        const alreadyAttended =
          error instanceof ApiError && error.code === "ALREADY_ATTENDED";

        if (!alreadyAttended) {
          console.log("출석 보상 처리 오류:", error);
        }

        try {
          const currentBalance = await getCoinBalance();
          if (isActive) setCoinBalance(currentBalance.balance);
        } catch (balanceError) {
          console.log("코인 잔액 조회 오류:", balanceError);
        }
      } finally {
        isAttendanceRequestInFlight = false;
      }
    };

    const scheduleNextMidnightAttendance = () => {
      if (midnightTimer) clearTimeout(midnightTimer);

      midnightTimer = setTimeout(() => {
        processAttendance()
          .catch((error) => console.log("자정 출석 보상 확인 오류:", error))
          .finally(() => {
            if (isActive) scheduleNextMidnightAttendance();
          });
      }, getMillisecondsUntilNextSeoulMidnight());
    };

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== "active") return;

      processAttendance().catch((error) =>
        console.log("앱 활성화 출석 보상 확인 오류:", error),
      );
      scheduleNextMidnightAttendance();
    };

    processAttendance().catch((error) =>
      console.log("출석 보상 확인 오류:", error),
    );
    scheduleNextMidnightAttendance();
    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      isActive = false;
      if (midnightTimer) clearTimeout(midnightTimer);
      appStateSubscription.remove();
    };
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsSettingsLoaded(false);

      const loadTimerSettings = async () => {
        const [savedFocusMinutes, savedBreakMinutes, savedCycleCount] = await Promise.all([
          AsyncStorage.getItem("focusMinutes"),
          AsyncStorage.getItem("breakMinutes"),
          AsyncStorage.getItem("cycleCount"),
        ]);
        const minutes = parseStoredFocusMinutes(savedFocusMinutes);
        const breaks = parseStoredBreakMinutes(savedBreakMinutes);
        const cycles = parseStoredCycleCount(savedCycleCount);
        const duration = getFocusDurationMilliseconds(minutes);
        await AsyncStorage.multiRemove(["currentCycle", "autoStartFocus"]);

        if (!isActive) return;

        if (!isRunningRef.current) {
          setFocusMinutes(minutes);
          setBreakMinutes(breaks);
          setCycleCount(cycles);
          setCurrentCycle(MIN_CYCLE_COUNT);
          setTimerPhase("focus");
          setRemainingMilliseconds(duration);
          setEndTime(null);
          setIsRunning(false);
        }

        if (isGuest) {
          setNickname("게스트");
          return;
        }

        try {
          const timerSettings = await getTimerSettings();

          if (!isActive) return;

          const serverFocusMinutes = normalizeFocusMinutes(
            timerSettings.focusMinutes,
          );
          const serverCycleCount = normalizeCycleCount(
            timerSettings.cycleCount,
          );
          const serverBreakMinutes = normalizeBreakMinutes(
            timerSettings.breakMinutes,
          );
          const serverDuration =
            getFocusDurationMilliseconds(serverFocusMinutes);

          setNickname(user?.nickname || DEFAULT_NICKNAME);

          if (!isRunningRef.current) {
            setFocusMinutes(serverFocusMinutes);
            setBreakMinutes(serverBreakMinutes);
            setCycleCount(serverCycleCount);
            setCurrentCycle((previous) => Math.min(serverCycleCount, previous));
            setRemainingMilliseconds(serverDuration);
          }

          await Promise.all([
            AsyncStorage.setItem("focusMinutes", String(serverFocusMinutes)),
            AsyncStorage.setItem("breakMinutes", String(serverBreakMinutes)),
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
    }, [isGuest, user?.nickname]),
  );

  const sendFocusCompletion = useCallback(
    async (completedCycleCount: number) => {
      if (isGuest) {
        timerStartedAtRef.current = null;
        return;
      }

      const completedAt = new Date().toISOString();

      await completeFocusRecord({
        beverageId: focusBeverageIdRef.current,
        focusMinutes,
        focusedSeconds: focusMinutes * 60 * completedCycleCount,
        startedAt: timerStartedAtRef.current ?? completedAt,
        completedAt,
      });

      if (isMountedRef.current) {
        setCoinBalance((current) => current + FOCUS_COMPLETION_REWARD);
      }

      timerStartedAtRef.current = null;
    },
    [focusMinutes, isGuest],
  );

  useEffect(() => {
    if (!isRunning || endTime === null) return;

    const timer = setInterval(() => {
      const now = Date.now();
      let nextEndTime = endTime;
      let nextPhase = timerPhase;
      let nextCycle = currentCycle;

      while (now >= nextEndTime) {
        if (nextPhase === "focus") {
          nextPhase = "break";
          nextEndTime += getBreakDurationMilliseconds(breakMinutes);
          continue;
        }

        if (nextCycle >= cycleCount) {
          clearInterval(timer);
          clearActiveTimerSession();
          setRemainingMilliseconds(0);
          setEndTime(null);
          setIsRunning(false);
          sendFocusCompletion(cycleCount).catch((error) =>
            console.log("집중 완료 기록 전송 오류:", error),
          );
          setShowResetModal(false);
          setShowCompleteModal(true);
          return;
        }

        nextPhase = "focus";
        nextCycle = Math.min(cycleCount, nextCycle + 1);
        nextEndTime += getFocusDurationMilliseconds(focusMinutes);
      }

      setTimerPhase(nextPhase);
      setCurrentCycle(nextCycle);
      setEndTime(nextEndTime);
      setRemainingMilliseconds(nextEndTime - now);
      setActiveTimerSession({
        beverageId: focusBeverageIdRef.current,
        phase: nextPhase,
        endTime: nextEndTime,
        currentCycle: nextCycle,
        cycleCount,
        focusMinutes,
        breakMinutes,
        startedAt: timerStartedAtRef.current ?? new Date(now).toISOString(),
      });
    }, 50);

    return () => clearInterval(timer);
  }, [
    breakMinutes,
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
  const breakDurationMilliseconds = getBreakDurationMilliseconds(breakMinutes);
  const timerProgress =
    timerPhase === "focus"
      ? focusDurationMilliseconds === 0
        ? 0
        : 1 - remainingMilliseconds / focusDurationMilliseconds
      : breakDurationMilliseconds === 0
        ? 0
        : 1 - remainingMilliseconds / breakDurationMilliseconds;
  const canResetTimer =
    isRunning && (timerPhase === "focus" || timerPhase === "break");

  const startTimer = async () => {
    if (!isSettingsLoaded || isRunning || isStartingRef.current || remainingMilliseconds === 0) return;

    isStartingRef.current = true;
    await prepareTimerSurfaces();
    isStartingRef.current = false;
    if (!isMountedRef.current) return;

    setIsRunning(true);
    setTimerPhase("focus");
    const startedAt = new Date().toISOString();
    const nextEndTime = Date.now() + remainingMilliseconds;
    timerStartedAtRef.current = startedAt;
    focusBeverageIdRef.current = selectedBeverageId;
    setActiveTimerSession({
      beverageId: focusBeverageIdRef.current,
      phase: "focus",
      endTime: nextEndTime,
      currentCycle,
      cycleCount,
      focusMinutes,
      breakMinutes,
      startedAt,
    });
    setEndTime(nextEndTime);
  };

  const resetTimer = () => {
    setShowResetModal(false);
    if (!isRunning) return;

    clearActiveTimerSession();
    timerStartedAtRef.current = null;
    setCurrentCycle(MIN_CYCLE_COUNT);
    setTimerPhase("focus");
    setRemainingMilliseconds(getFocusDurationMilliseconds(focusMinutes));
    setEndTime(null);
    setIsRunning(false);
  };

  const closeCompleteModal = async () => {
    const savedFocusMinutes = await AsyncStorage.getItem("focusMinutes");
    const minutes = parseStoredFocusMinutes(savedFocusMinutes);

    setCurrentCycle(MIN_CYCLE_COUNT);
    setTimerPhase("focus");
    setRemainingMilliseconds(getFocusDurationMilliseconds(minutes));
    clearActiveTimerSession();
    setShowCompleteModal(false);
  };

  return (
    <ImageBackground
      source={require("../../assets/images/HomeBg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView
        className="flex-1 items-center"
        onTouchStart={() => setInteractionSignal((current) => current + 1)}
      >
        <View className="h-12 w-full flex-row items-center justify-end px-4">
          <CoinBalance
            balance={isGuest ? 0 : coinBalance}
            compact
            onPress={() => router.push("/store")}
          />
        </View>
        <View className="h-[120px] w-full items-center justify-center">
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

        <View className="mt-10 w-full items-center justify-center">
          <Text className="font-maru text-[52px] text-primary">
            {formattedTime}
          </Text>

          {!isRunning && (
            <Animated.View
              accessible
              accessibilityRole="button"
              accessibilityLabel="타이머 설정"
              accessibilityHint="두 번 탭하여 타이머 설정을 엽니다"
              accessibilityActions={[
                { name: "activate", label: "타이머 설정 열기" },
              ]}
              onAccessibilityAction={(event) => {
                if (event.nativeEvent.actionName === "activate") {
                  router.push("/timerSetting");
                }
              }}
              className="absolute h-[110px] w-[220px]"
              style={{
                right: -138,
                transform: [{ translateX: settingsHandleTranslateX }],
              }}
              {...settingsHandlePanResponder.panHandlers}
            >
              <Image
                source={require("../../assets/images/Panel.png")}
                className="h-full w-full"
                resizeMode="contain"
              />
            </Animated.View>
          )}
        </View>

        <TimerSessionContent
          isRunning={isRunning}
          interactionSignal={interactionSignal}
          phase={timerPhase}
          focusProgress={timerPhase === "focus" ? timerProgress : 0}
          breakProgress={timerPhase === "break" ? timerProgress : 0}
          persistSelection={!isGuest}
          onBeverageChange={setSelectedBeverageId}
        />

        <TouchableOpacity
          accessible
          accessibilityRole="button"
          accessibilityLabel={canResetTimer ? "타이머 초기화" : "타이머 시작"}
          accessibilityHint={
            canResetTimer
              ? "사이클 초기화 확인 팝업을 엽니다"
              : undefined
          }
          className={`mt-2 h-[72px] w-[100px] items-center justify-center ${
            !canResetTimer && !isSettingsLoaded ? "opacity-50" : "opacity-100"
          }`}
          disabled={
            !canResetTimer && (!isSettingsLoaded || remainingMilliseconds === 0)
          }
          onPress={
            canResetTimer ? () => setShowResetModal(true) : startTimer
          }
        >
          <Image
            source={require("../../assets/images/PlayButton.png")}
            className="absolute h-[72px] w-[100px]"
            resizeMode="contain"
            style={{ opacity: canResetTimer ? 0 : 1 }}
          />
          <Image
            source={require("../../assets/images/ResetButton.png")}
            // 원본 이미지의 투명 여백을 감안해 재생 버튼의 실제 테두리 크기에 맞춥니다.
            className="absolute h-[60px] w-[87px]"
            resizeMode="stretch"
            style={{ opacity: canResetTimer ? 1 : 0 }}
          />
        </TouchableOpacity>

        <CustomModal
          visible={showResetModal && isRunning}
          onClose={() => setShowResetModal(false)}
          onConfirm={resetTimer}
          title="초기화"
          description="사이클을 초기화하시겠습니까?"
          buttonCount={2}
          confirmText="확인"
          cancelText="취소"
        />

        {isGuest ? (
          <CustomModal
          visible={showCompleteModal && isGuest}
          onClose={() => {
            closeCompleteModal().catch((error) =>
              console.log("완료 모달 닫기 오류:", error),
            );
          }}
          title="수고하셨어요!"
          onConfirm={
            isGuest
              ? () => {
                  closeCompleteModal()
                    .then(() => router.replace("/login"))
                    .catch((error) =>
                      console.log("완료 모달 처리 오류:", error),
                    );
                }
              : undefined
          }
          description={
            isGuest
              ? "비회원의 집중 기록은 저장되지 않아요. 로그인하고 기록을 남겨 보세요."
              : "설정한 사이클을 모두 완료했습니다."
          }
          buttonCount={isGuest ? 2 : 1}
          confirmText={isGuest ? "로그인하기" : "확인"}
          cancelText="확인"
          />
        ) : (
          <CoinRewardModal
            visible={showCompleteModal}
            variant="focus"
            balance={coinBalance}
            completedCycleCount={cycleCount}
            onClose={() => {
              closeCompleteModal().catch((error) =>
                console.log("완료 모달 닫기 오류:", error),
              );
            }}
          />
        )}
        <CoinRewardModal
          visible={showAttendanceModal && attendanceReward !== null}
          variant="attendance"
          attendanceDay={attendanceReward?.consecutiveDay ?? 1}
          rewardAmount={attendanceReward?.grantedCoin}
          isSevenDayStreakCompleted={
            attendanceReward?.consecutiveDay === 7
          }
          balance={attendanceReward?.balance ?? coinBalance}
          onClose={() => setShowAttendanceModal(false)}
        />
      </SafeAreaView>
      <NavigationBar />
    </ImageBackground>
  );
}
