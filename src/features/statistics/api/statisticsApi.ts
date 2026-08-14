import { apiClient } from "@/src/api/client";

import type { StatisticsPeriod, StatisticsSummary } from "./types";

export function getStatisticsSummary(period: StatisticsPeriod = "TODAY") {
  return apiClient.request<StatisticsSummary>("/statistics/summary", {
    query: { period },
  });
}
