import * as AuthSession from "expo-auth-session";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { loginWithSocialCredential } from "../../services";
import {
  assertConfigured,
  getAuthRedirectUri,
  GOOGLE_CLIENT_IDS,
  SocialProviderError,
} from "../../socialProvider";
import type { UseSocialProviderLoginOptions } from "../types";
import type { SocialProviderLoginState } from "../../services";

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

type UseGoogleProviderLoginOptions = UseSocialProviderLoginOptions & {
  /** Google AuthSession prompt 전후의 공통 로그인 상태를 갱신하는 setter입니다. */
  setLoginState: React.Dispatch<React.SetStateAction<SocialProviderLoginState>>;
};

/**
 * Google OAuth에서 ID token을 얻고 백엔드 소셜 로그인까지 연결합니다.
 *
 * 현재는 Android/iOS client ID가 준비되지 않아 Web 환경에서만 실행됩니다.
 *
 * @param options 로그인 성공/실패 콜백과 공통 로그인 상태 setter입니다.
 * @returns Google AuthSession request와 로그인 시작 함수입니다.
 * @throws {SocialProviderError} Web이 아닌 플랫폼, client ID 누락, 사용자 취소, ID token 누락 시 발생합니다.
 */
export function useGoogleProviderLogin({
  onLoginError,
  onLoginSuccess,
  setLoginState,
}: UseGoogleProviderLoginOptions) {
  const [pendingLogin, setPendingLogin] = useState(false);
  const redirectUri = useMemo(() => getAuthRedirectUri("google"), []);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_IDS.web || MISSING_GOOGLE_CLIENT_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      scopes: ["openid", "profile", "email"],
      extraParams: {
        prompt: "select_account",
      },
    },
    GOOGLE_DISCOVERY,
  );

  const signIn = useCallback(async () => {
    try {
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

      setPendingLogin(true);
      setLoginState({ isLoading: true, provider: "GOOGLE" });
      const authResponse = await promptAsync();

      if (authResponse.type === "cancel" || authResponse.type === "dismiss") {
        setPendingLogin(false);
        setLoginState({ isLoading: false, provider: null });
        throw new SocialProviderError(
          "SOCIAL_LOGIN_CANCELED",
          "Google 로그인이 취소되었습니다.",
        );
      }

      if (authResponse.type === "error") {
        setPendingLogin(false);
        setLoginState({ isLoading: false, provider: null });
        throw new SocialProviderError(
          "GOOGLE_LOGIN_FAILED",
          authResponse.error?.message || "Google 로그인에 실패했습니다.",
        );
      }
    } catch (error) {
      setPendingLogin(false);
      setLoginState({ isLoading: false, provider: null });
      onLoginError?.(error);
    }
  }, [onLoginError, promptAsync, request, setLoginState]);

  useEffect(() => {
    if (!pendingLogin) {
      return;
    }

    const idToken = getGoogleIdToken(response);

    if (!idToken) {
      if (response?.type === "success") {
        setPendingLogin(false);
        setLoginState({ isLoading: false, provider: null });
        onLoginError?.(
          new SocialProviderError(
            "GOOGLE_ID_TOKEN_MISSING",
            "Google ID token을 받지 못했습니다.",
          ),
        );
      }

      return;
    }

    setPendingLogin(false);

    loginWithSocialCredential("GOOGLE", idToken)
      .then(onLoginSuccess)
      .catch(onLoginError)
      .finally(() => {
        setLoginState({ isLoading: false, provider: null });
      });
  }, [onLoginError, onLoginSuccess, pendingLogin, response, setLoginState]);

  return {
    request,
    signIn,
  };
}
