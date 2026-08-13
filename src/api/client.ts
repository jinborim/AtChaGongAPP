import {
  ApiConfigurationError,
  ApiError,
  ApiResponse,
  HttpMethod,
} from "./types";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from "./tokenStorage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_PREFIX = "/api/v1";

export type ApiQuery = Record<
  string,
  string | number | boolean | null | undefined
>;

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  query?: ApiQuery;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

type ReissueResponse = {
  accessToken: string;
  refreshToken: string;
};

let reissuePromise: Promise<ReissueResponse> | null = null;

/**
 * 환경변수에 설정된 API origin을 반환합니다.
 * 값이 없으면 요청 전에 설정 오류를 명확하게 던집니다.
 */
function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new ApiConfigurationError(
      "EXPO_PUBLIC_API_BASE_URL is not configured.",
    );
  }

  return API_BASE_URL.replace(/\/$/, "");
}

/**
 * 공통 API prefix를 붙인 전체 URL을 만들고 query 값을 문자열로 직렬화합니다.
 */
function buildUrl(
  endpoint: string,
  query?: ApiRequestOptions["query"],
) {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${getApiBaseUrl()}${API_PREFIX}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

/**
 * 응답 본문을 JSON으로 파싱합니다.
 * 서버가 JSON이 아닌 본문을 반환하면 공통 ApiError로 변환합니다.
 */
function parseJson<T>(text: string, status: number): ApiResponse<T> | T {
  try {
    return JSON.parse(text) as ApiResponse<T> | T;
  } catch {
    throw new ApiError({
      status,
      code: "INVALID_JSON_RESPONSE",
      message: "API response was not valid JSON.",
    });
  }
}

/**
 * 백엔드 공통 응답 envelope를 data로 정규화합니다.
 * 실패 응답이나 HTTP 오류는 ApiError로 변환해 호출부의 에러 처리를 통일합니다.
 */
async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload = text.length > 0 ? parseJson<T>(text, response.status) : null;

  if (!response.ok) {
    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      payload.success === false
    ) {
      throw new ApiError(payload.error);
    }

    throw new ApiError({
      status: response.status,
      code: "HTTP_ERROR",
      message: response.statusText || "HTTP request failed.",
    });
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    if (payload.success) {
      return payload.data;
    }

    throw new ApiError(payload.error);
  }

  return payload as T;
}

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

  let response: Response;

  try {
    response = await fetch(buildUrl(endpoint, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message:
        error instanceof Error ? error.message : "Network request failed.",
    });
  }

  try {
    return await parseResponse<T>(response);
  } catch (error) {
    if (
      auth &&
      retryOnUnauthorized &&
      error instanceof ApiError &&
      error.code === "ACCESS_TOKEN_EXPIRED"
    ) {
      const tokens = await reissueTokens();
      headers.Authorization = `Bearer ${tokens.accessToken}`;

      let retryResponse: Response;

      try {
        retryResponse = await fetch(buildUrl(endpoint, query), {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch (error) {
        throw new ApiError({
          status: 0,
          code: "NETWORK_ERROR",
          message:
            error instanceof Error ? error.message : "Network request failed.",
        });
      }

      return parseResponse<T>(retryResponse);
    }

    throw error;
  }
}

/**
 * refresh token으로 access token을 재발급합니다.
 * 동시에 여러 요청이 만료 응답을 받아도 재발급 요청은 하나만 보내도록 공유 Promise를 사용합니다.
 */
async function reissueTokens() {
  if (!reissuePromise) {
    reissuePromise = (async () => {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await clearAuthTokens();
        throw new ApiError({
          status: 401,
          code: "REFRESH_TOKEN_MISSING",
          message: "Refresh token is missing.",
        });
      }

      const tokens = await request<ReissueResponse>("/auth/reissue", {
        method: "POST",
        body: { refreshToken },
        auth: false,
        retryOnUnauthorized: false,
      });

      await saveAuthTokens(tokens);
      return tokens;
    })().finally(() => {
      reissuePromise = null;
    });
  }

  return reissuePromise;
}

export const apiClient = {
  request,
};
