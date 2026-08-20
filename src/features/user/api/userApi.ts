import { apiClient } from "@/src/api/client";

import type {
  CompleteOnboardingResponse,
  DeleteMeResponse,
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

export function completeOnboarding() {
  return apiClient.request<CompleteOnboardingResponse>(
    "/users/me/onboarding",
    {
      method: "PATCH",
      query: {
        completed: true,
      },
    },
  );
}

export function deleteMe() {
  return apiClient.request<DeleteMeResponse>("/users/me", {
    method: "DELETE",
  });
}
