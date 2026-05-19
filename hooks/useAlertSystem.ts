import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { MOCK_WORKERS } from "../mock/workers";
import { handleAlertEvent } from "../services/alertManager";
import { AlertEvent } from "../types/alert";
import { useLogData } from "./updateData";

// 1. 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 장비 로그를 감시하여 에러 발생 시 시스템 알림 및 팝업을 띄우는 훅
 */
export function useAlertSystem() {
  const logs = useLogData();
  const lastProcessedLogId = useRef<string | null>(null);
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

    if (initialLogCount.current === -1) {
      initialLogCount.current = logs.length;
      const latest = logs[0];
      lastProcessedLogId.current = latest
        ? `${latest.header?.device_id}_${latest.body?.sequence}`
        : null;
      console.log("알람 시스템 감시 시작 (기존 로그 무시됨)");
      return;
    }

    const latest = logs[0];
    const currentLogId = latest
      ? `${latest.header?.device_id}_${latest.body?.sequence}`
      : null;

    if (currentLogId && currentLogId !== lastProcessedLogId.current) {
      if (latest.body?.machine_status === "ERROR") {
        // [수정] alertModalStore.show를 직접 호출하는 대신 alertManager를 통해 통합 처리
        // 이렇게 해야 알람 이력(History)에 기록되고 에스컬레이션이 작동합니다.
        const alertEvent: AlertEvent = {
          alertId: `alert_${Date.now()}_${latest.header?.device_id}`,
          deviceId: latest.header?.device_id || "UNKNOWN",
          errorCode: latest.body?.status_info?.[0]?.code || "ERR_UNKNOWN",
          errorMsg:
            latest.body?.status_info?.[0]?.msg || "장비 에러가 발생했습니다.",
          severity: (latest.body?.status_info?.[0]?.severity || "HIGH") as any,
          timestamp: latest.body?.timestamp || new Date().toISOString(),
        };

        // alertManager를 통해 알람 발생 처리 (이력 기록 + 팝업 표시 + 에스컬레이션)
        handleAlertEvent(alertEvent, MOCK_WORKERS as any);
      }

      lastProcessedLogId.current = currentLogId;
    }
  }, [logs]);
}
