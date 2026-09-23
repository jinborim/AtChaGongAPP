import { apiClient } from "@/src/api/client";

import type {
  DailyNotificationSettings,
  UpdateDailyNotificationRequest,
} from "./types";

/** 현재 로그인한 사용자의 데일리 리마인드 설정을 조회합니다. */
export function getDailyNotification() {
  return apiClient.request<DailyNotificationSettings>("/daily-notification");
}

/** 현재 로그인한 사용자의 데일리 리마인드 설정을 수정합니다. */
export function updateDailyNotification(
  request: UpdateDailyNotificationRequest,
) {
  return apiClient.request<DailyNotificationSettings | undefined>(
    "/daily-notification",
    {
      method: "PUT",
      body: request,
    },
  );
}
