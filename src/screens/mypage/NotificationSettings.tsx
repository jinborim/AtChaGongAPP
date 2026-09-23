import Header from "@/src/components/Header/Header";
import { useAuth } from "@/src/features/auth";
import {
  areTimerNotificationsEnabled,
  cancelTimerNotifications,
  type DailyNotificationSettings,
  getDailyNotification,
  getNotificationSettings,
  registerCurrentFcmToken,
  requestTimerNotificationPermission,
  type NotificationSettings as NotificationSettingsResponse,
  updateDailyNotification,
  updateTimerNotificationsEnabled,
} from "@/src/features/notifications";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

const SWITCH_OFF = "#C7CED3";
const SWITCH_ON = "#73C0FF";
const PRIMARY_COLOR = "#18335E";
const DEFAULT_DAILY_NOTIFICATION: DailyNotificationSettings = {
  notificationTime: "09:00:00",
  enabled: false,
};
const NOTIFICATION_TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.\d+)?)?$/;
type NotificationPreferenceKey = "timer" | "dailyReminder";

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
    title: "데일리 리마인드",
    description: "하루 동안 접속하지 않으면 알려드려요.",
  },
];

function parseNotificationTime(value: string) {
  const matchedTime = NOTIFICATION_TIME_PATTERN.exec(value);

  if (!matchedTime) return new Date();

  const [, hours, minutes, seconds = "0"] = matchedTime;
  const time = new Date();
  time.setHours(Number(hours), Number(minutes), Number(seconds), 0);

  return time;
}

function formatNotificationTime(date: Date, previousValue: string) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const includesSeconds = /^\d{2}:\d{2}:\d{2}/.test(previousValue);

  return `${hours}:${minutes}${includesSeconds ? ":00" : ""}`;
}

function formatNotificationTimeLabel(value: string) {
  const matchedTime = NOTIFICATION_TIME_PATTERN.exec(value);

  if (!matchedTime) return value;

  const hours = Number(matchedTime[1]);
  const minutes = matchedTime[2];
  const period = hours < 12 ? "오전" : "오후";
  const displayHours = hours % 12 || 12;

  return `${period} ${displayHours}:${minutes}`;
}

export default function NotificationSettings() {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] =
    useState<NotificationSettingsResponse | null>(null);
  const [dailyNotification, setDailyNotification] =
    useState<DailyNotificationSettings | null>(null);
  const [isTimerLoaded, setIsTimerLoaded] = useState(false);
  const [isDailyLoaded, setIsDailyLoaded] = useState(false);
  const [isUpdatingTimer, setIsUpdatingTimer] = useState(false);
  const [isUpdatingDaily, setIsUpdatingDaily] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [draftNotificationTime, setDraftNotificationTime] = useState(
    new Date(),
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setIsTimerLoaded(false);
      setIsDailyLoaded(false);
      setHasLoadError(false);
      setIsTimePickerOpen(false);

      if (!isAuthenticated) {
        setSettings(null);
        setDailyNotification(null);
        setIsTimerLoaded(true);
        setIsDailyLoaded(true);
        return () => {
          active = false;
        };
      }

      setSettings(null);
      setDailyNotification(null);

      getNotificationSettings()
        .then((notificationSettings) => {
          if (active) setSettings(notificationSettings);
        })
        .catch((error) => {
          console.warn("알림 설정 불러오기 실패:", error);
          if (active) setHasLoadError(true);
        })
        .finally(() => {
          if (active) setIsTimerLoaded(true);
        });

      getDailyNotification()
        .then((dailyNotificationSettings) => {
          if (active) setDailyNotification(dailyNotificationSettings);
        })
        .catch((error) => {
          console.warn("데일리 리마인드 설정 불러오기 실패:", error);
          if (active) setHasLoadError(true);
        })
        .finally(() => {
          if (active) setIsDailyLoaded(true);
        });

      return () => {
        active = false;
      };
    }, [isAuthenticated]),
  );

  const handleTimerValueChange = async (value: boolean) => {
    if (!isAuthenticated || !settings || isUpdatingTimer) return;

    setIsUpdatingTimer(true);

    try {
      if (value) {
        const hasPermission = await requestTimerNotificationPermission();

        if (!hasPermission) {
          Alert.alert(
            "알림 권한이 필요해요",
            "집중 타이머 알림을 켜려면 기기 알림 권한을 허용해 주세요.",
          );
          return;
        }
      }

      const nextSettings = {
        focusStartEnabled: value,
        focusEndEnabled: value,
        breakEndEnabled: value,
      };
      const updatedSettings = await updateTimerNotificationsEnabled(value);
      setSettings(updatedSettings ?? nextSettings);

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
      setIsUpdatingTimer(false);
    }
  };

  const saveDailyNotification = async (
    nextSettings: DailyNotificationSettings,
    prepareForSave?: () => Promise<void>,
  ) => {
    if (!isAuthenticated || isUpdatingDaily) return false;

    setIsUpdatingDaily(true);
    let isPrepared = !prepareForSave;

    try {
      await prepareForSave?.();
      isPrepared = true;

      const updatedSettings = await updateDailyNotification(nextSettings);
      setDailyNotification(updatedSettings ?? nextSettings);
      return true;
    } catch (error) {
      console.warn("데일리 리마인드 설정 수정 실패:", error);
      Alert.alert(
        !isPrepared
          ? "데일리 리마인드 활성화 실패"
          : "알림 설정 변경 실패",
        !isPrepared
          ? "기기 알림 권한과 FCM 토큰 등록 상태를 확인한 뒤 다시 시도해 주세요."
          : "잠시 후 다시 시도해 주세요.",
      );
      return false;
    } finally {
      setIsUpdatingDaily(false);
    }
  };

  const handleDailyValueChange = async (enabled: boolean) => {
    const previousSettings =
      dailyNotification ?? DEFAULT_DAILY_NOTIFICATION;
    const nextSettings = {
      ...previousSettings,
      enabled,
    };

    setDailyNotification(nextSettings);

    const didSave = await saveDailyNotification(
      nextSettings,
      enabled
        ? async () => {
            await registerCurrentFcmToken();
          }
        : undefined,
    );
    if (!didSave) setDailyNotification(previousSettings);
  };

  const openTimePicker = () => {
    if (isUpdatingDaily) return;

    const currentSettings =
      dailyNotification ?? DEFAULT_DAILY_NOTIFICATION;

    setDraftNotificationTime(
      parseNotificationTime(currentSettings.notificationTime),
    );
    setIsTimePickerOpen(true);
  };

  const applyNotificationTime = async (time: Date) => {
    const currentSettings =
      dailyNotification ?? DEFAULT_DAILY_NOTIFICATION;
    const notificationTime = formatNotificationTime(
      time,
      currentSettings.notificationTime,
    );

    if (notificationTime === currentSettings.notificationTime) {
      setIsTimePickerOpen(false);
      return;
    }

    const didSave = await saveDailyNotification({
      ...currentSettings,
      notificationTime,
    });

    if (didSave) setIsTimePickerOpen(false);
  };

  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date,
  ) => {
    if (event.type === "dismissed" || !selectedTime) {
      setIsTimePickerOpen(false);
      return;
    }

    if (Platform.OS === "ios") {
      setDraftNotificationTime(selectedTime);
      return;
    }

    setIsTimePickerOpen(false);
    void applyNotificationTime(selectedTime);
  };

  const timerNotificationsEnabled = settings
    ? areTimerNotificationsEnabled(settings)
    : false;

  const getPreferenceValue = (key: NotificationPreferenceKey) => {
    if (key === "timer") return timerNotificationsEnabled;
    return dailyNotification?.enabled ?? false;
  };

  const handlePreferenceValueChange = (
    key: NotificationPreferenceKey,
    value: boolean,
  ) => {
    if (key === "timer") {
      void handleTimerValueChange(value);
      return;
    }

    void handleDailyValueChange(value);
  };

  const displayedDailyNotification =
    dailyNotification ?? DEFAULT_DAILY_NOTIFICATION;

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
                  {item.key === "dailyReminder" && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`데일리 리마인드 알림 시간 ${formatNotificationTimeLabel(displayedDailyNotification.notificationTime)} 변경`}
                      disabled={
                        !isAuthenticated ||
                        !isDailyLoaded ||
                        isUpdatingDaily
                      }
                      onPress={openTimePicker}
                      className={`mt-3 self-start rounded-lg border border-primary px-3 py-2 ${
                        isUpdatingDaily ? "opacity-50" : ""
                      }`}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.6 : undefined,
                      })}
                    >
                      <Text className="font-maru text-[11px] text-primary">
                        알림 시간{" "}
                        {formatNotificationTimeLabel(
                          displayedDailyNotification.notificationTime,
                        )}
                      </Text>
                    </Pressable>
                  )}
                </View>
                <Switch
                  accessibilityLabel={`${item.title} ${
                    getPreferenceValue(item.key) ? "끄기" : "켜기"
                  }`}
                  disabled={
                    !isAuthenticated ||
                    (item.key === "timer"
                      ? !isTimerLoaded || !settings || isUpdatingTimer
                      : !isDailyLoaded || isUpdatingDaily)
                  }
                  value={getPreferenceValue(item.key)}
                  onValueChange={(value) =>
                    handlePreferenceValueChange(item.key, value)
                  }
                  trackColor={{ false: SWITCH_OFF, true: SWITCH_ON }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={SWITCH_OFF}
                />
              </View>
            ))}
          </View>
        </View>

        {isTimePickerOpen && Platform.OS !== "ios" && (
          <DateTimePicker
            value={draftNotificationTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>

      <Modal
        visible={isTimePickerOpen && Platform.OS === "ios"}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTimePickerOpen(false)}
      >
        <View className="flex-1 justify-end bg-primary/20">
          <Pressable
            accessibilityLabel="알림 시간 선택 닫기"
            className="absolute inset-0"
            onPress={() => setIsTimePickerOpen(false)}
          />

          <View className="rounded-t-[20px] bg-white px-5 pb-8 pt-4">
            <View className="flex-row items-center justify-between">
              <Pressable
                accessibilityRole="button"
                disabled={isUpdatingDaily}
                onPress={() => setIsTimePickerOpen(false)}
                className="px-3 py-2"
              >
                <Text className="font-maru text-[12px] text-gray-300">
                  취소
                </Text>
              </Pressable>

              <Text className="font-maru text-[16px] text-primary">
                알림 시간 선택
              </Text>

              <Pressable
                accessibilityRole="button"
                disabled={isUpdatingDaily}
                onPress={() =>
                  void applyNotificationTime(draftNotificationTime)
                }
                className="px-3 py-2"
              >
                <Text className="font-maru text-[12px] text-secondary">
                  {isUpdatingDaily ? "저장 중" : "완료"}
                </Text>
              </Pressable>
            </View>

            <DateTimePicker
              value={draftNotificationTime}
              mode="time"
              display="spinner"
              themeVariant="light"
              textColor={PRIMARY_COLOR}
              onChange={handleTimeChange}
            />
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
