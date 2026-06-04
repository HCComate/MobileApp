// ─────────────────────────────────────────────
//  services/alertManager.ts
//  알람 에스컬레이션 생명주기 관리 + 이력 관리 + 서버 통신 통합
// ─────────────────────────────────────────────

import * as Notifications from "expo-notifications";
import { alertModalStore } from "../store/alertModalStore";
import {
  ActiveAlert,
  AlertEvent,
  AlertResponse,
  AlertUser,
  EscalationPolicy,
  EscalationStep,
} from "../types/alert";
import { buildEscalationPolicy, getNextStep } from "./alertPriority";
import apiClient from "./apiClient"; // apiClient 임포트

// ── 알림 액션 카테고리 등록 ───
export async function registerAlertActions() {
  await Notifications.setNotificationCategoryAsync("ALERT_ACTIONS", [
    {
      identifier: "ACCEPT",
      buttonTitle: "✅ 수락",
      options: { isDestructive: false, isAuthenticationRequired: false },
    },
    {
      identifier: "REJECT",
      buttonTitle: "❌ 거절",
      options: { isDestructive: true, isAuthenticationRequired: false },
    },
  ]);
  console.log("[AlertManager] 알림 액션 카테고리 등록 완료");
}

// ── 현재 로그인한 사용자 ID ────────────────────
let currentUserId: string | undefined = undefined;
export function setCurrentUserId(userId: string | undefined) {
  currentUserId = userId;
}

const activeAlerts = new Map<string, ActiveAlert>();
const alertHistory: ActiveAlert[] = [];
const escalationTimers = new Map<string, ReturnType<typeof setTimeout>>();
const policyCache = new Map<string, EscalationPolicy>();

// 장치별 활성 알람 추적 (중복 방지용)
// deviceId → alertId: 같은 장치에서 이미 알람이 활성화 중이면 추가 알람 차단
const activeDeviceAlerts = new Map<string, string>();

// 알람 상태 변경 구독
type AlertChangeListener = () => void;
const changeListeners = new Set<AlertChangeListener>();

export function subscribeAlertChanges(listener: AlertChangeListener): () => void {
  changeListeners.add(listener);
  return () => changeListeners.delete(listener);
}

function notifyAlertChanges() {
  changeListeners.forEach((fn) => fn());
}

// ════════════════════════════════════════════════
//  오류 이벤트 수신 → 알람 시작
// ════════════════════════════════════════════════
export async function handleAlertEvent(
  event: AlertEvent,
  allUsers: AlertUser[],
  isServerEscalation = false,
) {
  // 1. 동일 alertId 중복 차단
  if (activeAlerts.has(event.alertId)) return;

  // 2. 동일 장치 활성 알람 중복 차단 (경로 무관)
  if (activeDeviceAlerts.has(event.deviceId)) {
    console.log(`[AlertManager] 중복 알람 차단: ${event.deviceId} (이미 활성 알람 존재)`);
    return;
  }

  // 🔑 서버 에스컬레이션인 경우, 로컬 에스컬레이션 정책을 생성하지 않음
  //    (서버의 escalation_sessions를 신뢰)
  const policy = isServerEscalation 
    ? { severity: event.severity, steps: [] }  // 빈 정책 (팝업만 표시)
    : buildEscalationPolicy(event, allUsers);
  
  policyCache.set(event.alertId, policy);

  const firstStep = policy.steps[0];

  const newActiveAlert: ActiveAlert = {
    alertEvent: event,
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
  };

  // 1. 이력에 추가
  alertHistory.unshift(newActiveAlert);
  if (alertHistory.length > 1000) alertHistory.pop();

  // 2. 팝업 및 에스컬레이션 처리
  activeAlerts.set(event.alertId, newActiveAlert);
  activeDeviceAlerts.set(event.deviceId, event.alertId);
  
  // 🔑 팝업은 항상 표시 (서버/로컬 에스컬레이션 상관없음)
  await sendStepNotification(event, firstStep || {
    stepIndex: 0,
    targetUser: { userId: currentUserId || "", workStatus: "IDLE", role: "OPERATOR", assignedDevices: [], shiftStatus: "ON_DUTY" },
    timeoutSec: 20,
  });
  
  // 🔑 로컬 에스컬레이션만 타이머 시작
  if (!isServerEscalation && firstStep) {
    startEscalationTimer(event.alertId, firstStep.timeoutSec, allUsers);
  }
  
  console.log(
    `[AlertManager] 알람 활성화: ${event.deviceId} (${event.severity}, 서버 에스컬: ${isServerEscalation})`,
  );
}

// ════════════════════════════════════════════════
//  단계별 알람 전송
// ════════════════════════════════════════════════
async function sendStepNotification(event: AlertEvent, step: EscalationStep) {
  // 푸시 알림 및 팝업은 대상자에게만
  if (step.targetUser.userId !== currentUserId) return;

  // 팝업 표시
  alertModalStore.show({
    alertId: event.alertId,
    deviceId: event.deviceId,
    errorCode: event.errorCode,
    errorMsg: event.errorMsg,
    severity: event.severity,
    timestamp: event.timestamp,
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⚠️ 장비 오류 [${event.severity}]`,
      body: `${event.deviceId} - ${event.errorCode}: ${event.errorMsg}`,
      data: { ...event, screen: "DeviceDetail" },
      sound: "default",
      categoryIdentifier: "ALERT_ACTIONS", // 배너에 수락/거절 버튼 표시
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: "visionmate-alert",
    },
  });
}

// ════════════════════════════════════════════════
//  타이머 및 에스컬레이션 로직
// ════════════════════════════════════════════════
function startEscalationTimer(
  alertId: string,
  timeoutSec: number,
  allUsers: AlertUser[],
) {
  clearEscalationTimer(alertId);
  escalationTimers.set(
    alertId,
    setTimeout(
      () => escalateAlert(alertId, "TIMEOUT", allUsers),
      timeoutSec * 1000,
    ),
  );
}

function clearEscalationTimer(alertId: string) {
  const t = escalationTimers.get(alertId);
  if (t) {
    clearTimeout(t);
    escalationTimers.delete(alertId);
  }
}

async function escalateAlert(
  alertId: string,
  reason: "TIMEOUT" | "REJECTED",
  allUsers: AlertUser[],
) {
  const active = activeAlerts.get(alertId);
  const policy = policyCache.get(alertId);
  if (!active || !policy) return;

  const nextStep = getNextStep(policy, active.currentStepIndex);
  if (!nextStep) return;

  active.currentStepIndex = nextStep.stepIndex;
  active.escalatedAt = new Date().toISOString();
  activeAlerts.set(alertId, active);

  await sendStepNotification(active.alertEvent, nextStep);
  startEscalationTimer(alertId, nextStep.timeoutSec, allUsers);
}

export async function respondToAlert(
  alertId: string,
  response: AlertResponse,
  allUsers: AlertUser[],
  deviceId?: string,
) {
  const active = activeAlerts.get(alertId);

  // deviceId 우선순위: 명시 인자 > 활성 알람의 deviceId
  const resolvedDeviceId = deviceId ?? active?.alertEvent.deviceId ?? "";

  if (!active) {
    console.warn(`[AlertManager] respondToAlert: alertId(${alertId}) not in activeAlerts — 서버에만 전송`);
  } else {
    clearEscalationTimer(alertId);
    active.response = response;
    if (response === "ACCEPTED") {
      active.respondedBy = currentUserId;
      active.acceptedBy = currentUserId;
    }
    activeAlerts.set(alertId, active);
  }

  // 서버 응답 전송 — active 여부와 무관하게 항상 실행
  // deviceId를 명시 전송해 MobileServer의 alertId 파싱 오류(언더스코어 포함 ID) 방지
  try {
    await apiClient.post(`/api/alerts/${alertId}/respond`, {
      response,
      userId: currentUserId,
      deviceId: resolvedDeviceId,
    });
    console.log(`[AlertManager] 서버 응답 전송 성공: ${alertId} (device=${resolvedDeviceId}) → ${response}`);
  } catch (error) {
    console.error(`[AlertManager] 서버 응답 전송 실패: ${alertId}`, error);
  }

  if (response === "ACCEPTED") {
    notifyAlertChanges();
  } else {
    // 거절: 서버가 다음 담당자로 에스컬레이션함.
    // 로컬 알람 상태를 완전히 제거 → 재에스컬레이션으로 돌아오면 다시 표시 가능
    resolveAlert(alertId);
    notifyAlertChanges();
  }
}

// ════════════════════════════════════════════════
//  이력 조회 및 해결 로직
// ════════════════════════════════════════════════
export function getActiveAlerts(): ActiveAlert[] {
  return Array.from(activeAlerts.values());
}

export function getAllAlertHistory(): ActiveAlert[] {
  return alertHistory;
}

export function resolveAlert(alertId: string) {
  clearEscalationTimer(alertId);
  const alert = activeAlerts.get(alertId);
  if (alert) {
    activeDeviceAlerts.delete(alert.alertEvent.deviceId);
  }
  activeAlerts.delete(alertId);
}

export function getActiveAlertByDeviceId(
  deviceId: string,
): ActiveAlert | undefined {
  return Array.from(activeAlerts.values()).find(
    (a) => a.alertEvent.deviceId === deviceId,
  );
}

export function isCurrentUserAcceptor(alertId: string): boolean {
  const active = activeAlerts.get(alertId);
  return active?.acceptedBy === currentUserId;
}

export async function resolveAlertByDeviceId(deviceId: string) {
  const active = Array.from(activeAlerts.values()).find(
    (a) => a.alertEvent.deviceId === deviceId,
  );
  if (active) {
    try {
      await apiClient.post(`/api/devices/${deviceId}/resolve`);
      console.log(
        `[API Success] 장비 ${deviceId} 오류 수정 완료 신호 전송 완료`,
      );
      resolveAlert(active.alertEvent.alertId);
    } catch (error) {
      console.error(
        `[API Error] 장비 ${deviceId} 오류 수정 완료 신호 전송 실패:`,
        error,
      );
      // 서버 통신 실패 시에도 앱 내부 로직은 진행
      resolveAlert(active.alertEvent.alertId);
    }
  }
}
