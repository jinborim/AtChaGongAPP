import { clearAuthTokens, saveAuthTokens } from "@/src/api/tokenStorage";

import { logout, socialLogin } from "../api";
import type { AuthType, SocialLoginRequest } from "../api";
import type { SocialLoginResult } from "./types";

/**
 * 소셜 로그인 SDK 결과를 백엔드 로그인 요청으로 변환할 때 사용합니다.
 *
 * @param authType 백엔드에 전달할 소셜 provider enum 값입니다.
 * @param credential provider에서 발급받은 검증용 token입니다.
 * @returns `/auth/social-login` 요청 body로 사용할 객체입니다.
 */
export function createSocialLoginRequest(
  authType: AuthType,
  credential: string,
): SocialLoginRequest {
  return {
    authType,
    credential,
  };
}

/**
 * provider credential로 로그인하고 발급받은 앱 인증 토큰을 저장합니다.
 *
 * @param authType 백엔드에 전달할 소셜 provider enum 값입니다.
 * @param credential provider에서 발급받은 검증용 token입니다.
 * @returns 로그인 이후 화면 분기에 사용할 온보딩 완료 여부입니다.
 * @throws {ApiError} 백엔드 소셜 로그인 요청이 실패하면 발생합니다.
 */
export async function loginWithSocialCredential(
  authType: AuthType,
  credential: string,
): Promise<SocialLoginResult> {
  const response = await socialLogin(
    createSocialLoginRequest(authType, credential),
  );

  await saveAuthTokens({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });

  return {
    isOnboardingCompleted: response.isOnboardingCompleted,
  };
}

/**
 * 서버 로그아웃을 요청한 뒤 성공 여부와 관계없이 로컬 토큰을 삭제합니다.
 *
 * @returns 서버 로그아웃 요청과 로컬 토큰 삭제가 끝나면 resolve됩니다.
 * @throws {ApiError} 서버 로그아웃 요청이 실패하면 발생할 수 있습니다. 로컬 토큰은 finally에서 항상 삭제됩니다.
 */
export async function logoutCurrentUser() {
  try {
    await logout();
  } finally {
    await clearAuthTokens();
  }
}
