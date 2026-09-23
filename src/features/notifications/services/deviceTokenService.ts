import {
  getMessaging,
  getToken,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
} from "@react-native-firebase/messaging";
import { Platform } from "react-native";

import {
  deactivateDeviceToken,
  type DeviceTokenRegistration,
  type DeviceTokenRequestPlatform,
  registerOrUpdateDeviceToken,
} from "../api";
import {
  isNotificationPermissionGranted,
  requestTimerNotificationPermission,
} from "./notificationService";

type FcmRegistrationResult = {
  token: string;
  registration: DeviceTokenRegistration;
};

let lastRegistration: FcmRegistrationResult | null = null;
let registrationInFlight: {
  token: string;
  promise: Promise<FcmRegistrationResult>;
} | null = null;

function getDeviceTokenPlatform(): DeviceTokenRequestPlatform {
  if (Platform.OS === "android") {
    return "ANDROID";
  }

  if (Platform.OS === "ios") {
    return "IOS";
  }

  throw new Error("이 플랫폼에서는 FCM 푸시 알림을 지원하지 않습니다.");
}

async function getCurrentFcmToken({
  registerForRemoteMessages,
}: {
  registerForRemoteMessages: boolean;
}) {
  const messaging = getMessaging();

  if (
    Platform.OS === "ios" &&
    !messaging.isDeviceRegisteredForRemoteMessages
  ) {
    if (!registerForRemoteMessages) {
      return null;
    }

    await registerDeviceForRemoteMessages(messaging);
  }

  const token = await getToken(messaging);
  return token || null;
}

async function registerFcmTokenOnce(token: string) {
  if (lastRegistration?.token === token) {
    return lastRegistration;
  }

  if (registrationInFlight?.token === token) {
    return registrationInFlight.promise;
  }

  if (registrationInFlight) {
    try {
      await registrationInFlight.promise;
    } catch {
      // 이전 토큰 등록 실패와 관계없이 새 토큰 등록을 시도합니다.
    }

    if (lastRegistration?.token === token) {
      return lastRegistration;
    }
  }

  const request = registerOrUpdateDeviceToken({
    token,
    platform: getDeviceTokenPlatform(),
  }).then((registration) => {
    const result = { token, registration };
    lastRegistration = result;

    console.info("FCM 기기 토큰 서버 동기화 완료:", {
      deviceTokenId: registration.deviceTokenId,
      platform: registration.platform,
    });

    return result;
  });

  registrationInFlight = { token, promise: request };

  try {
    return await request;
  } finally {
    if (registrationInFlight?.promise === request) {
      registrationInFlight = null;
    }
  }
}

async function registerCurrentToken() {
  const token = await getCurrentFcmToken({
    registerForRemoteMessages: true,
  });

  if (!token) {
    throw new Error("FCM 기기 토큰을 발급받지 못했습니다.");
  }

  return registerFcmTokenOnce(token);
}

/** 권한을 요청한 뒤 현재 FCM 토큰을 서버에 등록합니다. */
export async function registerCurrentFcmToken() {
  const hasPermission = await requestTimerNotificationPermission();

  if (!hasPermission) {
    throw new Error("알림 권한이 허용되지 않았습니다.");
  }

  return registerCurrentToken();
}

/** 권한 팝업 없이 이미 허용된 경우에만 현재 FCM 토큰을 동기화합니다. */
export async function registerCurrentFcmTokenIfPermitted() {
  if (Platform.OS === "web") {
    return null;
  }

  if (!(await isNotificationPermissionGranted())) {
    return null;
  }

  return registerCurrentToken();
}

/** 로그인 상태에서 FCM 토큰 갱신을 감지해 서버 등록을 갱신합니다. */
export function subscribeToFcmTokenRefresh() {
  if (Platform.OS === "web") {
    return () => undefined;
  }

  return onTokenRefresh(getMessaging(), (token) => {
    void (async () => {
      if (!(await isNotificationPermissionGranted())) {
        return;
      }

      await registerFcmTokenOnce(token);
    })().catch((error) => {
      console.warn("갱신된 FCM 기기 토큰 등록 실패:", error);
    });
  });
}

/** 로그아웃·회원 탈퇴 전에 현재 FCM 토큰을 서버에서 비활성화합니다. */
export async function deactivateCurrentFcmToken() {
  if (Platform.OS === "web") {
    return false;
  }

  if (registrationInFlight) {
    try {
      await registrationInFlight.promise;
    } catch {
      // PUT 실패 후에도 현재 토큰의 비활성화를 시도합니다.
    }
  }

  const token = await getCurrentFcmToken({
    registerForRemoteMessages: false,
  });

  if (!token) {
    return false;
  }

  await deactivateDeviceToken({ token });

  if (lastRegistration?.token === token) {
    lastRegistration = null;
  }

  console.info("FCM 기기 토큰 서버 비활성화 완료.");
  return true;
}

/** 인증 사용자가 바뀔 때 메모리에 보관한 중복 방지 상태를 초기화합니다. */
export function resetFcmTokenRegistrationState() {
  lastRegistration = null;
}
