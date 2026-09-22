export type UserStatus = "ACTIVE" | "INACTIVE" | "WITHDRAWN" | string;

export type UserRole = "USER" | "ADMIN" | string;

export type Me = {
  nickname: string | null;
  userStatus: UserStatus;
  userRole: UserRole;
  onboardingCompleted: boolean;
  lastLoginAt: string | null;
};

export type UpdateNicknameRequest = {
  nickname: string;
};

export type UpdateNicknameResponse = {
  userId: string;
  nickname: string;
};

export type CompleteOnboardingResponse = {
  completed: boolean;
};

export type DeleteMeResponse = {
  message: string;
};

export type UserProfile = {
  profileId: number;
  profileImg: string;
  name: string;
};

export type ProfileImageSummary = {
  profileId: number;
  imgUrl: string;
};

export type UpdateProfileRequest = {
  profileId: number;
};

export type UpdateProfileResponse = {
  profileId: number;
  imgUrl: string;
};
