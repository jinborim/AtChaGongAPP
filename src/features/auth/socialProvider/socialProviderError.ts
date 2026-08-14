export class SocialProviderError extends Error {
  code: string;

  /**
   * 소셜 provider 로그인 흐름에서 발생한 예측 가능한 오류를 만듭니다.
   *
   * @param code 호출부에서 분기 처리할 수 있는 provider 오류 코드입니다.
   * @param message Alert 또는 로그에 사용할 오류 메시지입니다.
   */
  constructor(code: string, message: string) {
    super(message);
    this.name = "SocialProviderError";
    this.code = code;
  }
}

/**
 * provider 로그인 중 사용자가 명시적으로 취소한 오류인지 확인합니다.
 *
 * @param error provider SDK, AuthSession, 또는 서비스에서 전달된 오류 객체입니다.
 * @returns 사용자 취소로 볼 수 있으면 true입니다.
 */
export function isUserCanceledSocialLogin(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ERR_REQUEST_CANCELED"
  ) {
    return true;
  }

  return (
    error instanceof SocialProviderError &&
    (error.code === "SOCIAL_LOGIN_CANCELED" ||
      error.code === "ERR_REQUEST_CANCELED")
  );
}
