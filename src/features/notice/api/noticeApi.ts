import { apiClient } from "@/src/api";
import { NoticeDetail, NoticeList } from "./types";

export function getNotices(page: number, size: number) {
  return apiClient.request<NoticeList>("/notices", {
    query: { page, size },
  });
}

/**
 * 공지사항 상세 조회
 * @param noticeId 공지사항 ID
 */
export function getNoticeDetail(noticeId: number) {
  return apiClient.request<NoticeDetail>(`/notices/${noticeId}`);
}
