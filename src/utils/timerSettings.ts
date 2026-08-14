import {
  DEFAULT_CYCLE_COUNT,
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
  max: number,
) => {
  if (value === null || value.trim() === "") return fallback;

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) return fallback;

  return Math.min(max, Math.max(min, parsedValue));
};

export const normalizeFocusMinutes = (value: number) => {
  if (!Number.isFinite(value)) return DEFAULT_FOCUS_MINUTES;

  return Math.min(MAX_FOCUS_MINUTES, Math.max(MIN_FOCUS_MINUTES, value));
};

export const normalizeCycleCount = (value: number) => {
  if (!Number.isFinite(value)) return DEFAULT_CYCLE_COUNT;

  return Math.min(MAX_CYCLE_COUNT, Math.max(MIN_CYCLE_COUNT, value));
};

export const normalizeCurrentCycle = (value: number) => {
  if (!Number.isFinite(value)) return MIN_CYCLE_COUNT;

  return Math.min(MAX_CYCLE_COUNT, Math.max(MIN_CYCLE_COUNT, value));
};

export const getCycleSegmentFlexes = (focusMinutes: number) => {
  const focusRange = MAX_FOCUS_MINUTES - MIN_FOCUS_MINUTES;
  const progress =
    focusRange === 0 ? 0 : (focusMinutes - MIN_FOCUS_MINUTES) / focusRange;
  const focusPercent = 66 + Math.min(1, Math.max(0, progress)) * 16;

  return {
    focus: focusPercent,
    break: 100 - focusPercent,
  };
};

export const parseStoredFocusMinutes = (value: string | null) =>
  parseStoredNumber(
    value,
    DEFAULT_FOCUS_MINUTES,
    MIN_FOCUS_MINUTES,
    MAX_FOCUS_MINUTES,
  );

export const parseStoredCycleCount = (value: string | null) =>
  parseStoredNumber(
    value,
    DEFAULT_CYCLE_COUNT,
    MIN_CYCLE_COUNT,
    MAX_CYCLE_COUNT,
  );

export const parseStoredCurrentCycle = (value: string | null) =>
  parseStoredNumber(
    value,
    MIN_CYCLE_COUNT,
    MIN_CYCLE_COUNT,
    MAX_CYCLE_COUNT,
  );
