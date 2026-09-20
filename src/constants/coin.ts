export const MOCK_COIN_BALANCE = 1250;
export const FOCUS_COMPLETION_REWARD = 3;
export const DAILY_ATTENDANCE_REWARD = 10;
export const WEEKLY_ATTENDANCE_REWARD = 70;
export const MOCK_ATTENDANCE_DAY = 3;

export const MOCK_ATTENDANCE_DATE_STORAGE_KEY =
  "atchagong.mock-attendance-reward-date.v1";

export function getSeoulDateKey(now = Date.now()) {
  return new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
