import { getNoticeDetail, getNotices } from "../api/noticeApi";
import { NoticeDetail, NoticeList, NoticeListItem } from "../api/types";

export const formatDateToYMD = (isoString: string): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
export interface FormattedNoticeListItem extends NoticeListItem {
  createdAtFormatted: string; // YYYY.MM.DD
}

export interface FormattedNoticeList extends Omit<NoticeList, "content"> {
  content: FormattedNoticeListItem[];
}

export interface FormattedNoticeDetail extends NoticeDetail {
  createdAtFormatted: string; // YYYY.MM.DD
}

/**
 * 1. 공지 목록 조회 서비스
 * - createdAt 필드를 가공한 createdAtFormatted 추가
 */
export async function fetchNoticeListService(
  page: number,
  size: number,
): Promise<FormattedNoticeList> {
  const data = await getNotices(page, size);

  return {
    ...data,
    content: data.content.map((item) => ({
      ...item,
      createdAtFormatted: formatDateToYMD(item.createdAt),
    })),
  };
}

/**
 * 2. 공지 상세 조회 서비스
 * - createdAt 필드를 가공한 createdAtFormatted 추가
 */
export async function fetchNoticeDetailService(
  noticeId: number,
): Promise<FormattedNoticeDetail> {
  const data = await getNoticeDetail(noticeId);

  return {
    ...data,
    createdAtFormatted: formatDateToYMD(data.createdAt),
  };
}
