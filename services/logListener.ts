import { MOCK_WORKERS } from "../mock/workers";
import { AlertEvent } from "../types/alert";
import { handleAlertEvent } from "./alertManager";
import apiClient from "./apiClient";

console.log("[logListener] module loaded");

let pollInterval: ReturnType<typeof setInterval> | null = null;

export function startLogListener() {
  stopLogListener();

  // ⭐ 이 로그가 찍혀야 정상입니다!
  console.log("[logListener] startLogListener called (Server Polling Mode)");

  pollInterval = setInterval(async () => {
    try {
      // 실제 서버에서 미응답 알람을 가져옵니다.
      const response = await apiClient.get("/api/alerts/pending");
      const pendingAlerts = response.data.data || [];

      if (pendingAlerts.length > 0) {
        pendingAlerts.forEach((alert: any) => {
          const alertEvent: AlertEvent = {
            alertId: String(alert.id),
            deviceId: alert.deviceId,
            errorCode: alert.errorCode || "ERROR",
            errorMsg: alert.errorMsg || "장비 오류 발생",
            severity: alert.severity || "MEDIUM",
            timestamp: alert.createdAt || new Date().toISOString(),
          };
          handleAlertEvent(alertEvent, MOCK_WORKERS as any);
        });
      }
    } catch (error) {
      // 서버 연결 실패 시 조용히 넘어갑니다.
    }
  }, 3000);
}

export function stopLogListener() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  console.log("[logListener] stopLogListener called");
}

export default { startLogListener, stopLogListener };
