import { sendJsonRequest } from "./http";
import { parseApiResponse } from "./response";
import {
  AuthTokens,
  clearAuthTokens,
  saveAuthTokensIfRefreshTokenMatches,
} from "../tokenStorage";
import { ApiError } from "../types";

const reissuePromises = new Map<string, Promise<AuthTokens>>();

function assertAuthTokens(value: AuthTokens) {
  if (
    typeof value.accessToken !== "string" ||
    value.accessToken.length === 0 ||
    typeof value.refreshToken !== "string" ||
    value.refreshToken.length === 0
  ) {
    throw new ApiError({
      status: 500,
      code: "INVALID_REISSUE_RESPONSE",
      message: "Token reissue response did not include valid auth tokens.",
    });
  }
}

/**
 * refresh token으로 access token을 재발급합니다.
 * 같은 세션에서 동시에 여러 요청이 만료 응답을 받으면 재발급 요청은 하나만 보냅니다.
 * refresh token이 바뀐 새 세션은 이전 세션의 재발급 Promise를 공유하지 않습니다.
 *
 * @param refreshToken 재발급을 시작한 원래 요청의 refresh token입니다.
 */
export async function reissueTokens(refreshToken: string | null) {
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
    const tokens = await parseApiResponse<AuthTokens>(response);

    assertAuthTokens(tokens);

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
