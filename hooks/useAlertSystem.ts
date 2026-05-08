import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  respondToAlert as _respondToAlert,
  getActiveAlerts,
  handleAlertEvent,
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

  // 알람 권한 요청
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("[useAlertSystem] 알람 권한 없음");
      }

      // TODO: 수락/거절 버튼 추가 시 아래 주석 해제
      // await Notifications.setNotificationCategoryAsync('ALERT_ACTIONS', [
      //   { identifier: 'ACCEPT', buttonTitle: '수락', options: { isDestructive: false } },
      //   { identifier: 'REJECT', buttonTitle: '거절', options: { isDestructive: true } },
      // ]);
    })();
  }, []);

  // 앱 상태 변화 감지 (포그라운드 복귀 시 알람 목록 갱신)
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

  // ── 오류 이벤트 수신 시 호출 ──────────────────
  //  TODO: 통신 연동 시 Socket.IO 콜백에서 이 함수 호출
  //  socket.on('errorEvent', (raw) => {
  //    const event: AlertEvent = {
  //      alertId:   raw.alertId,
  //      deviceId:  raw.header.device_id,
  //      errorCode: raw.body.status_info[0]?.code,
  //      errorMsg:  raw.body.status_info[0]?.msg,
  //      severity:  raw.body.status_info[0]?.severity,
  //      timestamp: raw.body.timestamp,
  //    };
  //    triggerAlert(event);
  //  });
  const triggerAlert = async (event: AlertEvent) => {
    await handleAlertEvent(event, allUsers);
    setActiveAlerts(getActiveAlerts());
  };

  // ── 수락 / 거절 처리 ──────────────────────────
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
