import { API_PREFIX, getApiBaseUrl } from "./config";
import { ApiQuery } from "./types";

/**
 * 공통 API prefix를 붙인 전체 URL을 만들고 query 값을 문자열로 직렬화합니다.
 */
export function buildApiUrl(endpoint: string, query?: ApiQuery) {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${getApiBaseUrl()}${API_PREFIX}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}
