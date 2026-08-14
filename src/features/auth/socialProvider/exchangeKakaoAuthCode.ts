import { KAKAO_REST_API_KEY } from "./providerConfig";
import { SocialProviderError } from "./socialProviderError";

const KAKAO_TOKEN_ENDPOINT = "https://kauth.kakao.com/oauth/token";

type KakaoTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

function parseKakaoTokenResponse(text: string) {
  try {
    return JSON.parse(text) as KakaoTokenResponse;
  } catch {
    throw new SocialProviderError(
      "KAKAO_TOKEN_EXCHANGE_FAILED",
      "Kakao 토큰 응답을 해석하지 못했습니다.",
    );
  }
}

/**
 * Kakao authorization code를 백엔드 검증에 사용할 Kakao access token으로 교환합니다.
 * 클라이언트에서 교환하므로 Kakao 개발자 콘솔의 Client Secret은 OFF여야 합니다.
 *
 * @param params Kakao token endpoint에 전달할 authorization code 교환 정보입니다.
 * @param params.code Kakao OAuth redirect로 받은 authorization code입니다.
 * @param params.codeVerifier AuthSession PKCE 검증에 사용할 code verifier입니다.
 * @param params.redirectUri authorization code 요청 때 사용한 redirect URI와 동일한 값입니다.
 * @returns 백엔드 `KAKAO` 로그인 credential로 전달할 Kakao access token입니다.
 * @throws {SocialProviderError} Kakao token endpoint 요청, 응답 파싱, access token 발급이 실패하면 발생합니다.
 */
export async function exchangeKakaoAuthCode({
  code,
  codeVerifier,
  redirectUri,
}: {
  code: string;
  codeVerifier?: string;
  redirectUri: string;
}) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: redirectUri,
    code,
  });

  if (codeVerifier) {
    body.set("code_verifier", codeVerifier);
  }

  let response: Response;
  let responseText: string;

  try {
    response = await fetch(KAKAO_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: body.toString(),
    });
    responseText = await response.text();
  } catch {
    throw new SocialProviderError(
      "KAKAO_TOKEN_EXCHANGE_FAILED",
      "Kakao token endpoint 요청에 실패했습니다.",
    );
  }

  const payload = responseText ? parseKakaoTokenResponse(responseText) : {};

  if (!response.ok || !payload.access_token) {
    throw new SocialProviderError(
      "KAKAO_TOKEN_EXCHANGE_FAILED",
      payload.error_description ||
        payload.error ||
        "Kakao access token 발급에 실패했습니다.",
    );
  }

  return payload.access_token;
}
