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

function enqueue(action: () => Promise<void>, snapshotKey: string) {
  // Reserve the state before the native work starts so timer ticks cannot queue
  // the same update repeatedly while the previous request is still running.
  lastSnapshot = snapshotKey;
  work = work
    .then(action)
    .catch((error: unknown) => {
      console.warn("타이머 위젯 동기화 실패:", error);
    });
}

export function initializeTimerSurfaces() {
  if (initialized || !native) return;
  initialized = true;
  enqueue(() => native.reset(), JSON.stringify(null));
}

export function syncTimerSurfaces(snapshot: TimerSurfaceSnapshot | null, force = false) {
  if (!native) return;
  initializeTimerSurfaces();
  const key = JSON.stringify(snapshot);
  if (!force && lastSnapshot === key) return;
  enqueue(() => (snapshot ? native.update(snapshot) : native.reset()), key);
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
