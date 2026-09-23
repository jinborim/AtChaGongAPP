import { apiClient } from "@/src/api/client";

import type {
  DeactivateDeviceTokenRequest,
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

/** 현재 로그인한 사용자에게 등록된 FCM 기기 토큰을 비활성화합니다. */
export function deactivateDeviceToken(request: DeactivateDeviceTokenRequest) {
  return apiClient.request<void>("/device-tokens", {
    method: "DELETE",
    body: request,
  });
}
