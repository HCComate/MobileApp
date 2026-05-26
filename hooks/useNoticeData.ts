import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { MOCK_NOTICES, Notice } from "../mock/notice";
import apiClient from "../services/apiClient";

export function useNoticeData() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);

  const fetchNotices = async () => {
    console.log("[useNoticeData] ===========================");
    console.log("[useNoticeData] fetchNotices 호출");
    console.log("[useNoticeData] 서버 요청 시작 -> GET /api/notices");

    try {
      const response = await apiClient.get<Notice[]>("/api/notices");

      console.log("[useNoticeData] 서버 응답 성공");
      console.log("[useNoticeData] response.data:", response.data);

      if (Array.isArray(response.data)) {
        console.log(
          `[useNoticeData] 공지사항 수신 완료 (${response.data.length}건)`,
        );
        setNotices(response.data);
      } else {
        console.warn(
          "[useNoticeData] 응답 데이터가 배열 형태가 아닙니다. MOCK 데이터로 대체합니다.",
        );
        setNotices(MOCK_NOTICES);
      }
    } catch (error) {
      console.error("[useNoticeData] 공지사항 서버 조회 실패:", error);
      console.log("[useNoticeData] MOCK 데이터로 fallback 실행");
      console.log(
        `[useNoticeData] MOCK 데이터 로드 (${MOCK_NOTICES.length}건)`,
      );
      setNotices(MOCK_NOTICES);
    } finally {
      console.log("[useNoticeData] fetch 종료");
      console.log("[useNoticeData] ===========================");
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotices();
    }, []),
  );

  const refresh = async () => {
    setRefreshing(true);
    await fetchNotices();
  };

  return {
    notices,
    loading,
    refreshing,
    refresh,
  };
}
