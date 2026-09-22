import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from "../api";

/** 집중 시작·종료와 휴식 종료 알림이 모두 허용되어 있는지 확인합니다. */
export function areTimerNotificationsEnabled(settings: NotificationSettings) {
  return (
    settings.focusStartEnabled &&
    settings.focusEndEnabled &&
    settings.breakEndEnabled
  );
}

/** 최신 서버 설정을 기준으로 타이머 관련 알림을 함께 변경합니다. */
export async function updateTimerNotificationsEnabled(enabled: boolean) {
  const currentSettings = await getNotificationSettings();

  return updateNotificationSettings({
    ...currentSettings,
    focusStartEnabled: enabled,
    focusEndEnabled: enabled,
    breakEndEnabled: enabled,
  });
}
