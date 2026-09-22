import {
  getMessaging,
  getToken,
  registerDeviceForRemoteMessages,
} from "@react-native-firebase/messaging";
import { Platform } from "react-native";

import {
  registerOrUpdateDeviceToken,
  type DeviceTokenRequestPlatform,
} from "../api";
import { requestTimerNotificationPermission } from "./notificationService";

function getDeviceTokenPlatform(): DeviceTokenRequestPlatform {
  if (Platform.OS === "android") {
    return "ANDROID";
  }

  if (Platform.OS === "ios") {
    return "IOS";
  }

  throw new Error("이 플랫폼에서는 FCM 푸시 알림을 지원하지 않습니다.");
}

/**
 * 현재 기기의 FCM registration token을 발급받아 서버에 등록합니다.
 * iOS에서는 APNs 등록이 아직 끝나지 않은 경우 먼저 원격 메시지를 등록합니다.
 */
export async function registerCurrentFcmToken() {
  const platform = getDeviceTokenPlatform();
  const hasPermission = await requestTimerNotificationPermission();

  if (!hasPermission) {
    throw new Error("알림 권한이 허용되지 않았습니다.");
  }

  const messaging = getMessaging();

  if (
    Platform.OS === "ios" &&
    !messaging.isDeviceRegisteredForRemoteMessages
  ) {
    await registerDeviceForRemoteMessages(messaging);
  }

  const token = await getToken(messaging);

  if (!token) {
    throw new Error("FCM 기기 토큰을 발급받지 못했습니다.");
  }

  const registration = await registerOrUpdateDeviceToken({
    token,
    platform,
  });

  return { token, registration };
}
