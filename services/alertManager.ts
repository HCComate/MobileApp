// ─────────────────────────────────────────────
//  services/alertManager.ts
//  알람 에스컬레이션 생명주기 관리 + 이력 관리 추가
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
let currentUserId: string | undefined = "9999999"; // 기본값 관리자로 설정
export function setCurrentUserId(userId: string | undefined) {
  currentUserId = userId;
}

const activeAlerts = new Map<string, ActiveAlert>();
const alertHistory: ActiveAlert[] = []; // 알람 이력 저장용 배열
const escalationTimers = new Map<string, ReturnType<typeof setTimeout>>();
const policyCache = new Map<string, EscalationPolicy>();

// ════════════════════════════════════════════════
//  오류 이벤트 수신 → 알람 시작
// ════════════════════════════════════════════════
export async function handleAlertEvent(
  event: AlertEvent,
  allUsers: AlertUser[],
) {
  if (activeAlerts.has(event.alertId)) return;

  const policy = buildEscalationPolicy(event, allUsers);
  policyCache.set(event.alertId, policy);

  const firstStep = policy.steps[0];
  if (!firstStep) return;

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
  await sendStepNotification(event, firstStep);
  startEscalationTimer(event.alertId, firstStep.timeoutSec, allUsers);
  console.log(
    `[AlertManager] 알람 활성화: ${event.deviceId} (${event.severity})`,
  );
}

// ════════════════════════════════════════════════
//  단계별 알람 전송
// ════════════════════════════════════════════════
async function sendStepNotification(event: AlertEvent, step: EscalationStep) {
  // 팝업 표시
  alertModalStore.show({
    alertId: event.alertId,
    deviceId: event.deviceId,
    errorCode: event.errorCode,
    errorMsg: event.errorMsg,
    severity: event.severity,
    timestamp: event.timestamp,
  });

  // 푸시 알림은 대상자에게만
  if (step.targetUser.userId !== currentUserId) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⚠️ 장비 오류 [${event.severity}]`,
      body: `${event.deviceId} - ${event.errorCode}: ${event.errorMsg}`,
      data: { ...event, screen: "DeviceDetail" },
      sound: "default",
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
) {
  const active = activeAlerts.get(alertId);
  if (!active) return;

  clearEscalationTimer(alertId);
  active.response = response;
  if (response === "ACCEPTED") {
    active.respondedBy = currentUserId;
    activeAlerts.set(alertId, active);
  } else {
    activeAlerts.set(alertId, active);
    await escalateAlert(alertId, "REJECTED", allUsers);
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
  activeAlerts.delete(alertId);
}

export function resolveAlertByDeviceId(deviceId: string) {
  const active = Array.from(activeAlerts.values()).find(
    (a) => a.alertEvent.deviceId === deviceId,
  );
  if (active) resolveAlert(active.alertEvent.alertId);
}
