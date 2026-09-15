import { SocialProviderError } from "./socialProviderError";

/**
 * 필수 provider 설정 값이 비어 있는지 검사합니다.
 *
 * @param value 검사할 환경변수 또는 설정 값입니다.
 * @param code 설정 누락 시 SocialProviderError에 넣을 코드입니다.
 * @param message 설정 누락 시 사용자 또는 개발자에게 보여줄 메시지입니다.
 * @throws {SocialProviderError} value가 빈 문자열이면 발생합니다.
 */
export function assertConfigured(value: string, code: string, message: string) {
  if (!value) {
    throw new SocialProviderError(code, message);
  }
}
