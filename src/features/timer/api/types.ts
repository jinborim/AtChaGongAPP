export type Beverage = {
  beverageId: number;
  name: string;
  imgUrl: string;
};

export type TimerSettings = {
  beverage: Beverage | null;
  focusMinutes: number;
  breakMinutes: number;
  cycleCount: number;
  isCustomized?: boolean;
};

export type UpdateTimerSettingsRequest = {
  beverageId: number;
  focusMinutes: number;
  breakMinutes: number;
  cycleCount: number;
};

export type CompleteFocusRecordRequest = {
  beverageId: number;
  focusMinutes: number;
  focusedSeconds: number;
  startedAt: string;
  completedAt: string;
};
