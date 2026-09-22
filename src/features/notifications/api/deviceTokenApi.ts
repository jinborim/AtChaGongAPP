import { apiClient } from "@/src/api/client";

import type {
  DeviceTokenRegistration,
  RegisterDeviceTokenRequest,
} from "./types";

/** 현재 로그인한 사용자에게 FCM 기기 토큰을 등록하거나 갱신합니다. */
export function registerOrUpdateDeviceToken(
  request: RegisterDeviceTokenRequest,
) {
  return apiClient.request<DeviceTokenRegistration>("/device-tokens", {
    method: "PUT",
    body: request,
  });
}
