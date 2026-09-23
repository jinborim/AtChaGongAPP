import { apiClient } from "@/src/api/client";

import type {
  CompleteFocusRecordRequest,
  FocusRecord,
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

export function completeFocusRecord(request: CompleteFocusRecordRequest) {
  return apiClient.request<FocusRecord>("/focus-records", {
    method: "POST",
    body: request,
  });
}
