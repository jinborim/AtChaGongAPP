import type {
  SocialLoginResult,
  SocialProviderLoginState,
} from "../services";

export type UseSocialProviderLoginOptions = {
  /** 백엔드 로그인까지 성공했을 때 호출됩니다. 화면 분기는 호출부에서 처리합니다. */
  onLoginSuccess: (result: SocialLoginResult) => void | Promise<void>;
  /** provider 로그인 또는 백엔드 로그인 중 실패했을 때 호출됩니다. */
  onLoginError?: (error: unknown) => void;
};

/** 로그인 버튼/상태 표시에서 사용하는 provider 값입니다. */
export type Provider = NonNullable<SocialProviderLoginState["provider"]>;

/**
 * provider별 credential 획득 로직을 공통 loading/error 처리 안에서 실행합니다.
 *
 * @param provider 현재 실행할 소셜 provider입니다.
 * @param operation provider credential 획득과 백엔드 로그인을 수행하는 비동기 작업입니다.
 * @returns 작업이 완료되거나, 이미 로그인 중이면 바로 resolve됩니다. 실패는 onLoginError로 전달하고 reject하지 않습니다.
 */
export type RunProviderLogin = (
  provider: Provider,
  operation: () => Promise<SocialLoginResult>,
) => Promise<void>;
