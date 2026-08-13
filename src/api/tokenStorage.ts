import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "atchagong.accessToken";
const REFRESH_TOKEN_KEY = "atchagong.refreshToken";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

/**
 * 기기 보안 저장소에서 현재 access token을 조회합니다.
 */
export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

/**
 * access token 재발급에 사용할 refresh token을 조회합니다.
 */
export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

/**
 * 로그인 또는 토큰 재발급 이후 받은 access/refresh token을 함께 저장합니다.
 */
export async function saveAuthTokens(tokens: AuthTokens) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

/**
 * 로그아웃하거나 세션이 유효하지 않을 때 로컬에 저장된 인증 토큰을 삭제합니다.
 */
export async function clearAuthTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
