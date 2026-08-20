import { useCallback } from "react";

import { loginWithDevAuthTokens } from "../services";
import { useAppleProviderLogin } from "./providers/useAppleProviderLogin";
import { useGoogleProviderLogin } from "./providers/useGoogleProviderLogin";
import { useKakaoProviderLogin } from "./providers/useKakaoProviderLogin";
import { useProviderLoginRunner } from "./useProviderLoginRunner";
import type { UseSocialProviderLoginOptions } from "./types";

/**
 * 소셜 provider SDK credential 획득과 백엔드 로그인을 연결합니다.
 *
 * @param options 로그인 성공/실패 시 화면에서 처리할 콜백입니다.
 * @returns provider별 로그인 실행 함수, provider 준비 여부, 현재 로그인 상태입니다.
 */
export function useSocialProviderLogin(options: UseSocialProviderLoginOptions) {
  const { loginState, runLogin } = useProviderLoginRunner(options);

  const google = useGoogleProviderLogin(runLogin);
  const kakao = useKakaoProviderLogin(runLogin);
  const signInWithApple = useAppleProviderLogin(runLogin);
  const signInWithDevAuthTokens = useCallback(
    () => runLogin("DEV", loginWithDevAuthTokens),
    [runLogin],
  );

  return {
    canUseGoogleLogin: google.canUseGoogleLogin,
    kakaoRequest: kakao.request,
    loginState,
    signInWithApple,
    signInWithDevAuthTokens,
    signInWithGoogle: google.signIn,
    signInWithKakao: kakao.signIn,
  };
}
