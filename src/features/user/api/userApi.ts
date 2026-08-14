import { apiClient } from "@/src/api/client";

import type {
  Me,
  UpdateNicknameRequest,
  UpdateNicknameResponse,
} from "./types";

export function getMe() {
  return apiClient.request<Me>("/users/me");
}

export function updateNickname(request: UpdateNicknameRequest) {
  return apiClient.request<UpdateNicknameResponse>("/users/me", {
    method: "PATCH",
    body: request,
  });
}
