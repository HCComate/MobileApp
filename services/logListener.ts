import { getAssignedDevices } from "../mock/workers";
import { AlertEvent, AlertUser } from "../types/alert";
import { handleAlertEvent } from "./alertManager";
import apiClient from "./apiClient";

console.log("[logListener] module loaded");

let pollInterval: ReturnType<typeof setInterval> | null = null;
let userPollInterval: ReturnType<typeof setInterval> | null = null;
let cachedUsers: AlertUser[] = [];

async function fetchRealUsers() {
  try {
    const res = await apiClient.get("/api/users");
    if (res.data && res.data.data) {
      cachedUsers = res.data.data.map((u: any) => ({
        userId: u.userId,
        name: u.name,
        role: u.role,
        shiftStatus: u.shiftStatus,
        workStatus: u.workStatus,
        assignedDevices: getAssignedDevices(u.userId)
      }));
    }
  } catch (e) {
    console.warn("[logListener] 유저 목록 갱신 실패", e);
  }
}

export function startLogListener() {
  stopLogListener();

  console.log("[logListener] startLogListener called (Server Polling Mode)");

  // 초기 유저 로딩
  fetchRealUsers();
  // 10초마다 유저 갱신
  userPollInterval = setInterval(fetchRealUsers, 10000);

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
          if (cachedUsers.length > 0) {
            handleAlertEvent(alertEvent, cachedUsers);
          }
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
  if (userPollInterval) {
    clearInterval(userPollInterval);
    userPollInterval = null;
  }
  console.log("[logListener] stopLogListener called");
}

export default { startLogListener, stopLogListener };
