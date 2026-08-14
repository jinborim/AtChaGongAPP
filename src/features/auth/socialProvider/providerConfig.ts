import * as AuthSession from "expo-auth-session";

const AUTH_REDIRECT_PATH = "auth";

export const GOOGLE_CLIENT_IDS = {
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
};

export const KAKAO_REST_API_KEY =
  process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? "";

/**
 * provider OAuth 요청에 사용할 redirect URI를 반환합니다.
 *
 * 환경변수에 provider별 redirect URI가 있으면 그 값을 우선 사용하고,
 * 없으면 `app.json`의 scheme을 기반으로 AuthSession redirect URI를 생성합니다.
 *
 * @param provider redirect URI를 만들 소셜 provider입니다.
 * @returns OAuth provider 콘솔에 등록되어 있어야 하는 redirect URI입니다.
 */
export function getAuthRedirectUri(provider: "google" | "kakao") {
  const configuredRedirectUri =
    provider === "google"
      ? process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI
      : process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI;

  if (configuredRedirectUri) {
    return configuredRedirectUri;
  }

  return AuthSession.makeRedirectUri({
    path: `${AUTH_REDIRECT_PATH}/${provider}`,
  });
}
