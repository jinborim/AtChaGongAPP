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

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
};

function getGoogleIdToken(response: AuthSession.AuthSessionResult | null) {
  if (response?.type !== "success") {
    return null;
  }

  return response.params.id_token || response.authentication?.idToken || null;
}

function decodeBase64UrlJson<T>(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  const binary = atob(paddedBase64);
  const encoded = Array.from(binary)
    .map((character) =>
      `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
    )
    .join("");

  return JSON.parse(decodeURIComponent(encoded)) as T;
}

function getIdTokenNonce(idToken: string) {
  const [, payload] = idToken.split(".");

  if (!payload) {
    return null;
  }

  try {
    const claims = decodeBase64UrlJson<{ nonce?: unknown }>(payload);
    return typeof claims.nonce === "string" ? claims.nonce : null;
  } catch {
    return null;
  }
}

function assertGoogleNonce(idToken: string, expectedNonce: string) {
  const tokenNonce = getIdTokenNonce(idToken);

  if (!tokenNonce) {
    throw new SocialProviderError(
      "GOOGLE_ID_TOKEN_NONCE_MISSING",
      "Google ID token의 nonce를 확인하지 못했습니다.",
    );
  }

  if (tokenNonce !== expectedNonce) {
    throw new SocialProviderError(
      "GOOGLE_ID_TOKEN_NONCE_MISMATCH",
      "Google ID token의 nonce가 로그인 요청과 일치하지 않습니다.",
    );
  }
}

function createGoogleNonce() {
  return Array.from(Crypto.getRandomBytes(16))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getGoogleClientId() {
  if (Platform.OS === "android") {
    return GOOGLE_CLIENT_IDS.android;
  }

  if (Platform.OS === "ios") {
    return GOOGLE_CLIENT_IDS.ios;
  }

  return "";
}

/**
 * Google OAuth에서 ID token을 얻고 백엔드 소셜 로그인까지 연결합니다.
 *
 * Android/iOS 앱 OAuth client ID를 현재 플랫폼에 맞게 사용합니다.
 *
 * @param runLogin provider credential 획득과 백엔드 로그인을 공통 상태 처리 안에서 실행하는 함수입니다.
 * @returns Google AuthSession request와 로그인 시작 함수입니다.
 * @throws {SocialProviderError} 현재 플랫폼 client ID 누락, 사용자 취소, ID token 누락 시 발생합니다.
 */
export function useGoogleProviderLogin(runLogin: RunProviderLogin) {
  const redirectUri = useMemo(() => getAuthRedirectUri("google"), []);
  const nonce = useMemo(() => createGoogleNonce(), []);
  const googleClientId = getGoogleClientId();

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId,
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
      assertConfigured(
        googleClientId,
        "GOOGLE_CLIENT_ID_MISSING",
        "현재 플랫폼의 Google OAuth client ID가 설정되지 않았습니다.",
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

      assertGoogleNonce(idToken, nonce);

      return loginWithSocialCredential("GOOGLE", idToken);
    });
  }, [googleClientId, nonce, promptAsync, request, runLogin]);

  return {
    request,
    signIn,
  };
}
