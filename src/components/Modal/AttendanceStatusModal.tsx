import {
  DAILY_ATTENDANCE_REWARD,
  WEEKLY_ATTENDANCE_REWARD,
} from "@/src/constants/coin";
import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  attendedToday: boolean;
  attendanceDay: number;
  onClose: () => void;
};

export default function AttendanceStatusModal({
  visible,
  attendedToday,
  attendanceDay,
  onClose,
}: Props) {
  const completedDays = attendedToday
    ? attendanceDay
    : Math.max(0, attendanceDay - 1);

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
          accessibilityLabel="출석 현황 닫기"
          className="absolute inset-0"
          onPress={onClose}
        />

        <View className="w-full max-w-[390px] items-center rounded-[16px] border-4 border-primary bg-white px-5 py-7">
          <Text className="font-maru text-xl text-primary">출석 현황</Text>

          <View
            className={`mt-4 rounded-full px-4 py-2 ${
              attendedToday ? "bg-[#DDF3E4]" : "bg-[#EEF2F6]"
            }`}
          >
            <Text className="font-maru text-sm text-primary">
              {attendedToday ? "오늘 출석 완료" : "오늘 출석 전"}
            </Text>
          </View>

          <Text className="mt-4 font-maru text-base text-primary">
            {completedDays}일 연속 출석 중
          </Text>

          <View className="mt-5 w-full flex-row justify-between">
            {Array.from({ length: 7 }, (_, index) => {
              const day = index + 1;
              const completed = day <= completedDays;
              const amount =
                day === 7 ? WEEKLY_ATTENDANCE_REWARD : DAILY_ATTENDANCE_REWARD;

              return (
                <View key={day} className="items-center gap-y-1">
                  <View
                    className={`h-9 w-9 items-center justify-center rounded-[7px] border-2 ${
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

          <Text className="mt-5 text-center font-maru text-xs leading-5 text-primary">
            1~6일째에는 10코인, 7일째에는 70코인을 받아요.
          </Text>

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
