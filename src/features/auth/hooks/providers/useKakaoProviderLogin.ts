import { login } from "@react-native-seoul/kakao-login";
import { useCallback } from "react";
import { Platform } from "react-native";

import { loginWithSocialCredential } from "../../services";
import { SocialProviderError } from "../../socialProvider";
import type { RunProviderLogin } from "../types";

/**
 * Kakao native SDK에서 Kakao access token을 얻은 뒤 백엔드 로그인을 실행합니다.
 *
 * @param runLogin provider 작업을 공통 loading/error 처리 안에서 실행하는 runner입니다.
 * @returns Kakao 로그인 준비 여부와 로그인 시작 함수입니다.
 * @throws {SocialProviderError} 웹 환경 실행, 사용자 취소, native SDK 로그인 실패 시 발생합니다.
 */
export function useKakaoProviderLogin(runLogin: RunProviderLogin) {
  const signIn = useCallback(async () => {
    await runLogin("KAKAO", async () => {
      if (Platform.OS === "web") {
        throw new SocialProviderError(
          "KAKAO_NATIVE_LOGIN_UNSUPPORTED",
          "Kakao 로그인은 앱에서만 사용할 수 있습니다.",
        );
      }

      let accessToken: string;

      try {
        const token = await login();
        accessToken = token.accessToken;
      } catch (error) {
        if (isKakaoLoginCanceled(error)) {
          throw new SocialProviderError(
            "SOCIAL_LOGIN_CANCELED",
            "Kakao 로그인이 취소되었습니다.",
          );
        }

        throw new SocialProviderError(
          "KAKAO_LOGIN_FAILED",
          getKakaoLoginErrorMessage(error),
        );
      }

      if (!accessToken) {
        throw new SocialProviderError(
          "KAKAO_LOGIN_FAILED",
          "Kakao access token을 받지 못했습니다.",
        );
      }

      return loginWithSocialCredential("KAKAO", accessToken);
    });
  }, [runLogin]);

  return {
    request: Platform.OS !== "web",
    signIn,
  };
}

function isKakaoLoginCanceled(error: unknown) {
  const message = getKakaoLoginErrorMessage(error).toLowerCase();

  return (
    message.includes("cancel") ||
    message.includes("cancelled") ||
    message.includes("canceled")
  );
}

function getKakaoLoginErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Kakao 로그인에 실패했습니다.";
}
