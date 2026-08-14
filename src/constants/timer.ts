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

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

export const TIMER_QA_MODE = process.env.EXPO_PUBLIC_TIMER_QA_MODE === "true";
export const TIMER_QA_FOCUS_SECONDS = parsePositiveNumber(
  process.env.EXPO_PUBLIC_TIMER_QA_FOCUS_SECONDS,
  5,
);
export const TIMER_QA_BREAK_SECONDS = parsePositiveNumber(
  process.env.EXPO_PUBLIC_TIMER_QA_BREAK_SECONDS,
  3,
);

export const getFocusDurationMilliseconds = (focusMinutes: number) =>
  TIMER_QA_MODE
    ? TIMER_QA_FOCUS_SECONDS * 1000
    : focusMinutes * 60 * 1000;

export const getBreakDurationMilliseconds = () =>
  TIMER_QA_MODE ? TIMER_QA_BREAK_SECONDS * 1000 : BREAK_MINUTES * 60 * 1000;
