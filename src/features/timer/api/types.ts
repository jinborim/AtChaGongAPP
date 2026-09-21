export type TimerSettings = {
  focusMinutes: number;
  breakMinutes: number;
  cycleCount: number;
  isCustomized?: boolean;
};

export type UpdateTimerSettingsRequest = {
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

export type FocusRecord = CompleteFocusRecordRequest & {
  focusRecordId: number;
  focusedDate: string;
};
