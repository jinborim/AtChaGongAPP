import { useCallback, useEffect, useState } from "react";
import {
  fetchNoticeDetailService,
  FormattedNoticeDetail,
} from "../services/noticeService";

export function useNoticeDetail(noticeId: number) {
  const [notice, setNotice] = useState<FormattedNoticeDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!noticeId) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchNoticeDetailService(noticeId);
      setNotice(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [noticeId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    notice, // FormattedNoticeDetail | null (createdAtFormatted 포함)
    isLoading,
    error,
    refetch: fetchDetail,
  };
}
