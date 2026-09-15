import { useCallback, useEffect, useState } from "react";
import {
  fetchNoticeListService,
  FormattedNoticeList,
} from "../services/noticeService";

export function useNotices(initialPage = 0, initialSize = 10) {
  const [data, setData] = useState<FormattedNoticeList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotices = useCallback(async (page: number, size: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchNoticeListService(page, size);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices(initialPage, initialSize);
  }, [fetchNotices, initialPage, initialSize]);

  /** 특정 페이지로 요청하는 함수 */
  const changePage = (page: number) => {
    fetchNotices(page, initialSize);
  };

  /** 현재 페이지 재요청(새로고침) */
  const refetch = () => {
    if (data) {
      fetchNotices(data.page, initialSize);
    } else {
      fetchNotices(initialPage, initialSize);
    }
  };

  return {
    notices: data?.content ?? [], // FormattedNoticeListItem[]
    page: data?.page ?? 0,
    size: data?.size ?? initialSize,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
    changePage,
    refetch,
  };
}
