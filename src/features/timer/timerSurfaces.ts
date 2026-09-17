import { requireOptionalNativeModule } from "expo";
import { PermissionsAndroid, Platform } from "react-native";
import type { TimerSurfaceSnapshot } from "./timerSurfaceSnapshot";

type TimerSurfacesModule = {
  reset(): Promise<void>;
  update(snapshot: TimerSurfaceSnapshot): Promise<void>;
};

// Expo Go and web continue to support the in-app timer without native surfaces.
const native = requireOptionalNativeModule<TimerSurfacesModule>("TimerSurfaces");
let initialized = false;
let lastSnapshot: string | undefined;
let work: Promise<void> = Promise.resolve();

function enqueue(action: () => Promise<void>) {
  work = work.then(action).catch((error: unknown) => {
    // Retry on an explicit foreground refresh, not on every 50 ms timer tick.
    console.warn("타이머 위젯 동기화 실패:", error);
  });
}

export function initializeTimerSurfaces() {
  if (initialized || !native) return;
  initialized = true;
  // A new JS runtime never restores the display snapshot as an active session.
  enqueue(() => native.reset());
}

export function syncTimerSurfaces(snapshot: TimerSurfaceSnapshot | null, force = false) {
  if (!native) return;
  initializeTimerSurfaces();
  const key = JSON.stringify(snapshot);
  if (!force && lastSnapshot === key) return;
  lastSnapshot = key;
  enqueue(() => (snapshot ? native.update(snapshot) : native.reset()));
}

export async function prepareTimerSurfaces() {
  if (!native || Platform.OS !== "android" || Number(Platform.Version) < 33) return;
  try {
    // Denial only disables the notification; the timer and home widget still work.
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  } catch (error) {
    console.warn("타이머 알림 권한 확인 실패:", error);
  }
}
