import { apiClient } from "@/src/api/client";

import type { CoinBalance } from "./types";

export function getCoinBalance() {
  return apiClient.request<CoinBalance>("/coins/balance");
}
