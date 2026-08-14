export type StatisticsPeriod = "TODAY" | "MONTH" | "ALL";

export type StatisticsSummary = {
  period: StatisticsPeriod;
  totalFocusedSeconds: number;
  totalFocusedHours: number;
  currentStreakDays: number;
  longestStreakDays: number;
  completedCupCount: number;
  completedCycleCount: number;
};
