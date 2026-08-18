import { apiClient } from "@/src/api/client";

import type {
  CompleteOnboardingRequest,
  CompleteOnboardingResponse,
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
  const request: CompleteOnboardingRequest = { completed: true };

  return apiClient.request<CompleteOnboardingResponse>(
    "/users/me/onboarding",
    {
      method: "PATCH",
      body: request,
    },
  );
}
