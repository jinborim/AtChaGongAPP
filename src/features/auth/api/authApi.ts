import { apiClient } from "@/src/api/client";

import type {
  LoginResponse,
  LogoutResponse,
  ReissueResponse,
  SocialLoginRequest,
} from "./types";

/**
 * provider credential을 백엔드에 전달해 앱 인증 토큰을 발급받습니다.
 *
 * @param request 소셜 provider 종류와 provider에서 발급받은 검증용 credential입니다.
 * @returns 백엔드가 발급한 access/refresh token과 온보딩 완료 여부입니다.
 * @throws {ApiError} provider token이 유효하지 않거나 백엔드 인증 요청이 실패하면 발생합니다.
 */
export function socialLogin(request: SocialLoginRequest) {
  return apiClient.request<LoginResponse>("/auth/social-login", {
    method: "POST",
    body: request,
    auth: false,
  });
}

/**
 * 현재 access token으로 서버 세션을 로그아웃 처리합니다.
 *
 * @returns 서버 로그아웃 성공 메시지입니다.
 * @throws {ApiError} 서버 로그아웃 요청이 실패하면 발생합니다. 호출부는 실패와 관계없이 로컬 토큰을 지워야 합니다.
 */
export function logout() {
  return apiClient.request<LogoutResponse>("/auth/logout", {
    method: "POST",
  });
}

/**
 * refresh token으로 앱 인증 토큰을 재발급합니다.
 *
 * @param refreshToken access token 재발급에 사용할 refresh token입니다.
 * @returns 새 access/refresh token 쌍입니다.
 * @throws {ApiError} refresh token이 만료, 폐기, 또는 유효하지 않으면 발생합니다.
 */
export function reissueAuthTokens(refreshToken: string) {
  return apiClient.request<ReissueResponse>("/auth/reissue", {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });
}
