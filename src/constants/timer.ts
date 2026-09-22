export const MIN_FOCUS_MINUTES = 25;
export const MAX_FOCUS_MINUTES = 60;
export const FOCUS_MINUTES_STEP = 5;
export const DEFAULT_FOCUS_MINUTES = 25;
export const BREAK_MINUTES = 5;
export const DEFAULT_BEVERAGE_ID = 1;

export const MIN_CYCLE_COUNT = 1;
export const MAX_CYCLE_COUNT = 4;
export const DEFAULT_CYCLE_COUNT = 4;
export const CYCLE_COUNT_STEP = 1;

export const getFocusDurationMilliseconds = (focusMinutes: number) =>
  focusMinutes * 60 * 1000;

export const getBreakDurationMilliseconds = (
  breakMinutes = BREAK_MINUTES,
) => breakMinutes * 60 * 1000;
