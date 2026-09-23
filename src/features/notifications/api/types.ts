export type NotificationSettings = {
  focusStartEnabled: boolean;
  focusEndEnabled: boolean;
  breakEndEnabled: boolean;
};

export type UpdateNotificationSettingsRequest = NotificationSettings;

export type DailyNotificationSettings = {
  notificationTime: string;
  enabled: boolean;
};

export type UpdateDailyNotificationRequest = DailyNotificationSettings;

export type DeviceTokenRequestPlatform = "ANDROID" | "IOS";
export type DeviceTokenResponsePlatform = "android" | "ios";

export type RegisterDeviceTokenRequest = {
  token: string;
  platform: DeviceTokenRequestPlatform;
};

export type DeactivateDeviceTokenRequest = {
  token: string;
};

export type DeviceTokenRegistration = {
  deviceTokenId: number;
  platform: DeviceTokenResponsePlatform;
  active: boolean;
  lastUsedAt: string;
};
