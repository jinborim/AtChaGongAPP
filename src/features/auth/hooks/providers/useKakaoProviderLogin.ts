import * as AuthSession from "expo-auth-session";
import { useCallback, useMemo } from "react";

import { loginWithSocialCredential } from "../../services";
import {
  assertConfigured,
  exchangeKakaoAuthCode,
  getAuthRedirectUri,
  KAKAO_REST_API_KEY,
  SocialProviderError,
} from "../../socialProvider";
import type { RunProviderLogin } from "../types";

const KAKAO_DISCOVERY = {
  authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
};

/**
 * Kakao OAuth authorization code를 얻고 Kakao access token으로 교환한 뒤 백엔드 로그인을 실행합니다.
 *
 * @param runLogin provider 작업을 공통 loading/error 처리 안에서 실행하는 runner입니다.
 * @returns Kakao AuthSession request와 로그인 시작 함수입니다.
 * @throws {SocialProviderError} REST API key 누락, 사용자 취소, authorization code 누락, token 교환 실패 시 발생합니다.
 */
export function useKakaoProviderLogin(runLogin: RunProviderLogin) {
  const redirectUri = useMemo(() => getAuthRedirectUri("kakao"), []);
  const canPrepareKakaoRequest = Boolean(KAKAO_REST_API_KEY);

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: KAKAO_REST_API_KEY,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    },
    canPrepareKakaoRequest ? KAKAO_DISCOVERY : null,
  );

  const signIn = useCallback(async () => {
    await runLogin("KAKAO", async () => {
      assertConfigured(
        KAKAO_REST_API_KEY,
        "KAKAO_REST_API_KEY_MISSING",
        "Kakao REST API key가 설정되지 않았습니다.",
      );

      if (!request) {
        throw new SocialProviderError(
          "KAKAO_AUTH_REQUEST_NOT_READY",
          "Kakao 로그인 요청을 준비 중입니다.",
        );
      }

      const response = await promptAsync();

      if (response.type === "cancel" || response.type === "dismiss") {
        throw new SocialProviderError(
          "SOCIAL_LOGIN_CANCELED",
          "Kakao 로그인이 취소되었습니다.",
        );
      }

      if (response.type === "error") {
        const providerErrorMessage = [
          response.error?.message,
          response.params.error,
          response.params.error_description,
        ]
          .filter(Boolean)
          .join(" ");

        throw new SocialProviderError(
          "KAKAO_LOGIN_FAILED",
          providerErrorMessage || "Kakao 로그인에 실패했습니다.",
        );
      }

      if (response.type !== "success" || !response.params.code) {
        throw new SocialProviderError(
          "KAKAO_LOGIN_FAILED",
          "Kakao authorization code를 받지 못했습니다.",
        );
      }

      const accessToken = await exchangeKakaoAuthCode({
        code: response.params.code,
        codeVerifier: request.codeVerifier,
        redirectUri,
      });

      return loginWithSocialCredential("KAKAO", accessToken);
    });
  }, [promptAsync, redirectUri, request, runLogin]);

  return {
    request,
    signIn,
  };
}
