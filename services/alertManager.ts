// ─────────────────────────────────────────────
//  services/alertManager.ts
//  알람 에스컬레이션 생명주기 관리
//
//  SDK 54 변경사항:
//  - content 안에 android: {} 중첩 객체 제거
//  - Android 설정은 채널에서 처리
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

// ── 알림 액션 카테고리 등록 (수락/거절 버튼) ───
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
let currentUserId: string = "";
export function setCurrentUserId(userId: string) {
  currentUserId = userId;
}

const activeAlerts = new Map<string, ActiveAlert>();
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

  activeAlerts.set(event.alertId, {
    alertEvent: event,
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
  });

  await sendStepNotification(event, firstStep);
  startEscalationTimer(event.alertId, firstStep.timeoutSec, allUsers);
}

// ════════════════════════════════════════════════
//  단계별 알람 전송 (수락/거절 버튼 포함)
// ════════════════════════════════════════════════
async function sendStepNotification(event: AlertEvent, step: EscalationStep) {
  // 푸시 알림은 대상자에게만
  if (step.targetUser.userId !== currentUserId) return;
  // 팝업은 항상 표시 (현재 앱 사용자에게)
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
      data: {
        alertId: event.alertId,
        deviceId: event.deviceId,
        errorCode: event.errorCode,
        errorMsg: event.errorMsg,
        severity: event.severity,
        timestamp: event.timestamp,
        screen: "DeviceDetail",
      },
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: "visionmate-alert",
    },
  });

  console.log(
    `[AlertManager] Step ${step.stepIndex}`,
    `→ ${step.targetUser.name} (${step.targetUser.role} / ${step.targetUser.workStatus})`,
    `타임아웃: ${step.timeoutSec}초`,
  );
}

// ════════════════════════════════════════════════
//  에스컬레이션 타이머
// ════════════════════════════════════════════════
function startEscalationTimer(
  alertId: string,
  timeoutSec: number,
  allUsers: AlertUser[],
) {
  clearEscalationTimer(alertId);
  escalationTimers.set(
    alertId,
    setTimeout(async () => {
      await escalateAlert(alertId, "TIMEOUT", allUsers);
    }, timeoutSec * 1000),
  );
}

function clearEscalationTimer(alertId: string) {
  const t = escalationTimers.get(alertId);
  if (t) {
    clearTimeout(t);
    escalationTimers.delete(alertId);
  }
}

// ════════════════════════════════════════════════
//  에스컬레이션
// ════════════════════════════════════════════════
async function escalateAlert(
  alertId: string,
  reason: "TIMEOUT" | "REJECTED",
  allUsers: AlertUser[],
) {
  const active = activeAlerts.get(alertId);
  const policy = policyCache.get(alertId);
  if (!active || !policy) return;

  const nextStep = getNextStep(policy, active.currentStepIndex);
  if (!nextStep) {
    console.log(`[AlertManager] ${alertId} 에스컬레이션 완료`);
    return;
  }

  active.currentStepIndex = nextStep.stepIndex;
  active.escalatedAt = new Date().toISOString();
  activeAlerts.set(alertId, active);

  console.log(
    `[AlertManager] ${alertId} ${reason} → Step ${nextStep.stepIndex} ${nextStep.targetUser.name}`,
  );
  await sendStepNotification(active.alertEvent, nextStep);
  startEscalationTimer(alertId, nextStep.timeoutSec, allUsers);
}

// ════════════════════════════════════════════════
//  사용자 응답 처리
// ════════════════════════════════════════════════
export async function respondToAlert(
  alertId: string,
  response: AlertResponse,
  allUsers: AlertUser[],
) {
  const active = activeAlerts.get(alertId);
  if (!active) return;

  if (response === "ACCEPTED") {
    clearEscalationTimer(alertId);
    active.response = "ACCEPTED";
    active.respondedBy = currentUserId;
    activeAlerts.set(alertId, active);
    console.log(`[AlertManager] ${alertId} 수락됨 by ${currentUserId}`);
    // TODO: 서버에 수락 응답 전송
  } else if (response === "REJECTED") {
    clearEscalationTimer(alertId);
    active.response = "REJECTED";
    activeAlerts.set(alertId, active);
    await escalateAlert(alertId, "REJECTED", allUsers);
  }
}

export function getActiveAlerts(): ActiveAlert[] {
  return Array.from(activeAlerts.values());
}

export function resolveAlert(alertId: string) {
  clearEscalationTimer(alertId);
  activeAlerts.delete(alertId);
  policyCache.delete(alertId);
}
