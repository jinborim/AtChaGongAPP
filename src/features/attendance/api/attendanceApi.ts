import { apiClient } from "@/src/api/client";

import type { AttendanceReward, AttendanceStatus } from "./types";

export function attendToday() {
  return apiClient.request<AttendanceReward>("/attendances", {
    method: "POST",
  });
}

export function getAttendanceStatus() {
  return apiClient.request<AttendanceStatus>("/attendances/status");
}
