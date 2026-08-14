/**
 * 1. 월별 통계 API
 */

// 월별 각 일에 따른 컵 잔디 개수
export type DayIntensityInfo = {
  date: string; // "YYYY-MM-DD"
  intensityLevel: number; // 0, 1, 2, 3 ...
};

// 이번달 최대 집중 날 정보
export type BestDayInfo = {
  date: string; // "YYYY-MM-DD"
  focusedSeconds: number;
  completedCupCount: number;
};

// 월별 통계 API 최종 Response 타입
export type MonthStatisticsData = {
  year: number;
  month: number;
  totalFocusedSeconds: number;
  completedCupCount: number;
  bestDay: BestDayInfo | null; // 집중 기록이 없는 달일 경우 null 가능
  days: DayIntensityInfo[]; // 해당 월에 컵이 전부 0인 경우 빈 배열이 올것
};

/**
 * 2. 일별 상세 정보 API 관련 타입 (GET /api/.../day)
 */

// 일별 상세 정보 Response 타입
export type DailyRecordData = {
  date: string; // "YYYY-MM-DD"
  totalFocusedSeconds: number;
  completedCupCount: number;
};
