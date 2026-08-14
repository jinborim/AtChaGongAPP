import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import { useCallback, useMemo } from "react";
import { Platform } from "react-native";

import { loginWithSocialCredential } from "../../services";
import {
  assertConfigured,
  getAuthRedirectUri,
  GOOGLE_CLIENT_IDS,
  SocialProviderError,
} from "../../socialProvider";
import type { RunProviderLogin } from "../types";

const MISSING_GOOGLE_CLIENT_ID = "missing-google-client-id";
const GOOGLE_NATIVE_LOGIN_DISABLED_ERROR = new SocialProviderError(
  "GOOGLE_NATIVE_LOGIN_DISABLED",
  "Google 네이티브 로그인은 Android/iOS client ID 설정 후 사용할 수 있습니다.",
);

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
};

function getGoogleIdToken(response: AuthSession.AuthSessionResult | null) {
  if (response?.type !== "success") {
    return null;
  }

  return response.params.id_token || response.authentication?.idToken || null;
}

function createGoogleNonce() {
  return Array.from(Crypto.getRandomBytes(16))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Google OAuth에서 ID token을 얻고 백엔드 소셜 로그인까지 연결합니다.
 *
 * 현재는 Android/iOS client ID가 준비되지 않아 Web 환경에서만 실행됩니다.
 *
 * @param runLogin provider credential 획득과 백엔드 로그인을 공통 상태 처리 안에서 실행하는 함수입니다.
 * @returns Google AuthSession request와 로그인 시작 함수입니다.
 * @throws {SocialProviderError} Web이 아닌 플랫폼, client ID 누락, 사용자 취소, ID token 누락 시 발생합니다.
 */
export function useGoogleProviderLogin(runLogin: RunProviderLogin) {
  const redirectUri = useMemo(() => getAuthRedirectUri("google"), []);
  const nonce = useMemo(() => createGoogleNonce(), []);

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_IDS.web || MISSING_GOOGLE_CLIENT_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      scopes: ["openid", "profile", "email"],
      extraParams: {
        nonce,
        prompt: "select_account",
      },
    },
    GOOGLE_DISCOVERY,
  );

  const signIn = useCallback(async () => {
    await runLogin("GOOGLE", async () => {
      if (Platform.OS !== "web") {
        throw GOOGLE_NATIVE_LOGIN_DISABLED_ERROR;
      }

      assertConfigured(
        GOOGLE_CLIENT_IDS.web,
        "GOOGLE_CLIENT_ID_MISSING",
        "Google Web OAuth client ID가 설정되지 않았습니다.",
      );

      if (!request) {
        throw new SocialProviderError(
          "GOOGLE_AUTH_REQUEST_NOT_READY",
          "Google 로그인 요청을 준비 중입니다.",
        );
      }

      const authResponse = await promptAsync();

      if (authResponse.type === "cancel" || authResponse.type === "dismiss") {
        throw new SocialProviderError(
          "SOCIAL_LOGIN_CANCELED",
          "Google 로그인이 취소되었습니다.",
        );
      }

      if (authResponse.type === "error") {
        throw new SocialProviderError(
          "GOOGLE_LOGIN_FAILED",
          authResponse.error?.message || "Google 로그인에 실패했습니다.",
        );
      }

      const idToken = getGoogleIdToken(authResponse);

      if (!idToken) {
        throw new SocialProviderError(
          "GOOGLE_ID_TOKEN_MISSING",
          "Google ID token을 받지 못했습니다.",
        );
      }

      return loginWithSocialCredential("GOOGLE", idToken);
    });
  }, [promptAsync, request, runLogin]);

  return {
    request,
    signIn,
  };
}
