import Header from "@/src/components/Header/Header";
import { useAuth } from "@/src/features/auth";
import {
  areTimerNotificationsEnabled,
  cancelTimerNotifications,
  type DeviceTokenRegistration,
  getNotificationSettings,
  registerCurrentFcmToken,
  type NotificationSettings as NotificationSettingsResponse,
  updateTimerNotificationsEnabled,
} from "@/src/features/notifications";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

const SWITCH_OFF = "#C7CED3";
const SWITCH_ON = "#73C0FF";
type NotificationPreferenceKey = "timer" | "dailyReminder" | "seasonalDrink";

type FcmRegistrationTestResult = {
  token: string;
  registration: DeviceTokenRegistration;
};

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
  const [isRegisteringFcmToken, setIsRegisteringFcmToken] = useState(false);
  const [fcmRegistrationResult, setFcmRegistrationResult] =
    useState<FcmRegistrationTestResult | null>(null);
  const [fcmRegistrationError, setFcmRegistrationError] = useState<
    string | null
  >(null);

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

  const handleRegisterFcmToken = async () => {
    if (!isAuthenticated || isRegisteringFcmToken) return;

    setIsRegisteringFcmToken(true);
    setFcmRegistrationResult(null);
    setFcmRegistrationError(null);

    try {
      const result = await registerCurrentFcmToken();
      setFcmRegistrationResult(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "FCM 기기 토큰 등록에 실패했습니다.";

      console.warn("FCM 기기 토큰 등록 실패:", error);
      setFcmRegistrationError(message);
      Alert.alert("FCM 기기 토큰 등록 실패", message);
    } finally {
      setIsRegisteringFcmToken(false);
    }
  };

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

      <ScrollView
        className="flex-1 px-8"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-10 text-center font-maru text-sm leading-6 text-primary">
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

        {__DEV__ && (
          <View className="mt-8 rounded-2xl border-2 border-primary bg-white/70 p-4">
            <Text className="font-maru text-sm text-primary">
              FCM 기기 토큰 등록 테스트
            </Text>
            <Text className="mt-2 font-maru text-[11px] leading-5 text-gray-300">
              알림 권한을 확인하고 Firebase registration token을 서버에
              등록합니다.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="FCM 기기 토큰 등록 테스트"
              disabled={!isAuthenticated || isRegisteringFcmToken}
              onPress={handleRegisterFcmToken}
              className={`mt-4 h-11 items-center justify-center rounded-xl ${
                !isAuthenticated || isRegisteringFcmToken
                  ? "bg-gray-200"
                  : "bg-primary"
              }`}
            >
              <Text className="font-maru text-sm text-white">
                {isRegisteringFcmToken ? "등록 중..." : "FCM 토큰 등록"}
              </Text>
            </Pressable>

            {fcmRegistrationResult && (
              <View className="mt-4 gap-3 rounded-xl bg-white/80 p-3">
                <View>
                  <Text className="font-maru text-xs leading-5 text-primary">
                    FCM token
                  </Text>
                  <Text
                    selectable
                    className="mt-1 font-mono text-[11px] leading-5 text-gray-700"
                  >
                    {fcmRegistrationResult.token}
                  </Text>
                </View>

                <View>
                  <Text className="font-maru text-xs leading-5 text-primary">
                    서버 응답 data
                  </Text>
                  <Text
                    selectable
                    className="mt-1 font-mono text-[11px] leading-5 text-gray-700"
                  >
                    {JSON.stringify(fcmRegistrationResult.registration, null, 2)}
                  </Text>
                </View>
              </View>
            )}

            {fcmRegistrationError && (
              <Text className="mt-4 font-maru text-xs leading-5 text-red-500">
                {fcmRegistrationError}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}
