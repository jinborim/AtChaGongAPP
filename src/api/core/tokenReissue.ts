import { sendJsonRequest } from "./http";
import { parseApiResponse } from "./response";
import {
  clearAuthTokens,
  getRefreshToken,
  saveAuthTokens,
} from "../tokenStorage";
import { ApiError } from "../types";

type ReissueResponse = {
  accessToken: string;
  refreshToken: string;
};

let reissuePromise: Promise<ReissueResponse> | null = null;

/**
 * refresh token으로 access token을 재발급합니다.
 * 동시에 여러 요청이 만료 응답을 받아도 재발급 요청은 하나만 보내도록 공유 Promise를 사용합니다.
 */
export async function reissueTokens() {
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

      const response = await sendJsonRequest("/auth/reissue", {
        method: "POST",
        body: { refreshToken },
        headers: { "Content-Type": "application/json" },
      });
      const tokens = await parseApiResponse<ReissueResponse>(response);

      await saveAuthTokens(tokens);
      return tokens;
    })().finally(() => {
      reissuePromise = null;
    });
  }

  return reissuePromise;
}
