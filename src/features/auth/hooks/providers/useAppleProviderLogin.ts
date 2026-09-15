import * as AppleAuthentication from "expo-apple-authentication";
import { useCallback } from "react";

import { loginWithSocialCredential } from "../../services";
import { SocialProviderError } from "../../socialProvider";
import type { RunProviderLogin } from "../types";

/**
 * Apple Authentication에서 identity token을 얻고 백엔드 소셜 로그인을 실행합니다.
 *
 * @param runLogin provider 작업을 공통 loading/error 처리 안에서 실행하는 runner입니다.
 * @returns Apple 로그인 시작 함수입니다.
 * @throws {SocialProviderError} Apple 로그인을 사용할 수 없거나 identity token을 받지 못하면 발생합니다.
 */
export function useAppleProviderLogin(runLogin: RunProviderLogin) {
  return useCallback(async () => {
    await runLogin("APPLE", async () => {
      const isAvailable = await AppleAuthentication.isAvailableAsync();

      if (!isAvailable) {
        throw new SocialProviderError(
          "APPLE_LOGIN_UNAVAILABLE",
          "이 기기에서는 Apple 로그인을 사용할 수 없습니다.",
        );
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new SocialProviderError(
          "APPLE_IDENTITY_TOKEN_MISSING",
          "Apple identity token을 받지 못했습니다.",
        );
      }

      return loginWithSocialCredential("APPLE", credential.identityToken);
    });
  }, [runLogin]);
}
