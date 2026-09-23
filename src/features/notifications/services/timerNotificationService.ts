import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { TIMER_NOTIFICATION_CHANNEL_ID } from "./notificationService";

const TIMER_NOTIFICATION_IDS_STORAGE_KEY = "timerNotificationIds";

type TimerNotificationType = "focusComplete" | "breakComplete";

type TimerNotificationPlanItem = {
  type: TimerNotificationType;
  cycleNumber: number;
  triggerAt: number;
};

export type ScheduleTimerNotificationsParams = {
  startTime: number;
  focusDurationMilliseconds: number;
  breakDurationMilliseconds: number;
  cycleCount: number;
};

function validateScheduleParams({
  startTime,
  focusDurationMilliseconds,
  breakDurationMilliseconds,
  cycleCount,
}: ScheduleTimerNotificationsParams) {
  if (!Number.isFinite(startTime) || startTime <= 0) {
    throw new Error("타이머 시작 시각이 올바르지 않습니다.");
  }

  if (
    !Number.isFinite(focusDurationMilliseconds) ||
    focusDurationMilliseconds <= 0 ||
    !Number.isFinite(breakDurationMilliseconds) ||
    breakDurationMilliseconds <= 0
  ) {
    throw new Error("타이머 집중 또는 휴식 시간이 올바르지 않습니다.");
  }

  if (!Number.isInteger(cycleCount) || cycleCount <= 0) {
    throw new Error("타이머 사이클 수가 올바르지 않습니다.");
  }
}

function createTimerNotificationPlan(
  params: ScheduleTimerNotificationsParams,
) {
  validateScheduleParams(params);

  const {
    startTime,
    focusDurationMilliseconds,
    breakDurationMilliseconds,
    cycleCount,
  } = params;
  const plan: TimerNotificationPlanItem[] = [];

  for (let cycleNumber = 1; cycleNumber <= cycleCount; cycleNumber += 1) {
    plan.push({
      type: "focusComplete",
      cycleNumber,
      triggerAt:
        startTime +
        focusDurationMilliseconds * cycleNumber +
        breakDurationMilliseconds * (cycleNumber - 1),
    });

    if (cycleNumber < cycleCount) {
      plan.push({
        type: "breakComplete",
        cycleNumber,
        triggerAt:
          startTime +
          focusDurationMilliseconds * cycleNumber +
          breakDurationMilliseconds * cycleNumber,
      });
    }
  }

  return plan;
}

function getNotificationContent(item: TimerNotificationPlanItem) {
  if (item.type === "focusComplete") {
    return {
      title: "집중 시간이 끝났어요!",
      body: "얼음이 전부 녹았어요! 이제 잠시 얼음을 얼리면서 쉬어볼까요?",
    };
  }

  return {
    title: "휴식 시간이 끝났어요!",
    body: "얼음이 전부 얼었어요! 이제 얼음을 녹여보자구요!",
  };
}

async function readTimerNotificationIds() {
  const storedIds = await AsyncStorage.getItem(
    TIMER_NOTIFICATION_IDS_STORAGE_KEY,
  );

  if (!storedIds) {
    return [];
  }

  try {
    const parsedIds: unknown = JSON.parse(storedIds);

    if (
      Array.isArray(parsedIds) &&
      parsedIds.every((identifier) => typeof identifier === "string")
    ) {
      return [...new Set(parsedIds)];
    }
  } catch {
    // 손상된 저장 값은 아래에서 제거합니다.
  }

  await AsyncStorage.removeItem(TIMER_NOTIFICATION_IDS_STORAGE_KEY);
  return [];
}

async function storeTimerNotificationIds(identifiers: string[]) {
  await AsyncStorage.setItem(
    TIMER_NOTIFICATION_IDS_STORAGE_KEY,
    JSON.stringify(identifiers),
  );
}

async function cancelNotificationIds(identifiers: string[]) {
  const results = await Promise.allSettled(
    identifiers.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier),
    ),
  );

  return identifiers.filter((_, index) => results[index].status === "rejected");
}

/** 현재 타이머에 예약된 미래 알림을 모두 취소합니다. */
export async function cancelTimerNotifications() {
  const identifiers = await readTimerNotificationIds();

  if (identifiers.length === 0) {
    return;
  }

  const failedIdentifiers = await cancelNotificationIds(identifiers);

  if (failedIdentifiers.length > 0) {
    await storeTimerNotificationIds(failedIdentifiers);
    throw new Error("일부 타이머 알림 예약을 취소하지 못했습니다.");
  }

  await AsyncStorage.removeItem(TIMER_NOTIFICATION_IDS_STORAGE_KEY);
}

/** 이미 전달된 타이머가 보관한 예약 ID만 정리합니다. */
export async function clearTimerNotificationIds() {
  await AsyncStorage.removeItem(TIMER_NOTIFICATION_IDS_STORAGE_KEY);
}

/** 전체 사이클의 집중·휴식 종료 알림을 일회성 알림으로 예약합니다. */
export async function scheduleTimerNotifications(
  params: ScheduleTimerNotificationsParams,
) {
  if (Platform.OS === "web") {
    return [];
  }

  await cancelTimerNotifications();

  const plan = createTimerNotificationPlan(params);
  const scheduledIdentifiers: string[] = [];

  try {
    for (const item of plan) {
      const content = getNotificationContent(item);
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          ...content,
          sound: "default",
          data: {
            type: item.type,
            cycleNumber: item.cycleNumber,
            url: "/homeSetting",
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(item.triggerAt),
          channelId: TIMER_NOTIFICATION_CHANNEL_ID,
        },
      });

      scheduledIdentifiers.push(identifier);
      await storeTimerNotificationIds(scheduledIdentifiers);
    }
  } catch (error) {
    const failedIdentifiers = await cancelNotificationIds(
      scheduledIdentifiers,
    );

    if (failedIdentifiers.length > 0) {
      await storeTimerNotificationIds(failedIdentifiers);
    } else {
      await AsyncStorage.removeItem(TIMER_NOTIFICATION_IDS_STORAGE_KEY);
    }

    throw error;
  }

  return scheduledIdentifiers;
}
