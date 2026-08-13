/**
 * 백엔드 AuthType enum과 동일한 소셜 provider 식별자입니다.
 */
export type AuthType = "GOOGLE" | "KAKAO" | "APPLE";

export type SocialLoginRequest = {
  /** 백엔드가 인식하는 provider enum 값입니다. */
  authType: AuthType;
  /** provider에서 받은 검증용 token입니다. Kakao는 access token, Google/Apple은 ID token입니다. */
  credential: string;
};

export type LoginResponse = {
  /** 인증 API 호출에 사용할 JWT access token입니다. */
  accessToken: string;
  /** access token 재발급에 사용할 refresh token입니다. */
  refreshToken: string;
  /** false이면 로그인 후 온보딩 화면으로 이동해야 합니다. */
  isOnboardingCompleted: boolean;
};

export type ReissueResponse = {
  /** 재발급된 JWT access token입니다. */
  accessToken: string;
  /** 재발급된 refresh token입니다. 기존 저장 값을 교체해야 합니다. */
  refreshToken: string;
};

export type LogoutResponse = {
  /** 서버가 반환하는 로그아웃 결과 메시지입니다. */
  message: string;
};
