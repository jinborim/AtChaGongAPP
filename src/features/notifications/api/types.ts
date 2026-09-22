export type NotificationSettings = {
  focusStartEnabled: boolean;
  focusEndEnabled: boolean;
  breakEndEnabled: boolean;
  seasonalBeverageEnabled: boolean;
};

export type UpdateNotificationSettingsRequest = NotificationSettings;

export type DeviceTokenRequestPlatform = "ANDROID" | "IOS";
export type DeviceTokenResponsePlatform = "android" | "ios";

export type RegisterDeviceTokenRequest = {
  token: string;
  platform: DeviceTokenRequestPlatform;
};

export type DeviceTokenRegistration = {
  deviceTokenId: number;
  platform: DeviceTokenResponsePlatform;
  active: boolean;
  lastUsedAt: string;
};
