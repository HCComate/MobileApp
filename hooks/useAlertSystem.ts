// ─────────────────────────────────────────────
//  hooks/useAlertSystem.ts
//
//  변경사항:
//  1. registerAlertActions 호출 추가 (수락/거절 버튼 등록)
//  2. 알림 액션 응답 처리 (ACCEPT → respondToAlert, REJECT → respondToAlert)
// ─────────────────────────────────────────────

import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  respondToAlert as _respondToAlert,
  getActiveAlerts,
  handleAlertEvent,
  registerAlertActions,
  setCurrentUserId,
} from "../services/alertManager";
import {
  ActiveAlert,
  AlertEvent,
  AlertResponse,
  AlertUser,
} from "../types/alert";

interface UseAlertSystemOptions {
  currentUserId: string;
  allUsers: AlertUser[];
}

export function useAlertSystem({
  currentUserId,
  allUsers,
}: UseAlertSystemOptions) {
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const appState = useRef(AppState.currentState);

  // 현재 사용자 ID 설정
  useEffect(() => {
    setCurrentUserId(currentUserId);
  }, [currentUserId]);

  // 알림 권한 요청 + 수락/거절 버튼 등록
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("[useAlertSystem] 알림 권한 없음");
        return;
      }
      // 수락/거절 액션 버튼 등록
      await registerAlertActions();
    })();
  }, []);

  // 알림 액션 응답 처리 (수락/거절 버튼 탭)
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const { actionIdentifier, notification } = response;
        const data = notification.request.content.data as {
          alertId?: string;
          deviceId?: string;
        };

        console.log("[useAlertSystem] 알림 액션:", actionIdentifier, data);

        if (!data.alertId) return;

        if (actionIdentifier === "ACCEPT") {
          await _respondToAlert(data.alertId, "ACCEPTED", allUsers);
          setActiveAlerts(getActiveAlerts());
          console.log("[useAlertSystem] 수락 처리 완료");
        } else if (actionIdentifier === "REJECT") {
          await _respondToAlert(data.alertId, "REJECTED", allUsers);
          setActiveAlerts(getActiveAlerts());
          console.log("[useAlertSystem] 거절 처리 완료");
        } else {
          // 버튼 없이 알림 탭 → 앱 열기만
          console.log("[useAlertSystem] 알림 탭 (액션 없음)");
          // TODO: router.push(`/equipment/${data.deviceId}`);
        }
      },
    );

    return () => sub.remove();
  }, [allUsers]);

  // 앱 포그라운드 복귀 시 알람 목록 갱신
  useEffect(() => {
    const sub = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          setActiveAlerts(getActiveAlerts());
        }
        appState.current = nextState;
      },
    );
    return () => sub.remove();
  }, []);

  // 오류 이벤트 수신 시 호출
  // TODO: 통신 연동 시 Socket.IO 콜백에서 이 함수 호출
  const triggerAlert = async (event: AlertEvent) => {
    await handleAlertEvent(event, allUsers);
    setActiveAlerts(getActiveAlerts());
  };

  const respondToAlert = async (alertId: string, response: AlertResponse) => {
    await _respondToAlert(alertId, response, allUsers);
    setActiveAlerts(getActiveAlerts());
  };

  return {
    activeAlerts,
    triggerAlert,
    respondToAlert,
  };
}
