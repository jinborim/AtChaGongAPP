import { apiClient } from "@/src/api/client";

import type {
  NotificationSettings,
  UpdateNotificationSettingsRequest,
} from "./types";

/** 현재 로그인한 사용자의 알림 설정을 조회합니다. */
export function getNotificationSettings() {
  return apiClient.request<NotificationSettings>("/notification-settings");
}

/** 현재 로그인한 사용자의 알림 설정 전체를 수정합니다. */
export function updateNotificationSettings(
  request: UpdateNotificationSettingsRequest,
) {
  return apiClient.request<NotificationSettings | undefined>(
    "/notification-settings",
    {
      method: "PUT",
      body: request,
    },
  );
}
