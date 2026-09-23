import {
  getMessaging,
  onMessage,
  type RemoteMessage,
} from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const TIMER_NOTIFICATION_CHANNEL_ID = "timer-completion";
export const REMOTE_NOTIFICATION_CHANNEL_ID = "remote-notifications";

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

/** Android에서 포그라운드 원격 알림을 표시할 채널을 보장합니다. */
export async function ensureRemoteNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    REMOTE_NOTIFICATION_CHANNEL_ID,
    {
      name: "앗차공 소식",
      description: "앗차공 리마인드 알림을 알려드려요.",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
      showBadge: true,
    },
  );
}

async function showForegroundRemoteNotification(
  remoteMessage: RemoteMessage,
) {
  const { notification } = remoteMessage;

  if (!notification?.title && !notification?.body) {
    console.info("표시할 내용이 없는 포그라운드 FCM 메시지를 수신했습니다.");
    return;
  }

  await ensureRemoteNotificationChannel();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title ?? "앗차공",
      body: notification.body ?? "새로운 알림이 도착했습니다.",
      data: {
        ...remoteMessage.data,
        fcmMessageId: remoteMessage.messageId,
      },
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger:
      Platform.OS === "android"
        ? { channelId: REMOTE_NOTIFICATION_CHANNEL_ID }
        : null,
  });
}

/** 앱 실행 중 수신한 FCM 메시지를 시스템 알림으로 표시합니다. */
export function subscribeToForegroundRemoteMessages() {
  if (Platform.OS === "web") {
    return () => undefined;
  }

  return onMessage(getMessaging(), async (remoteMessage) => {
    try {
      await showForegroundRemoteNotification(remoteMessage);
    } catch (error) {
      console.warn("포그라운드 원격 알림 표시 실패:", error);
    }
  });
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

/** 알림 권한 팝업을 띄우지 않고 현재 OS 허용 상태만 조회합니다. */
export async function isNotificationPermissionGranted() {
  if (Platform.OS === "web") {
    return false;
  }

  return hasNotificationPermission(await Notifications.getPermissionsAsync());
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
