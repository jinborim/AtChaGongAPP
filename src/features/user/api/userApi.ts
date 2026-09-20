import { apiClient } from "@/src/api/client";

import type {
  CompleteOnboardingResponse,
  DeleteMeResponse,
  Me,
  ProfileImageSummary,
  UpdateNicknameRequest,
  UpdateNicknameResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UserProfile,
} from "./types";

export function getMe() {
  return apiClient.request<Me>("/users/me");
}

export function getUserProfile() {
  return apiClient.request<UserProfile>("/users/profile");
}

export function getProfileImages() {
  return apiClient.request<ProfileImageSummary[]>("/users/profiles");
}

export function updateUserProfile(request: UpdateProfileRequest) {
  return apiClient.request<UpdateProfileResponse>("/users/profile", {
    method: "PATCH",
    body: request,
  });
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
