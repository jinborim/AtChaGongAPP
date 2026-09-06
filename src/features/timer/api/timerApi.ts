import { apiClient } from "@/src/api/client";

import type {
  Beverage,
  CompleteFocusRecordRequest,
  TimerSettings,
  UpdateTimerSettingsRequest,
} from "./types";

export function getTimerSettings() {
  return apiClient.request<TimerSettings>("/timer/settings");
}

export function updateTimerSettings(request: UpdateTimerSettingsRequest) {
  return apiClient.request<TimerSettings>("/timer/settings", {
    method: "PUT",
    body: request,
  });
}

export function getBeverages() {
  return apiClient.request<Beverage[]>("/beverages");
}

export function completeFocusRecord(request: CompleteFocusRecordRequest) {
  return apiClient.request<unknown>("/focus-records", {
    method: "POST",
    body: request,
  });
}
