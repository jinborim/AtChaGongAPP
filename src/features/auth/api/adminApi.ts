import { apiClient } from "@/src/api/client";
import type { PageResponse } from "@/src/api/types";

/** 관리자 대시보드에 표시하는 현재 가입 사용자 수입니다. */
export type AdminUserSummary = {
  totalUserCount: number;
};

/**
 * 전체 가입 사용자 수를 조회합니다.
 * GET /api/v1/admin/users/summary
 */
export function getAdminUserSummary() {
  return apiClient.request<AdminUserSummary>("/admin/users/summary");
}

/** 서버에 저장되는 공지 게시 상태입니다. */
export type AdminNoticeStatus = "published" | "ended";

/** 공지 목록 조회에서 사용하는 상태 필터입니다. */
export type AdminNoticeStatusFilter = AdminNoticeStatus | "all";

/** 공지 목록 API가 반환하는 공지 요약 정보입니다. */
export type AdminNoticeSummary = {
  noticeId: number;
  title: string;
  status: AdminNoticeStatus;
  publishStartsAt: string;
  publishEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** 공지 상세 API가 반환하는 전체 공지 정보입니다. */
export type AdminNoticeDetail = {
  noticeId: number;
  title: string;
  content: string;
  imgUrl: string | null;
  status: AdminNoticeStatus;
  isNew: boolean;
  publishStartsAt: string;
  publishEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * 공지 등록 요청 본문입니다.
 * 날짜는 ISO 8601 형식으로 전달하며 종료일이 없으면 null을 사용합니다.
 */
export type CreateAdminNoticeRequest = {
  title: string;
  content: string;
  imgUrl: string | null;
  status: AdminNoticeStatus;
  publishStartsAt: string;
  publishEndsAt: string | null;
};

/** 공지 등록 성공 시 서버가 반환하는 새 공지 ID입니다. */
export type CreateAdminNoticeResponse = {
  noticeId: number;
};

/**
 * 관리자 공지를 등록합니다.
 * POST /api/v1/admin/notices
 */
export function createAdminNotice(request: CreateAdminNoticeRequest) {
  return apiClient.request<CreateAdminNoticeResponse>("/admin/notices", {
    method: "POST",
    body: request,
  });
}

/** 관리자 공지 목록의 페이지, 크기, 상태 조회 조건입니다. */
export type GetAdminNoticesRequest = {
  page?: number;
  size?: number;
  status?: AdminNoticeStatusFilter;
};

/**
 * 관리자 공지 목록을 최신 생성순으로 조회합니다.
 * GET /api/v1/admin/notices?page=0&size=20&status=all
 */
export function getAdminNotices({
  page = 0,
  size = 20,
  status = "all",
}: GetAdminNoticesRequest = {}) {
  return apiClient.request<PageResponse<AdminNoticeSummary>>(
    "/admin/notices",
    {
      query: { page, size, status },
    },
  );
}

/**
 * 게시 상태와 관계없이 관리자용 공지 상세 정보를 조회합니다.
 * GET /api/v1/admin/notices/{noticeId}
 */
export function getAdminNotice(noticeId: number) {
  return apiClient.request<AdminNoticeDetail>(`/admin/notices/${noticeId}`);
}

/**
 * 공지 부분 수정 요청 본문입니다.
 * PATCH 요청이므로 변경할 필드만 전달할 수 있지만 빈 객체는 허용되지 않습니다.
 */
export type UpdateAdminNoticeRequest = {
  title?: string;
  content?: string;
  imgUrl?: string | null;
  status?: AdminNoticeStatus;
  publishStartsAt?: string;
  publishEndsAt?: string | null;
};

/** 공지 수정 성공 후 서버가 반환하는 수정 결과입니다. */
export type UpdateAdminNoticeResponse = {
  noticeId: number;
  title: string;
  content: string;
  imgUrl: string | null;
  status: AdminNoticeStatus;
  publishStartsAt: string;
  publishEndsAt: string | null;
};

/**
 * 지정한 공지를 부분 수정합니다.
 * PATCH /api/v1/admin/notices/{noticeId}
 */
export function updateAdminNotice(
  noticeId: number,
  request: UpdateAdminNoticeRequest,
) {
  return apiClient.request<UpdateAdminNoticeResponse>(
    `/admin/notices/${noticeId}`,
    {
      method: "PATCH",
      body: request,
    },
  );
}

/**
 * 지정한 공지를 삭제합니다. 성공 시 서버는 204 No Content를 반환합니다.
 * DELETE /api/v1/admin/notices/{noticeId}
 */
export function deleteAdminNotice(noticeId: number) {
  return apiClient.request<void>(`/admin/notices/${noticeId}`, {
    method: "DELETE",
  });
}
