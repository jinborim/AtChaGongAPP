import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTICE_STORAGE_KEY = "adminNotices";

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

  if (!storedNotices) return [];

  try {
    const notices = JSON.parse(storedNotices) as AdminNotice[];
    return notices.sort((a, b) => {
      const statusOrder = Number(isAdminNoticeEnded(a)) - Number(isAdminNoticeEnded(b));

      if (statusOrder !== 0) return statusOrder;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch {
    return [];
  }
}

export async function addAdminNotice(
  notice: Omit<AdminNotice, "id" | "createdAt">
) {
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
}

export async function updateAdminNotice(
  id: string,
  changes: Partial<Omit<AdminNotice, "id" | "createdAt">>
) {
  const notices = await getAdminNotices();
  const updatedNotices = notices.map((notice) =>
    notice.id === id ? { ...notice, ...changes } : notice
  );

  await AsyncStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(updatedNotices));
}

export async function endAdminNotice(id: string) {
  await updateAdminNotice(id, { endedAt: new Date().toISOString() });
}

export async function deleteAdminNotice(id: string) {
  const notices = await getAdminNotices();
  const remainingNotices = notices.filter((notice) => notice.id !== id);

  await AsyncStorage.setItem(
    NOTICE_STORAGE_KEY,
    JSON.stringify(remainingNotices)
  );
}

export function isAdminNoticeEnded(notice: AdminNotice) {
  if (notice.endedAt) return true;

  const [year, month, day] = notice.endDate.split("-").map(Number);
  if (!year || !month || !day) return false;

  const endOfNoticeDate = new Date(year, month - 1, day, 23, 59, 59, 999);
  return endOfNoticeDate.getTime() < Date.now();
}
