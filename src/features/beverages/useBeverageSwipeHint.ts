import { useCallback, useEffect, useRef, useState } from "react";

let hasCompletedInitialHintThisLaunch = false;

export function useBeverageSwipeHint(
  enabled: boolean,
  interactionSignal: number,
) {
  const [isVisible, setIsVisible] = useState(false);
  const previousInteractionSignal = useRef(interactionSignal);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    hideTimer.current = null;
    inactivityTimer.current = null;
  }, []);

  const showHint = useCallback((isInitialDisplay = false) => {
    clearTimers();
    setIsVisible(true);
    hideTimer.current = setTimeout(() => {
      if (isInitialDisplay) hasCompletedInitialHintThisLaunch = true;
      setIsVisible(false);
      hideTimer.current = null;
    }, 5000);
  }, [clearTimers]);

  const registerInteraction = useCallback(() => {
    hasCompletedInitialHintThisLaunch = true;
    clearTimers();
    setIsVisible(false);
    if (enabled) {
      inactivityTimer.current = setTimeout(showHint, 5000);
    }
  }, [clearTimers, enabled, showHint]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      setIsVisible(false);
      return;
    }

    if (!hasCompletedInitialHintThisLaunch) {
      showHint(true);
      inactivityTimer.current = setTimeout(showHint, 5000);
    } else {
      inactivityTimer.current = setTimeout(showHint, 5000);
    }
  }, [clearTimers, enabled, showHint]);

  useEffect(() => {
    if (previousInteractionSignal.current === interactionSignal) return;
    previousInteractionSignal.current = interactionSignal;
    registerInteraction();
  }, [interactionSignal, registerInteraction]);

  useEffect(() => clearTimers, [clearTimers]);

  return { isVisible, registerInteraction };
}
