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
  /** End of the complete focus and break session. */
  sessionEndTime: number;
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
  const remainingCycleCount = Math.max(
    0,
    session.cycleCount - session.currentCycle,
  );
  const remainingSessionMilliseconds =
    remainingCycleCount *
      (focusDurationMilliseconds + breakDurationMilliseconds) +
    (session.phase === "focus" ? breakDurationMilliseconds : 0);

  return {
    sessionId: session.startedAt,
    endTime: session.endTime,
    sessionEndTime: session.endTime + remainingSessionMilliseconds,
    phase: session.phase,
    currentCycle: session.currentCycle,
    cycleCount: session.cycleCount,
    focusDurationMilliseconds,
    breakDurationMilliseconds,
  };
}
