import type { TimerSessionPhase } from "@/src/components/TimerSessionContent";

export type ActiveTimerSession = {
  phase: TimerSessionPhase;
  endTime: number;
  currentCycle: number;
  cycleCount: number;
  focusMinutes: number;
  startedAt: string;
};

let activeTimerSession: ActiveTimerSession | null = null;

export function getActiveTimerSession() {
  return activeTimerSession;
}

export function setActiveTimerSession(session: ActiveTimerSession) {
  activeTimerSession = session;
}

export function clearActiveTimerSession() {
  activeTimerSession = null;
}
