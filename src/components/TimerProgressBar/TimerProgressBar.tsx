import { View } from "react-native";

import { MAX_CYCLE_COUNT } from "../../constants/timer";
import { getCycleSegmentFlexes } from "../../utils/timerSettings";

export type TimerProgressPhase = "idle" | "focus" | "break" | "complete";

export type TimerProgressBarProps = {
  cycleCount?: number;
  focusMinutes: number;
  activeCycle?: number;
  activeProgress?: number;
  phase?: TimerProgressPhase;
  heightClassName?: string;
  gapClassName?: string;
};

const FOCUS_COLOR = "#87D7FE";
const BREAK_COLOR = "#FFD298";

const clampProgress = (value: number) => {
  if (!Number.isFinite(value)) return 0;

  return Math.min(1, Math.max(0, value));
};

function getCyclePhase({
  cycleNumber,
  activeCycle,
  phase,
}: {
  cycleNumber: number;
  activeCycle: number;
  phase: TimerProgressPhase;
}) {
  if (cycleNumber < activeCycle) return "complete";
  if (cycleNumber === activeCycle) return phase;

  return "idle";
}

export default function TimerProgressBar({
  cycleCount = MAX_CYCLE_COUNT,
  focusMinutes,
  activeCycle = cycleCount,
  activeProgress = 1,
  phase = "complete",
  heightClassName = "h-2",
  gapClassName = "gap-1",
}: TimerProgressBarProps) {
  const cycleSegmentFlexes = getCycleSegmentFlexes(focusMinutes);
  const progress = clampProgress(activeProgress);

  return (
    <View className={`flex-row items-center ${gapClassName}`}>
      {Array.from({ length: cycleCount }).map((_, index) => {
        const cycleNumber = index + 1;
        const cyclePhase = getCyclePhase({
          cycleNumber,
          activeCycle,
          phase,
        });

        return (
          <View
            key={cycleNumber}
            className={`${heightClassName} flex-1 flex-row overflow-hidden rounded-full bg-primary/10`}
          >
            {cyclePhase === "complete" && (
              <>
                <View
                  style={{
                    backgroundColor: FOCUS_COLOR,
                    flex: cycleSegmentFlexes.focus,
                  }}
                />
                <View
                  style={{
                    backgroundColor: BREAK_COLOR,
                    flex: cycleSegmentFlexes.break,
                  }}
                />
              </>
            )}

            {cyclePhase === "focus" && (
              <>
                <View
                  style={{
                    backgroundColor: FOCUS_COLOR,
                    flex: cycleSegmentFlexes.focus * progress,
                  }}
                />
                <View
                  style={{
                    flex:
                      cycleSegmentFlexes.focus * (1 - progress) +
                      cycleSegmentFlexes.break,
                  }}
                />
              </>
            )}

            {cyclePhase === "break" && (
              <>
                <View
                  style={{
                    backgroundColor: FOCUS_COLOR,
                    flex: cycleSegmentFlexes.focus,
                  }}
                />
                <View
                  style={{
                    backgroundColor: BREAK_COLOR,
                    flex: cycleSegmentFlexes.break * progress,
                  }}
                />
                <View
                  style={{
                    flex: cycleSegmentFlexes.break * (1 - progress),
                  }}
                />
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}
