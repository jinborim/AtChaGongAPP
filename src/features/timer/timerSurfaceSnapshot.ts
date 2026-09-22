export type TimerSurfaceSession = {
  phase: "focus" | "break";
  endTime: number;
  currentCycle: number;
  cycleCount: number;
  startedAt: string;
};

export type TimerSurfaceSnapshot = {
  sessionId: string;
  /** End of the currently displayed focus or break interval. */
  endTime: number;
  phase: "focus" | "break";
  currentCycle: number;
  cycleCount: number;
  focusDurationMilliseconds: number;
  breakDurationMilliseconds: number;
};

export function makeTimerSurfaceSnapshot(
  session: TimerSurfaceSession,
  focusDurationMilliseconds: number,
  breakDurationMilliseconds: number,
): TimerSurfaceSnapshot {
  return {
    sessionId: session.startedAt,
    endTime: session.endTime,
    phase: session.phase,
    currentCycle: session.currentCycle,
    cycleCount: session.cycleCount,
    focusDurationMilliseconds,
    breakDurationMilliseconds,
  };
}
