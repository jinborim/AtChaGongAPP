import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const TIMER_NOTIFICATION_CHANNEL_ID = "timer-completion";

/** 앱이 포그라운드에 있을 때도 타이머 알림을 표시합니다. */
export function configureForegroundNotificationHandler() {
  if (Platform.OS === "web") {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Android 타이머 알림과 권한 요청에서 사용할 채널을 보장합니다. */
export async function ensureTimerNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    TIMER_NOTIFICATION_CHANNEL_ID,
    {
      name: "타이머 종료 알림",
      description: "집중 시간과 휴식 시간의 종료를 알려드려요.",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
      showBadge: false,
    },
  );
}

function hasNotificationPermission(
  permissions: Notifications.NotificationPermissionsStatus,
) {
  const iosStatus = permissions.ios?.status;

  return (
    permissions.granted ||
    iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
    iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    iosStatus === Notifications.IosAuthorizationStatus.EPHEMERAL
  );
}

/** 첫 타이머 시작 시 필요한 알림 권한을 요청합니다. */
export async function requestTimerNotificationPermission() {
  if (Platform.OS === "web") {
    return false;
  }

  await ensureTimerNotificationChannel();

  const currentPermissions = await Notifications.getPermissionsAsync();

  if (hasNotificationPermission(currentPermissions)) {
    return true;
  }

  const isUndetermined =
    Platform.OS === "ios"
      ? currentPermissions.ios?.status ===
        Notifications.IosAuthorizationStatus.NOT_DETERMINED
      : currentPermissions.status === Notifications.PermissionStatus.UNDETERMINED;

  if (!isUndetermined || !currentPermissions.canAskAgain) {
    return false;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return hasNotificationPermission(requestedPermissions);
}
