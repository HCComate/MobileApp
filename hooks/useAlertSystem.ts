import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { MOCK_WORKERS } from "../mock/workers";
import { handleAlertEvent } from "../services/alertManager";
import { AlertEvent } from "../types/alert";
import { useLogData } from "./updateData";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useAlertSystem() {
  const logs = useLogData();
  const lastProcessedId = useRef<string | null>(null);
  const initialLogCount = useRef<number>(-1);

  useEffect(() => {
    async function setupNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("visionmate-alert", {
          name: "장비 알람",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
        });
      }
    }
    setupNotifications();
  }, []);

  useEffect(() => {
    if (!logs || logs.length === 0) return;

    // 초기 실행 시점 설정
    if (initialLogCount.current === -1) {
      initialLogCount.current = logs.length;
      const latest = logs[0];
      if (latest) {
        lastProcessedId.current = `${latest.header?.device_id}_${latest.body?.sequence}`;
      }
      console.log("[AlertSystem] 감시 시작: ", lastProcessedId.current);
      return;
    }

    // 새로운 로그 필터링 (마지막 처리된 로그 ID와 비교)
    const latest = logs[0];
    const currentId = `${latest.header?.device_id}_${latest.body?.sequence}`;

    if (currentId !== lastProcessedId.current) {
      // 새로운 로그가 들어왔을 때, 최근 5개 로그 중 처리 안 된 에러가 있는지 전수 조사
      // (0.5초 사이에 여러 개가 들어올 수 있으므로)
      const newLogs = [];
      for (const log of logs) {
        const id = `${log.header?.device_id}_${log.body?.sequence}`;
        if (id === lastProcessedId.current) break;
        newLogs.push(log);
        if (newLogs.length > 10) break; // 너무 많은 과거 데이터 방지
      }

      if (newLogs.length > 0) {
        [...newLogs].reverse().forEach((log) => {
          if (log.body?.machine_status === "ERROR") {
            const severity = (log.body?.status_info?.[0]?.severity ||
              "HIGH") as any;

            const alertEvent: AlertEvent = {
              alertId: `alert_${Date.now()}_${log.header?.device_id}_${log.body?.sequence}`,
              deviceId: log.header?.device_id || "UNKNOWN",
              errorCode: log.body?.status_info?.[0]?.code || "ERR_UNKNOWN",
              errorMsg:
                log.body?.status_info?.[0]?.msg || "장비 에러가 발생했습니다.",
              severity: severity,
              timestamp: log.body?.timestamp || new Date().toISOString(),
            };

            console.log(
              "[AlertSystem] 에러 알람 트리거: ",
              log.header?.device_id,
            );
            handleAlertEvent(alertEvent, MOCK_WORKERS as any);
          }
        });

        lastProcessedId.current = currentId;
      }
    }
  }, [logs]);
}
