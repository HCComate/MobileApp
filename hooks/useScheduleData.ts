import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { MOCK_SCHEDULES, WorkerSchedule } from "../mock/schedule";
import apiClient from "../services/apiClient";

export function useScheduleData(selectedDate: string) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workers, setWorkers] = useState<WorkerSchedule[]>([]);

  const fetchSchedules = useCallback(async () => {
    console.log("[useScheduleData] ===========================");
    console.log("[useScheduleData] fetchSchedules 호출");
    console.log(
      `[useScheduleData] 서버 요청 시작 -> GET /api/schedules?date=${selectedDate}`,
    );

    try {
      const response = await apiClient.get<WorkerSchedule[]>(
        `/api/schedules?date=${selectedDate}`,
      );

      console.log("[useScheduleData] 서버 응답 성공");
      console.log("[useScheduleData] response.data:", response.data);

      if (Array.isArray(response.data)) {
        console.log(
          `[useScheduleData] 근무표 수신 완료 (${response.data.length}명)`,
        );
        setWorkers(response.data);
      } else {
        console.warn(
          "[useScheduleData] 응답 데이터가 배열 형태가 아닙니다. MOCK 데이터로 대체합니다.",
        );
        setWorkers(MOCK_SCHEDULES[selectedDate] || []);
      }
    } catch (error) {
      console.error("[useScheduleData] 근무표 서버 조회 실패:", error);
      console.log("[useScheduleData] MOCK 데이터로 fallback 실행");
      setWorkers(MOCK_SCHEDULES[selectedDate] || []);
    } finally {
      console.log("[useScheduleData] fetch 종료");
      console.log("[useScheduleData] ===========================");
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [fetchSchedules]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await fetchSchedules();
  };

  return {
    workers,
    loading,
    refreshing,
    refresh,
  };
}
