import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTICE_STORAGE_KEY = "adminNotices";
let noticeMutationQueue: Promise<void> = Promise.resolve();

export type AdminNotice = {
  id: string;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  endedAt?: string;
};

export async function getAdminNotices(): Promise<AdminNotice[]> {
  const storedNotices = await AsyncStorage.getItem(NOTICE_STORAGE_KEY);

  if (storedNotices === null) return [];

  let parsedNotices: unknown;

  try {
    parsedNotices = JSON.parse(storedNotices);
  } catch {
    throw new Error("저장된 공지사항 데이터를 읽을 수 없습니다.");
  }

  if (!Array.isArray(parsedNotices)) {
    throw new Error("저장된 공지사항 데이터 형식이 올바르지 않습니다.");
  }

  if (!parsedNotices.every(isAdminNotice)) {
    throw new Error("저장된 공지사항 항목이 손상되었습니다.");
  }

  return parsedNotices.sort((a, b) => {
      const statusOrder =
        Number(isAdminNoticeEnded(a)) - Number(isAdminNoticeEnded(b));

      if (statusOrder !== 0) return statusOrder;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function addAdminNotice(
  notice: Omit<AdminNotice, "id" | "createdAt">
) {
  return enqueueNoticeMutation(async () => {
    const notices = await getAdminNotices();
    const newNotice: AdminNotice = {
      ...notice,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      NOTICE_STORAGE_KEY,
      JSON.stringify([newNotice, ...notices])
    );

    return newNotice;
  });
}

export async function updateAdminNotice(
  id: string,
  changes: Partial<Omit<AdminNotice, "id" | "createdAt">>
) {
  return enqueueNoticeMutation(async () => {
    const notices = await getAdminNotices();
    const updatedNotices = notices.map((notice) =>
      notice.id === id ? { ...notice, ...changes } : notice
    );

    await AsyncStorage.setItem(
      NOTICE_STORAGE_KEY,
      JSON.stringify(updatedNotices)
    );
  });
}

export async function endAdminNotice(id: string) {
  await updateAdminNotice(id, { endedAt: new Date().toISOString() });
}

export async function deleteAdminNotice(id: string) {
  return enqueueNoticeMutation(async () => {
    const notices = await getAdminNotices();
    const remainingNotices = notices.filter((notice) => notice.id !== id);

    await AsyncStorage.setItem(
      NOTICE_STORAGE_KEY,
      JSON.stringify(remainingNotices)
    );
  });
}

export function isAdminNoticeEnded(notice: AdminNotice) {
  if (notice.endedAt) return true;

  const [year, month, day] = notice.endDate.split("-").map(Number);
  if (!year || !month || !day) return false;

  const endOfNoticeDate = new Date(year, month - 1, day, 23, 59, 59, 999);
  return endOfNoticeDate.getTime() < Date.now();
}

function isAdminNotice(value: unknown): value is AdminNotice {
  if (typeof value !== "object" || value === null) return false;

  const notice = value as Record<string, unknown>;

  return (
    typeof notice.id === "string" &&
    typeof notice.title === "string" &&
    typeof notice.content === "string" &&
    typeof notice.startDate === "string" &&
    typeof notice.endDate === "string" &&
    typeof notice.createdAt === "string" &&
    (notice.endedAt === undefined || typeof notice.endedAt === "string")
  );
}

function enqueueNoticeMutation<T>(operation: () => Promise<T>): Promise<T> {
  const queuedOperation = noticeMutationQueue.then(operation, operation);

  noticeMutationQueue = queuedOperation.then(
    () => undefined,
    () => undefined
  );

  return queuedOperation;
}
