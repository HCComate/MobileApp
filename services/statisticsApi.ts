import {
  createMockInspectionStats,
  InspectionPeriod,
  InspectionStatsData,
} from "../mock/inspectionStatsMock";
import { isServerMode } from "../mock/userData";
import api from "./api";

export const fetchInspectionStats = async (
  period: InspectionPeriod,
): Promise<InspectionStatsData> => {
  if (!isServerMode) {
    console.log(`[Statistics API] 로컬 목업 모드로 ${period} 통계 데이터 생성`);
    return createMockInspectionStats(period);
  }

  try {
    console.log(
      `[Statistics API] 공통 인스턴스로 서버 통신 시도: /statistics/${period}`,
    );
    const response = await api.get(`/statistics/${period}`, {
      timeout: 2000,
    });

    if (response.status === 200 && response.data) {
      return response.data;
    }

    throw new Error("Invalid server response structure");
  } catch (error) {
    console.error("[Statistics API Error]:", error);
    return createMockInspectionStats(period);
  }
};
