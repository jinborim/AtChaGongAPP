import { clearAuthTokens, saveAuthTokens } from "@/src/api/tokenStorage";

import { logout, socialLogin } from "../api";
import type { AuthType, SocialLoginRequest } from "../api";
import type { SocialLoginResult } from "./types";

const DEV_AUTH_ACCESS_TOKEN = process.env.EXPO_PUBLIC_DEV_AUTH_ACCESS_TOKEN ?? "";
const DEV_AUTH_REFRESH_TOKEN =
  process.env.EXPO_PUBLIC_DEV_AUTH_REFRESH_TOKEN ?? "";
const DEV_AUTH_ONBOARDING_COMPLETED =
  process.env.EXPO_PUBLIC_DEV_AUTH_ONBOARDING_COMPLETED === "true";

/**
 * 개발용 JWT 직접 로그인에 필요한 access/refresh token이 설정되어 있는지 확인합니다.
 *
 * @returns 개발 빌드이고, 개발 환경변수에 access token과 refresh token이 모두 있으면 true입니다.
 */
export function isDevAuthTokenLoginEnabled() {
  return __DEV__ && Boolean(DEV_AUTH_ACCESS_TOKEN && DEV_AUTH_REFRESH_TOKEN);
}

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
 * 소셜 provider 테스트가 어려운 개발 환경에서 JWT를 직접 저장해 로그인 상태를 만듭니다.
 *
 * 이 함수는 실제 소셜 로그인 검증을 우회하므로 개발용 버튼에서만 호출해야 합니다.
 * `EXPO_PUBLIC_DEV_AUTH_ACCESS_TOKEN`, `EXPO_PUBLIC_DEV_AUTH_REFRESH_TOKEN`이 필요합니다.
 *
 * @returns 로그인 이후 화면 분기에 사용할 온보딩 완료 여부입니다.
 * @throws {Error} 개발용 access/refresh token 환경변수가 비어 있으면 발생합니다.
 */
export async function loginWithDevAuthTokens(): Promise<SocialLoginResult> {
  if (!__DEV__) {
    throw new Error("개발용 JWT 로그인은 개발 빌드에서만 사용할 수 있습니다.");
  }

  if (!isDevAuthTokenLoginEnabled()) {
    throw new Error("개발용 JWT 토큰 환경변수가 설정되지 않았습니다.");
  }

  await saveAuthTokens({
    accessToken: DEV_AUTH_ACCESS_TOKEN,
    refreshToken: DEV_AUTH_REFRESH_TOKEN,
  });

  return {
    isOnboardingCompleted: DEV_AUTH_ONBOARDING_COMPLETED,
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
