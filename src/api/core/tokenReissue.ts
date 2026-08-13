import { sendJsonRequest } from "./http";
import { parseApiResponse } from "./response";
import {
  clearAuthTokens,
  getRefreshToken,
  saveAuthTokensIfRefreshTokenMatches,
} from "../tokenStorage";
import { ApiError } from "../types";

type ReissueResponse = {
  accessToken: string;
  refreshToken: string;
};

const reissuePromises = new Map<string, Promise<ReissueResponse>>();

/**
 * refresh token으로 access token을 재발급합니다.
 * 같은 세션에서 동시에 여러 요청이 만료 응답을 받으면 재발급 요청은 하나만 보냅니다.
 * refresh token이 바뀐 새 세션은 이전 세션의 재발급 Promise를 공유하지 않습니다.
 */
export async function reissueTokens() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    await clearAuthTokens();
    throw new ApiError({
      status: 401,
      code: "REFRESH_TOKEN_MISSING",
      message: "Refresh token is missing.",
    });
  }

  const existingPromise = reissuePromises.get(refreshToken);
  if (existingPromise) {
    return existingPromise;
  }

  const reissuePromise = (async () => {
    const response = await sendJsonRequest("/auth/reissue", {
      method: "POST",
      body: { refreshToken },
      headers: { "Content-Type": "application/json" },
    });
    const tokens = await parseApiResponse<ReissueResponse>(response);
    const didSaveTokens = await saveAuthTokensIfRefreshTokenMatches(
      tokens,
      refreshToken,
    );

    if (!didSaveTokens) {
      throw new ApiError({
        status: 401,
        code: "AUTH_SESSION_CHANGED",
        message: "Authentication session changed during token reissue.",
      });
    }

    return tokens;
  })().finally(() => {
    if (reissuePromises.get(refreshToken) === reissuePromise) {
      reissuePromises.delete(refreshToken);
    }
  });

  reissuePromises.set(refreshToken, reissuePromise);

  return reissuePromise;
}
