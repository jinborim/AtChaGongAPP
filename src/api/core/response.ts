import { ApiError, ApiErrorResponse, ApiResponse } from "../types";

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

function isApiErrorResponse(payload: unknown): payload is ApiErrorResponse {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "status" in payload &&
    "code" in payload &&
    "message" in payload &&
    typeof payload.status === "number" &&
    typeof payload.code === "string" &&
    typeof payload.message === "string"
  );
}

/**
 * 백엔드 공통 응답 envelope를 data로 정규화합니다.
 * 실패 응답이나 HTTP 오류는 ApiError로 변환해 호출부의 에러 처리를 통일합니다.
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
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

    if (isApiErrorResponse(payload)) {
      throw new ApiError(payload);
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
