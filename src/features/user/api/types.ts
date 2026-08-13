export type UserStatus = "ACTIVE" | "INACTIVE" | "WITHDRAWN" | string;

export type UserRole = "USER" | "ADMIN" | string;

export type Me = {
  nickname: string;
  userStatus: UserStatus;
  userRole: UserRole;
  onboardingCompleted: boolean;
  lastLoginAt: string | null;
};
