import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { FactoryEvent, MOCK_EVENTS } from "../mock/plan";
import apiClient from "../services/apiClient";

export function useEventData(targetMonth: string) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<FactoryEvent[]>([]);

  const fetchEvents = useCallback(async () => {
    console.log("[useEventData] ===========================");
    console.log("[useEventData] fetchEvents 호출");
    console.log(
      `[useEventData] 서버 요청 시작 -> GET /api/events?month=${targetMonth}`,
    );

    try {
      const response = await apiClient.get<FactoryEvent[]>(
        `/api/events?month=${targetMonth}`,
      );

      console.log("[useEventData] 서버 응답 성공");
      console.log("[useEventData] response.data:", response.data);

      const serverEvents = response.data ?? [];
      console.log(
        `[useEventData] SERVER 일정 수신 성공 (${serverEvents.length}건)`,
      );

      const mappedEvents: FactoryEvent[] = serverEvents.map((item) => ({
        id: item.id,
        date: item.date,
        content: item.content,
      }));

      const sortedEvents = mappedEvents.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      setEvents(sortedEvents);
    } catch (error) {
      console.error("[useEventData] 일정 서버 조회 실패:", error);
      console.log("[useEventData] MOCK 데이터로 fallback 실행");
      setEvents(MOCK_EVENTS);
    } finally {
      console.log("[useEventData] fetch 종료");
      console.log("[useEventData] ===========================");
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetMonth]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await fetchEvents();
  };

  return {
    events,
    loading,
    refreshing,
    refresh,
  };
}
