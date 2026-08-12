import {
  DEFAULT_FOCUS_MINUTES,
  MAX_CYCLE_COUNT,
  MAX_FOCUS_MINUTES,
  MIN_CYCLE_COUNT,
  MIN_FOCUS_MINUTES,
} from "../constants/timer";

const parseStoredNumber = (
  value: string | null,
  fallback: number,
  min: number,
  max: number
) => {
  if (value === null || value.trim() === "") return fallback;

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) return fallback;

  return Math.min(max, Math.max(min, parsedValue));
};

export const parseStoredFocusMinutes = (value: string | null) =>
  parseStoredNumber(
    value,
    DEFAULT_FOCUS_MINUTES,
    MIN_FOCUS_MINUTES,
    MAX_FOCUS_MINUTES
  );

export const parseStoredCycleCount = (value: string | null) =>
  parseStoredNumber(
    value,
    MIN_CYCLE_COUNT,
    MIN_CYCLE_COUNT,
    MAX_CYCLE_COUNT
  );
