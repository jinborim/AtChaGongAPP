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
 * Returns the configured API origin and fails early when the environment is not set.
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
 * Builds a versioned API URL and serializes primitive query parameters.
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
 * Normalizes the backend envelope into data or throws a typed API error.
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
 * Executes an API request with optional bearer auth and one automatic token reissue retry.
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
 * Reissues expired access tokens and deduplicates simultaneous refresh attempts.
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
