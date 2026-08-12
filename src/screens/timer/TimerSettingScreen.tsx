// 타이머 설정 퍼블리싱 화면
import Header from "@/src/components/Header/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
          {Array.from({ length: 4 }).map((_, index) => (
            <View
              key={index}
              className={[
                "h-1 w-[23%] rounded-full",
                index < cycleCount ? "bg-primary" : "bg-primary/25",
              ].join(" ")}
              style={{ opacity: index < cycleCount ? 1 : 0.25 }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function TimerSettingScreen() {
  const router = useRouter();
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [cycleCount, setCycleCount] = useState(1);

  useEffect(() => {
    const loadSettings = async () => {
      const [savedFocusMinutes, savedCycleCount] = await Promise.all([
        AsyncStorage.getItem("focusMinutes"),
        AsyncStorage.getItem("cycleCount"),
      ]);

      if (savedFocusMinutes) {
        setFocusMinutes(Math.min(120, Math.max(5, Number(savedFocusMinutes))));
      }
      if (savedCycleCount) {
        setCycleCount(Math.min(4, Math.max(1, Number(savedCycleCount))));
      }
    };

    loadSettings().catch((error) =>
      console.log("타이머 설정 불러오기 오류:", error)
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
      source={require("../../assets/images/bg1.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="relative flex-1">
        <View className="h-[60px] shrink-0 items-center justify-center">
          <Header title="타이머 설정" showBack />

          {/* <Text className="mt-8 font-maru text-[28px] text-primary">
            타이머 설정
          </Text> */}
        </View>

        <View className="w-full flex-1 pt-12">
          <SettingCard
            label="집중 시간"
            value={focusMinutes}
            unit="분"
            adjustable
            decreaseDisabled={focusMinutes <= 5}
            increaseDisabled={focusMinutes >= 120}
            onDecrease={() =>
              setFocusMinutes((previous) => Math.max(5, previous - 5))
            }
            onIncrease={() =>
              setFocusMinutes((previous) => Math.min(120, previous + 5))
            }
          />
          <SettingCard
            label="휴식 시간"
            value={5}
            unit="분 고정"
          />
          <SettingCard
            label="반복 횟수"
            value={cycleCount}
            unit="회"
            adjustable
            cycleCount={cycleCount}
            decreaseDisabled={cycleCount <= 1}
            increaseDisabled={cycleCount >= 4}
            onDecrease={() =>
              setCycleCount((previous) => Math.max(1, previous - 1))
            }
            onIncrease={() =>
              setCycleCount((previous) => Math.min(4, previous + 1))
            }
          />
        </View>

        <View className="absolute bottom-4 w-[80%] self-center">
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
