import {
  DAILY_ATTENDANCE_REWARD,
  FOCUS_COMPLETION_REWARD,
  WEEKLY_ATTENDANCE_REWARD,
} from "@/src/constants/coin";
import { Image, Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  variant: "attendance" | "focus";
  balance: number;
  onClose: () => void;
  attendanceDay?: number;
  completedCycleCount?: number;
};

export default function CoinRewardModal({
  visible,
  variant,
  balance,
  onClose,
  attendanceDay = 1,
  completedCycleCount = 1,
}: Props) {
  const isAttendance = variant === "attendance";
  const reward = isAttendance
    ? attendanceDay === 7
      ? WEEKLY_ATTENDANCE_REWARD
      : DAILY_ATTENDANCE_REWARD
    : FOCUS_COMPLETION_REWARD;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="보상 안내 닫기"
          className="absolute inset-0"
          onPress={onClose}
        />
        <View className="w-full max-w-[390px] items-center rounded-[16px] border-4 border-primary bg-white px-5 py-7">
          <Image
            source={require("../../assets/images/Coin.png")}
            className="mb-2 h-20 w-20"
            resizeMode="contain"
          />
          <Text className="font-maru text-xl text-primary">
            {isAttendance ? "오늘의 출석 보상" : "집중 사이클 완료!"}
          </Text>
          <Text className="mt-3 font-maru text-3xl text-[#D88A00]">
            +{reward} 코인
          </Text>

          {isAttendance && (
            <View className="mt-5 w-full">
              <View className="flex-row justify-between">
                {Array.from({ length: 7 }, (_, index) => {
                  const day = index + 1;
                  const completed = day <= attendanceDay;
                  const amount = day === 7 ? WEEKLY_ATTENDANCE_REWARD : DAILY_ATTENDANCE_REWARD;

                  return (
                    <View key={day} className="items-center gap-y-1">
                      <View
                        className={`h-8 w-8 items-center justify-center rounded-[6px] border-2 ${
                          completed
                            ? "border-primary bg-[#B7DEFE]"
                            : "border-[#CBD7E2] bg-[#F3F6F8]"
                        }`}
                      >
                        <Text className="font-maru text-xs text-primary">
                          {completed ? "✓" : day}
                        </Text>
                      </View>
                      <Text className="font-maru text-[9px] text-primary">
                        +{amount}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text className="mt-4 text-center font-maru text-xs leading-5 text-primary">
                7일째에는 70코인! 다음 출석은 다시 1일째부터 시작해요.
              </Text>
            </View>
          )}

          {!isAttendance && (
            <View className="mt-4 items-center">
              <View className="rounded-[8px] bg-[#EAF5FF] px-4 py-2">
                <Text className="font-maru text-sm text-primary">
                  전체 {completedCycleCount}사이클 완료
                </Text>
              </View>
              <Text className="mt-3 text-center font-maru text-sm leading-6 text-primary">
                설정한 집중과 휴식을 모두 완료했어요.
              </Text>
            </View>
          )}

          <View className="mt-5 flex-row items-center gap-x-2 rounded-[10px] bg-[#FFF4CE] px-4 py-3">
            <Text className="font-maru text-sm text-primary">현재 보유</Text>
            <Text className="font-maru text-base text-primary">
              {balance.toLocaleString("ko-KR")} 코인
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            className="mt-6 h-12 w-[140px] items-center justify-center rounded-[12px] bg-primary"
            onPress={onClose}
          >
            <Text className="font-maru text-base text-white">확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
