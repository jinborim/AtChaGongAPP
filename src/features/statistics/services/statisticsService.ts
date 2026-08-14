// -------------------------------------------------------------
// Helper: 초(sec)를 "HH:MM:SS" (00:00:00) 형태의 문자열로 가공

import {
  DailyRecordData,
  getDailyRecord,
  getMonthStatistics,
  MonthStatisticsData,
} from "../api";

// -------------------------------------------------------------
export const formatSecondsToHMS = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds <= 0) return "00:00:00";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = (totalSeconds % 3600) % 60;

  const pad = (num: number) => String(num).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// -------------------------------------------------------------
// Service Interfaces
// -------------------------------------------------------------
export interface FormattedMonthStatistics extends MonthStatisticsData {
  totalFocusedTimeFormatted: string; // 00:00:00
  bestDayFormattedTime: string | null; // 00:00:00 (bestDay가 null이면 null)
}

export interface FormattedDailyRecord extends DailyRecordData {
  totalFocusedTimeFormatted: string; // 00:00:00
}

// -------------------------------------------------------------
// Service UseCases
// -------------------------------------------------------------

/**
 * 1. 월별 통계 조회 서비스
 * - 초 단위 시간을 HH:MM:SS 포맷으로 변환하여 반환
 */
export async function fetchMonthStatisticsService(
  year: number,
  month: number,
): Promise<FormattedMonthStatistics> {
  const data = await getMonthStatistics(year, month);

  return {
    ...data,
    totalFocusedTimeFormatted: formatSecondsToHMS(data.totalFocusedSeconds),
    bestDayFormattedTime: data.bestDay
      ? formatSecondsToHMS(data.bestDay.focusedSeconds)
      : null,
  };
}

/**
 * 2. 일별 상세 기록 조회 서비스
 * - 초 단위 시간을 HH:MM:SS 포맷으로 변환하여 반환
 */
export async function fetchDailyRecordService(
  date: string,
): Promise<FormattedDailyRecord> {
  const data = await getDailyRecord(date);

  return {
    ...data,
    totalFocusedTimeFormatted: formatSecondsToHMS(data.totalFocusedSeconds),
  };
}
