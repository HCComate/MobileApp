import { AlertUser } from "../types/alert";
import { AlertEvent } from "../types/alert";
import { handleAlertEvent } from "./alertManager";
import apiClient from "./apiClient";
import { fetchAlertUsers } from "./apiService";

console.log("[logListener] module loaded");

let pollInterval: ReturnType<typeof setInterval> | null = null;
let userRefreshInterval: ReturnType<typeof setInterval> | null = null;
let cachedUsers: AlertUser[] = [];

async function refreshUsers() {
  const users = await fetchAlertUsers();
  if (users.length > 0) {
    cachedUsers = users;
    console.log(`[logListener] 사용자 목록 갱신 완료: ${users.length}명`);
  }
}

export function getCachedUsers() {
  return cachedUsers;
}

export async function startLogListener() {
  stopLogListener();

  const { CURRENT_SERVER_URL } = await import("../mock/userData");
  console.log("[logListener] 연결 대상 서버:", CURRENT_SERVER_URL);
  console.log("[logListener] startLogListener called (Server Polling Mode)");

  // 초기 사용자 목록 로드
  await refreshUsers();

  // 30초마다 사용자 목록 갱신 (shiftStatus/workStatus 변화 반영)
  userRefreshInterval = setInterval(refreshUsers, 30_000);

  pollInterval = setInterval(async () => {
    try {
      const response = await apiClient.get("/api/alerts/pending");
      const pendingAlerts = response.data.data || [];

      if (pendingAlerts.length > 0) {
        pendingAlerts.forEach((alert: any) => {
          const alertEvent: AlertEvent = {
            alertId: String(alert.alertId),
            deviceId: alert.deviceId,
            errorCode: alert.errorCode || "ERROR",
            errorMsg: alert.errorMsg || "장비 오류 발생",
            severity: alert.severity || "MEDIUM",
            timestamp: alert.timestamp || new Date().toISOString(),
          };
          handleAlertEvent(alertEvent, cachedUsers);
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
  if (userRefreshInterval) {
    clearInterval(userRefreshInterval);
    userRefreshInterval = null;
  }
  console.log("[logListener] stopLogListener called");
}

export default { startLogListener, stopLogListener };
