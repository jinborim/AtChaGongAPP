import { useCallback, useEffect, useState } from "react";
import {
  fetchDailyRecordService,
  fetchMonthStatisticsService,
  FormattedDailyRecord,
  FormattedMonthStatistics,
} from "../services/statisticsService";

export function useMonthStatistics() {
  // 1. 현재 선택된 연/월 관리 (기본값: 오늘 날짜)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // 2. 월별 통계 및 일별 상세 데이터 상태
  const [monthData, setMonthData] = useState<FormattedMonthStatistics | null>(
    null,
  );
  const [selectedDayDetail, setSelectedDayDetail] =
    useState<FormattedDailyRecord | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 3. 로딩 및 에러 상태
  const [isLoadingMonth, setIsLoadingMonth] = useState<boolean>(false);
  const [isLoadingDay, setIsLoadingDay] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1 ~ 12월

  // -------------------------------------------------------------
  // [월별 통계 Fetch] 연/월 변경 시 자동 호출
  // -------------------------------------------------------------
  const loadMonthStatistics = useCallback(async () => {
    setIsLoadingMonth(true);
    setError(null);
    try {
      const data = await fetchMonthStatisticsService(year, month);
      setMonthData(data);
      // 월이 이동하면 선택된 일자 상세 정보 초기화
      setSelectedDate(null);
      setSelectedDayDetail(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("월별 통계를 가져오는 중 오류가 발생했습니다."),
      );
    } finally {
      setIsLoadingMonth(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadMonthStatistics();
  }, [loadMonthStatistics]);

  // -------------------------------------------------------------
  // [이벤트] 이전달 / 다음달 이동
  // -------------------------------------------------------------
  const moveMonth = useCallback((direction: -1 | 1) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1),
    );
  }, []);

  // -------------------------------------------------------------
  // [이벤트] 날짜(일자) 클릭 핸들러
  // -------------------------------------------------------------
  const selectDay = useCallback(
    async (dayNumber: number) => {
      const formattedMonth = String(month).padStart(2, "0");
      const formattedDay = String(dayNumber).padStart(2, "0");
      const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

      setSelectedDate(dateStr);
      setIsLoadingDay(true);

      try {
        const detail = await fetchDailyRecordService(dateStr);
        setSelectedDayDetail(detail);
      } catch (err) {
        console.error("일별 상세 조회 실패:", err);
      } finally {
        setIsLoadingDay(false);
      }
    },
    [year, month],
  );

  // -------------------------------------------------------------
  // 반환 객체
  // -------------------------------------------------------------
  return {
    // 상태 값
    year,
    month,
    monthData,
    selectedDate,
    selectedDayDetail,
    isLoadingMonth,
    isLoadingDay,
    error,

    // 액션 메서드
    moveMonth,
    selectDay,
    refetchMonth: loadMonthStatistics,
  };
}
