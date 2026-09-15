import { apiClient } from "@/src/api";
import { DailyRecordData, MonthStatisticsData } from "./types";

/**
 * 1. 월별 통계 정보 조회 API
 */
export function getMonthStatistics(year: number, month: number) {
  return apiClient.request<MonthStatisticsData>(
    `/statistics/calendar/${year}/${month}`,
  );
}

/**
 * 2. 일별 상세 정보 조회 API
 */
export function getDailyRecord(date: string) {
  return apiClient.request<DailyRecordData>("/focus-records/daily", {
    query: { date },
  });
}
