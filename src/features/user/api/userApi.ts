import { apiClient } from "@/src/api/client";

import type { Me } from "./types";

export function getMe() {
  return apiClient.request<Me>("/users/me");
}
