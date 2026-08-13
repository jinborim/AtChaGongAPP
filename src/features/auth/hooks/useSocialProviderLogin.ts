import * as WebBrowser from "expo-web-browser";

import { useAppleProviderLogin } from "./providers/useAppleProviderLogin";
import { useGoogleProviderLogin } from "./providers/useGoogleProviderLogin";
import { useKakaoProviderLogin } from "./providers/useKakaoProviderLogin";
import { useProviderLoginRunner } from "./useProviderLoginRunner";
import type { UseSocialProviderLoginOptions } from "./types";

WebBrowser.maybeCompleteAuthSession();

/**
 * 소셜 provider SDK/AuthSession credential 획득과 백엔드 로그인을 연결합니다.
 *
 * @param options 로그인 성공/실패 시 화면에서 처리할 콜백입니다.
 * @returns provider별 로그인 실행 함수, AuthSession request, 현재 로그인 상태입니다.
 */
export function useSocialProviderLogin(options: UseSocialProviderLoginOptions) {
  const { loginState, runLogin, setLoginState } =
    useProviderLoginRunner(options);

  const google = useGoogleProviderLogin({
    ...options,
    setLoginState,
  });
  const kakao = useKakaoProviderLogin(runLogin);
  const signInWithApple = useAppleProviderLogin(runLogin);

  return {
    googleRequest: google.request,
    kakaoRequest: kakao.request,
    loginState,
    signInWithApple,
    signInWithGoogle: google.signIn,
    signInWithKakao: kakao.signIn,
  };
}
