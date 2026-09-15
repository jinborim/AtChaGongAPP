import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useCallback, useEffect } from "react";
import { Platform } from "react-native";

import { loginWithSocialCredential } from "../../services";
import {
  assertConfigured,
  GOOGLE_CLIENT_IDS,
  SocialProviderError,
} from "../../socialProvider";
import type { RunProviderLogin } from "../types";

function getGooglePlatformClientId() {
  if (Platform.OS === "android") {
    return GOOGLE_CLIENT_IDS.android;
  }

  if (Platform.OS === "ios") {
    return GOOGLE_CLIENT_IDS.ios;
  }

  return "";
}

/**
 * Google native SDK에서 ID token을 얻고 백엔드 소셜 로그인까지 연결합니다.
 *
 * iOS client ID는 SDK configure에 직접 전달하고,
 * Web client ID는 백엔드가 검증하는 ID token audience와 맞추기 위해 전달합니다.
 * Android client ID는 Google Console의 package/SHA-1 등록 여부를 확인하는 설정값으로 사용합니다.
 *
 * @param runLogin provider credential 획득과 백엔드 로그인을 공통 상태 처리 안에서 실행하는 함수입니다.
 * @returns Google 로그인 사용 가능 여부와 로그인 시작 함수입니다.
 * @throws {SocialProviderError} 현재 플랫폼/Web client ID 누락, 사용자 취소, ID token 누락 시 발생합니다.
 */
export function useGoogleProviderLogin(runLogin: RunProviderLogin) {
  const googleClientId = getGooglePlatformClientId();
  const googleWebClientId = GOOGLE_CLIENT_IDS.web;
  const canUseGoogleLogin =
    Platform.OS !== "web" && Boolean(googleClientId) && Boolean(googleWebClientId);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    GoogleSignin.configure({
      iosClientId: GOOGLE_CLIENT_IDS.ios || undefined,
      webClientId: googleWebClientId || undefined,
      offlineAccess: false,
      scopes: ["email", "profile"],
    });
  }, [googleWebClientId]);

  const signIn = useCallback(async () => {
    await runLogin("GOOGLE", async () => {
      assertConfigured(
        googleClientId,
        "GOOGLE_CLIENT_ID_MISSING",
        "현재 플랫폼의 Google OAuth client ID가 설정되지 않았습니다.",
      );
      assertConfigured(
        googleWebClientId,
        "GOOGLE_WEB_CLIENT_ID_MISSING",
        "서버 검증용 Google Web client ID가 설정되지 않았습니다.",
      );

      let idToken: string | null;

      try {
        if (Platform.OS === "android") {
          await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          });
        }

        const response = await GoogleSignin.signIn();

        if (response.type === "cancelled") {
          throw new SocialProviderError(
            "SOCIAL_LOGIN_CANCELED",
            "Google 로그인이 취소되었습니다.",
          );
        }

        idToken = response.data.idToken;
      } catch (error) {
        if (isGoogleLoginCanceled(error)) {
          throw new SocialProviderError(
            "SOCIAL_LOGIN_CANCELED",
            "Google 로그인이 취소되었습니다.",
          );
        }

        throw new SocialProviderError(
          "GOOGLE_LOGIN_FAILED",
          getGoogleLoginErrorMessage(error),
        );
      }

      if (!idToken) {
        throw new SocialProviderError(
          "GOOGLE_ID_TOKEN_MISSING",
          "Google ID token을 받지 못했습니다.",
        );
      }

      return loginWithSocialCredential("GOOGLE", idToken);
    });
  }, [googleClientId, googleWebClientId, runLogin]);

  return {
    canUseGoogleLogin,
    signIn,
  };
}

function isGoogleLoginCanceled(error: unknown) {
  return (
    error instanceof SocialProviderError ||
    (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED)
  );
}

function getGoogleLoginErrorMessage(error: unknown) {
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return "Google Play Services를 사용할 수 없습니다.";
    }

    if (error.code === statusCodes.IN_PROGRESS) {
      return "Google 로그인이 이미 진행 중입니다.";
    }

    return error.message || "Google 로그인에 실패했습니다.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Google 로그인에 실패했습니다.";
}
