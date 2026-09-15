import { apiClient } from "@/src/api/client";
import type { PageResponse } from "@/src/api/types";

export type AdminUserSummary = {
  totalUserCount: number;
};

export function getAdminUserSummary() {
  return apiClient.request<AdminUserSummary>("/admin/users/summary");
}

export type AdminNoticeStatus = "published" | "ended";
export type AdminNoticeStatusFilter = AdminNoticeStatus | "all";

export type AdminNoticeSummary = {
  noticeId: number;
  title: string;
  status: AdminNoticeStatus;
  publishStartsAt: string;
  publishEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

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

export type CreateAdminNoticeRequest = {
  title: string;
  content: string;
  imgUrl: string | null;
  status: AdminNoticeStatus;
  publishStartsAt: string;
  publishEndsAt: string | null;
};

export type CreateAdminNoticeResponse = {
  noticeId: number;
};

export function createAdminNotice(request: CreateAdminNoticeRequest) {
  return apiClient.request<CreateAdminNoticeResponse>("/admin/notices", {
    method: "POST",
    body: request,
  });
}

export type GetAdminNoticesRequest = {
  page?: number;
  size?: number;
  status?: AdminNoticeStatusFilter;
};

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

export function getAdminNotice(noticeId: number) {
  return apiClient.request<AdminNoticeDetail>(`/admin/notices/${noticeId}`);
}

export type UpdateAdminNoticeRequest = {
  title?: string;
  content?: string;
  imgUrl?: string | null;
  status?: AdminNoticeStatus;
  publishStartsAt?: string;
  publishEndsAt?: string | null;
};

export type UpdateAdminNoticeResponse = {
  noticeId: number;
  title: string;
  content: string;
  imgUrl: string | null;
  status: AdminNoticeStatus;
  publishStartsAt: string;
  publishEndsAt: string | null;
};

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

export function deleteAdminNotice(noticeId: number) {
  return apiClient.request<void>(`/admin/notices/${noticeId}`, {
    method: "DELETE",
  });
}
