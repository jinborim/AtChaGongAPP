import Header from "@/src/components/Header/Header";
import { useAuth } from "@/src/features/auth";
import {
  areTimerNotificationsEnabled,
  cancelTimerNotifications,
  getNotificationSettings,
  type NotificationSettings as NotificationSettingsResponse,
  updateTimerNotificationsEnabled,
} from "@/src/features/notifications";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ImageBackground, Switch, Text, View } from "react-native";

const SWITCH_OFF = "#C7CED3";
const SWITCH_ON = "#73C0FF";
type NotificationPreferenceKey = "timer" | "dailyReminder" | "seasonalDrink";

const SETTING_ITEMS: {
  key: NotificationPreferenceKey;
  title: string;
  description: string;
}[] = [
  {
    key: "timer",
    title: "집중 타이머 알림",
    description: "집중과 휴식 시간이 끝나면 알려드려요.",
  },
  {
    key: "dailyReminder",
    title: "미접속 리마인드",
    description: "하루 동안 접속하지 않으면 알려드려요.",
  },
  {
    key: "seasonalDrink",
    title: "시즌 음료 출시 알림",
    description: "새로운 시즌 음료 출시 소식을 알려드려요.",
  },
];

export default function NotificationSettings() {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] =
    useState<NotificationSettingsResponse | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setIsLoaded(false);
      setHasLoadError(false);

      if (!isAuthenticated) {
        setSettings(null);
        setIsLoaded(true);
        return () => {
          active = false;
        };
      }

      getNotificationSettings()
        .then((notificationSettings) => {
          if (active) setSettings(notificationSettings);
        })
        .catch((error) => {
          console.warn("알림 설정 불러오기 실패:", error);
          if (active) {
            setSettings(null);
            setHasLoadError(true);
          }
        })
        .finally(() => {
          if (active) setIsLoaded(true);
        });

      return () => {
        active = false;
      };
    }, [isAuthenticated]),
  );

  const handleTimerValueChange = async (value: boolean) => {
    if (!isAuthenticated || !settings || isUpdating) return;

    setIsUpdating(true);

    try {
      const updatedSettings = await updateTimerNotificationsEnabled(value);
      setSettings(updatedSettings);

      if (!value) {
        try {
          await cancelTimerNotifications();
        } catch (error) {
          console.warn("예약된 타이머 알림 취소 실패:", error);
          Alert.alert(
            "알림 취소 실패",
            "일부 예약된 알림을 취소하지 못했습니다.",
          );
        }
      }
    } catch (error) {
      console.warn("집중 타이머 알림 설정 수정 실패:", error);
      Alert.alert(
        "알림 설정 변경 실패",
        "잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const timerNotificationsEnabled = settings
    ? areTimerNotificationsEnabled(settings)
    : false;

  const getPreferenceValue = (key: NotificationPreferenceKey) => {
    if (key === "timer") return timerNotificationsEnabled;
    if (key === "seasonalDrink") {
      return settings?.seasonalBeverageEnabled ?? false;
    }
    return false;
  };

  return (
    <ImageBackground
      source={require("../../assets/images/Background.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <Header title="알림 설정" showBack />

      <View className="mx-8 mt-10">
        <Text className="text-center font-maru text-sm leading-6 text-primary">
          받고 싶은 알림만 선택해 주세요.
        </Text>

        {!isAuthenticated && (
          <Text className="mt-4 text-center font-maru text-xs leading-5 text-gray-300">
            로그인 후 알림 설정을 변경할 수 있어요.
          </Text>
        )}
        {hasLoadError && (
          <Text className="mt-4 text-center font-maru text-xs leading-5 text-gray-300">
            알림 설정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </Text>
        )}

        <View className="relative mt-6 w-full">
          <View className="px-5">
            {SETTING_ITEMS.map((item, index) => (
              <View
                key={item.key}
                className={`min-h-24 flex-row items-center py-5 ${
                  index < SETTING_ITEMS.length - 1
                    ? "border-b-2 border-primary"
                    : ""
                }`}
              >
                <View className="mr-4 flex-1">
                  <Text className="font-maru text-base text-primary">
                    {item.title}
                  </Text>
                  <Text className="mt-2 font-maru text-[11px] leading-5 text-gray-300">
                    {item.description}
                  </Text>
                </View>
                <Switch
                  accessibilityLabel={`${item.title} ${
                    getPreferenceValue(item.key) ? "끄기" : "켜기"
                  }`}
                  disabled={
                    item.key !== "timer" ||
                    !isAuthenticated ||
                    !isLoaded ||
                    !settings ||
                    isUpdating
                  }
                  value={getPreferenceValue(item.key)}
                  onValueChange={handleTimerValueChange}
                  trackColor={{ false: SWITCH_OFF, true: SWITCH_ON }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={SWITCH_OFF}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
