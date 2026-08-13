import { ApiConfigurationError } from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_PREFIX = "/api/v1";

/**
 * 환경변수에 설정된 API origin을 반환합니다.
 * 값이 없으면 요청 전에 설정 오류를 명확하게 던집니다.
 */
export function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new ApiConfigurationError(
      "EXPO_PUBLIC_API_BASE_URL is not configured.",
    );
  }

  return API_BASE_URL.replace(/\/$/, "");
}
