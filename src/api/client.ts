import { getAccessToken } from "./tokenStorage";
import { sendJsonRequest } from "./http";
import { parseApiResponse } from "./response";
import { reissueTokens } from "./tokenReissue";
import { ApiError, ApiRequestOptions } from "./types";

/**
 * 서버 API를 호출하는 공통 요청 함수입니다.
 * 기본적으로 access token을 Authorization 헤더에 붙이고,
 * ACCESS_TOKEN_EXPIRED 오류가 오면 토큰을 재발급한 뒤 한 번만 재시도합니다.
 */
async function request<T>(
  endpoint: string,
  {
    method = "GET",
    body,
    query,
    auth = true,
    retryOnUnauthorized = true,
  }: ApiRequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const accessToken = await getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await sendJsonRequest(endpoint, {
    method,
    headers,
    body,
    query,
  });

  try {
    return await parseApiResponse<T>(response);
  } catch (error) {
    if (
      auth &&
      retryOnUnauthorized &&
      error instanceof ApiError &&
      error.code === "ACCESS_TOKEN_EXPIRED"
    ) {
      const tokens = await reissueTokens();
      headers.Authorization = `Bearer ${tokens.accessToken}`;

      const retryResponse = await sendJsonRequest(endpoint, {
        method,
        headers,
        body,
        query,
      });

      return parseApiResponse<T>(retryResponse);
    }

    throw error;
  }
}

export const apiClient = {
  request,
};
