import { buildApiUrl } from "./url";
import { ApiError, ApiRequestOptions } from "../types";

type SendJsonRequestOptions = Pick<
  ApiRequestOptions,
  "body" | "method" | "query"
> & {
  headers: Record<string, string>;
};

/**
 * JSON 기반 HTTP 요청을 실행합니다.
 * 네트워크 계층에서 발생한 예외는 ApiError로 변환해 상위 계층의 처리를 단순하게 만듭니다.
 */
export async function sendJsonRequest(
  endpoint: string,
  { method, body, query, headers }: SendJsonRequestOptions,
) {
  try {
    return await fetch(buildApiUrl(endpoint, query), {
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
}
