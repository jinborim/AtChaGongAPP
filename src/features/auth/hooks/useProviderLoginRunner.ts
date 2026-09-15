import { useCallback, useRef, useState } from "react";

import type { SocialProviderLoginState } from "../services";
import type { RunProviderLogin, UseSocialProviderLoginOptions } from "./types";

/**
 * provider별 로그인 훅에서 공유하는 loading, success, error 처리를 제공합니다.
 *
 * @param options 로그인 성공/실패 시 호출할 화면 레벨 콜백입니다.
 * @returns 현재 로그인 상태, provider 작업 실행 함수, 상태 setter입니다.
 */
export function useProviderLoginRunner({
  onLoginError,
  onLoginSuccess,
}: UseSocialProviderLoginOptions) {
  const [loginState, setLoginState] = useState<SocialProviderLoginState>({
    isLoading: false,
    provider: null,
  });
  const isLoginInFlightRef = useRef(false);

  const runLogin: RunProviderLogin = useCallback(
    async (provider, operation) => {
      if (isLoginInFlightRef.current) {
        return;
      }

      isLoginInFlightRef.current = true;
      setLoginState({ isLoading: true, provider });

      try {
        const result = await operation();
        await onLoginSuccess(result);
      } catch (error) {
        onLoginError?.(error);
      } finally {
        isLoginInFlightRef.current = false;
        setLoginState({ isLoading: false, provider: null });
      }
    },
    [onLoginError, onLoginSuccess],
  );

  return {
    loginState,
    runLogin,
    setLoginState,
  };
}
