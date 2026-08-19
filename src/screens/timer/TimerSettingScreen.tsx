// 타이머 설정 퍼블리싱 화면
import Header from "@/src/components/Header/Header";
import TimerProgressBar from "@/src/components/TimerProgressBar";
import { getTimerSettings, updateTimerSettings } from "@/src/features/timer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  type ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BREAK_MINUTES,
  DEFAULT_BEVERAGE_ID,
  DEFAULT_FOCUS_MINUTES,
  FOCUS_MINUTES_STEP,
  MAX_CYCLE_COUNT,
  MAX_FOCUS_MINUTES,
  MIN_FOCUS_MINUTES,
} from "../../constants/timer";
import {
  normalizeFocusMinutes,
  parseStoredFocusMinutes,
} from "../../utils/timerSettings";

const SETTING_ICONS = {
  focus: require("../../assets/images/Clock.png"),
  break: require("../../assets/images/YellowBeverage.png"),
  cycle: require("../../assets/images/Star.png"),
} as const;

type SettingCardProps = {
  label: string;
  value: number;
  unit: string;
  iconSource: ImageSourcePropType;
  adjustable?: boolean;
  cycleCount?: number;
  cycleFocusMinutes?: number;
  onDecrease?: () => void;
  onIncrease?: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
};

function SettingCard({
  label,
  value,
  unit,
  iconSource,
  adjustable = false,
  cycleCount,
  cycleFocusMinutes = 0,
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
        <Image
          source={iconSource}
          className="mr-2 h-7 w-7"
          resizeMode="contain"
        />
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
        <View className="mt-3 px-0.5">
          <TimerProgressBar
            cycleCount={cycleCount}
            focusMinutes={cycleFocusMinutes}
          />
        </View>
      )}
    </View>
  );
}

export default function TimerSettingScreen() {
  const router = useRouter();
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);

      const savedFocusMinutes = await AsyncStorage.getItem("focusMinutes");

      setFocusMinutes(parseStoredFocusMinutes(savedFocusMinutes));

      try {
        const timerSettings = await getTimerSettings();

        setFocusMinutes(normalizeFocusMinutes(timerSettings.focusMinutes));
      } catch (error) {
        console.log("타이머 서버 설정 불러오기 오류:", error);
      }
    };

    loadSettings()
      .catch((error) => console.log("타이머 설정 불러오기 오류:", error))
      .finally(() => setIsLoading(false));
  }, []);

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      const timerSettings = await updateTimerSettings({
        beverageId: DEFAULT_BEVERAGE_ID,
        focusMinutes,
        breakMinutes: BREAK_MINUTES,
        cycleCount: MAX_CYCLE_COUNT,
      });

      await Promise.all([
        AsyncStorage.setItem(
          "focusMinutes",
          String(normalizeFocusMinutes(timerSettings.focusMinutes)),
        ),
        AsyncStorage.setItem("cycleCount", String(MAX_CYCLE_COUNT)),
      ]);
      router.back();
    } catch (error) {
      console.log("타이머 설정 저장 오류:", error);
      Alert.alert(
        "저장 실패",
        "타이머 설정을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSaving(false);
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

        <ScrollView
          className="w-full flex-1"
          contentContainerClassName="pb-32 pt-8"
          showsVerticalScrollIndicator={false}
        >
          <SettingCard
            label="집중 시간"
            value={focusMinutes}
            unit="분"
            iconSource={SETTING_ICONS.focus}
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
          <SettingCard
            label="휴식 시간"
            value={BREAK_MINUTES}
            unit="분"
            iconSource={SETTING_ICONS.break}
          />
          <SettingCard
            label="반복 횟수"
            value={MAX_CYCLE_COUNT}
            unit="회"
            iconSource={SETTING_ICONS.cycle}
            cycleCount={MAX_CYCLE_COUNT}
            cycleFocusMinutes={focusMinutes}
          />
        </ScrollView>

        <View className="absolute bottom-14 w-[80%] self-center">
          <TouchableOpacity
            className={`h-12 w-full items-center justify-center rounded-[8px] bg-primary ${
              isLoading || isSaving ? "opacity-60" : ""
            }`}
            activeOpacity={0.6}
            disabled={isLoading || isSaving}
            onPress={saveSettings}
          >
            {isLoading || isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-maru text-base text-white">저장하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
