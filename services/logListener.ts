import { AlertUser } from "../types/alert";
import { AlertEvent } from "../types/alert";
import { handleAlertEvent, reconcileActiveAlerts } from "./alertManager";
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

  await refreshUsers();
  userRefreshInterval = setInterval(refreshUsers, 30_000);

  // 중복 발화 방지는 alertManager의 activeDeviceAlerts(장치 단위)가 담당.
  // seenAlertIds를 쓰지 않으므로, 거절 후 재에스컬레이션으로 돌아와도 다시 알림 가능.
  pollInterval = setInterval(async () => {
    try {
      const response = await apiClient.get("/api/alerts/pending");
      const pendingAlerts: any[] = response.data.data || [];

      pendingAlerts.forEach((alert: any) => {
        const alertId = String(alert.alertId ?? alert.id ?? `srv_${alert.deviceId}`);

        const alertEvent: AlertEvent = {
          alertId,
          deviceId: alert.deviceId,
          errorCode: alert.errorCode || "ERROR",
          errorMsg: alert.errorMsg || "장비 오류 발생",
          severity: alert.severity || "CRITICAL",
          timestamp: alert.timestamp || alert.createdAt || new Date().toISOString(),
        };
        // activeDeviceAlerts가 같은 장치 활성 알람 중복을 막음
        // (현재 current_target인 동안 반복 폴링돼도 1회만 팝업)
        handleAlertEvent(alertEvent, cachedUsers, true);
      });

      // 서버 pending과 동기화: 더 이상 내 차례가 아닌(에스컬레이션 이동/외부 해제)
      // 활성 알람을 정리해 같은 장치의 재알림이 중복차단되는 것을 방지.
      const pendingDeviceIds = new Set<string>(
        pendingAlerts.map((a: any) => String(a.deviceId)),
      );
      reconcileActiveAlerts(pendingDeviceIds);
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
