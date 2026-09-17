export type TimerSurfaceSession = {
  phase: string;
  endTime: number;
  currentCycle: number;
  cycleCount: number;
  startedAt: string;
};

export type TimerSurfaceSnapshot = {
  sessionId: string;
  /** Whole session, including the final break. Display only, never a completion record. */
  endTime: number;
  cycleCount: number;
};

export function makeTimerSurfaceSnapshot(
  session: TimerSurfaceSession,
  focusMilliseconds: number,
  breakMilliseconds: number,
): TimerSurfaceSnapshot {
  const remainingCycles = Math.max(0, session.cycleCount - session.currentCycle);
  return {
    sessionId: session.startedAt,
    endTime:
      session.endTime +
      (session.phase === "focus" ? breakMilliseconds : 0) +
      remainingCycles * (focusMilliseconds + breakMilliseconds),
    cycleCount: session.cycleCount,
  };
}
