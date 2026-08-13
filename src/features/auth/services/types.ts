export type SocialLoginResult = {
  /** 로그인 성공 후 온보딩 완료 여부입니다. false이면 온보딩 화면으로 이동합니다. */
  isOnboardingCompleted: boolean;
};

export type SocialProviderLoginState = {
  /** provider 로그인 또는 백엔드 로그인 요청이 진행 중인지 나타냅니다. */
  isLoading: boolean;
  /** 현재 처리 중인 provider입니다. 진행 중인 요청이 없으면 null입니다. */
  provider: "GOOGLE" | "KAKAO" | "APPLE" | null;
};
