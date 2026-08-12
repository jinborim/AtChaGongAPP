// 타이머 설정 퍼블리싱 화면
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
};

function SettingCard({
  label,
  value,
  unit,
  adjustable = false,
  cycleCount,
}: SettingCardProps) {
  return (
    <View
      className={`${
        cycleCount === undefined ? "mb-4" : "mb-3"
      } h-[124px] w-[80%] self-center rounded-[12px] border border-gray-100 bg-[#FFFFFF] px-5 pt-5`}
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
            className="h-9 w-9 items-center justify-center rounded-full border border-gray-300"
            activeOpacity={0.6}
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
            className="h-9 w-9 items-center justify-center rounded-full border border-gray-300"
            activeOpacity={0.6}
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

  return (
    <ImageBackground
      source={require("../../assets/images/bg1.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="relative flex-1">
        <View className="h-[60px] shrink-0 items-center justify-center">
          <TouchableOpacity
            className="absolute left-5 top-6 h-10 w-10 items-center justify-center"
            activeOpacity={0.6}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={32} color="#17386B" />
          </TouchableOpacity>

          <Text className="mt-8 font-maru text-[28px] text-primary">
            타이머 설정
          </Text>
        </View>

        <View className="w-full flex-1 pt-9">
          <SettingCard
            label="집중 시간"
            value={25}
            unit="분"
            adjustable
          />
          <SettingCard
            label="휴식 시간"
            value={5}
            unit="분 고정"
          />
          <SettingCard
            label="반복 횟수"
            value={1}
            unit="회"
            adjustable
            cycleCount={1}
          />
        </View>

        <View className="absolute bottom-4 w-[80%] self-center">
          <TouchableOpacity
            className="h-12 w-full items-center justify-center rounded-[8px] bg-primary"
            activeOpacity={0.6}
          >
            <Text className="font-maru text-base text-white">저장하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
