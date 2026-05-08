// ─────────────────────────────────────────────
//  services/alertManager.ts
//  알람 에스컬레이션 생명주기 관리
//  - 한 명씩 순서대로 알람 전송
//  - 타임아웃/거절 시 다음 사람에게 에스컬레이션
// ─────────────────────────────────────────────

import * as Notifications from 'expo-notifications';
import {
  ActiveAlert,
  AlertEvent,
  AlertResponse,
  AlertUser,
  EscalationPolicy,
  EscalationStep,
} from '../types/alert';
import { buildEscalationPolicy, getNextStep } from './alertPriority';

// ── 현재 로그인한 사용자 ID ────────────────────
//  TODO: 실제 로그인 시스템 연동 후 교체
let currentUserId: string = '';
export function setCurrentUserId(userId: string) {
  currentUserId = userId;
}

// ── 진행 중인 알람 (alertId → ActiveAlert) ──────
const activeAlerts  = new Map<string, ActiveAlert>();

// ── 에스컬레이션 타이머 (alertId → timer) ────────
const escalationTimers = new Map<string, ReturnType<typeof setTimeout>>();

// ── 정책 캐시 (alertId → EscalationPolicy) ───────
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

  const activeAlert: ActiveAlert = {
    alertEvent:       event,
    currentStepIndex: 0,
    createdAt:        new Date().toISOString(),
  };
  activeAlerts.set(event.alertId, activeAlert);

  await sendStepNotification(event, firstStep);
  startEscalationTimer(event.alertId, firstStep.timeoutSec, allUsers);
}

// ════════════════════════════════════════════════
//  단계별 알람 전송 (한 명에게)
// ════════════════════════════════════════════════
async function sendStepNotification(
  event: AlertEvent,
  step: EscalationStep,
) {
  // 현재 로그인한 사용자가 이 단계 대상인지 확인
  if (step.targetUser.userId !== currentUserId) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⚠️ 장비 오류 [${event.severity}]`,
      body:  `${event.deviceId} - ${event.errorCode}: ${event.errorMsg}`,
      data: {
        alertId:  event.alertId,
        deviceId: event.deviceId,
        screen:   'DeviceDetail',
      },
      // TODO: 수락/거절 액션 버튼 추가
      // categoryIdentifier: 'ALERT_ACTIONS',
    },
    trigger: null,
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
  const timer = setTimeout(async () => {
    await escalateAlert(alertId, 'TIMEOUT', allUsers);
  }, timeoutSec * 1000);
  escalationTimers.set(alertId, timer);
}

function clearEscalationTimer(alertId: string) {
  const existing = escalationTimers.get(alertId);
  if (existing) {
    clearTimeout(existing);
    escalationTimers.delete(alertId);
  }
}

// ════════════════════════════════════════════════
//  에스컬레이션 (다음 사람에게)
// ════════════════════════════════════════════════
async function escalateAlert(
  alertId: string,
  reason: 'TIMEOUT' | 'REJECTED',
  allUsers: AlertUser[],
) {
  const active = activeAlerts.get(alertId);
  const policy = policyCache.get(alertId);
  if (!active || !policy) return;

  const nextStep = getNextStep(policy, active.currentStepIndex);

  if (!nextStep) {
    console.log(`[AlertManager] ${alertId} 에스컬레이션 완료 - 모든 단계 소진`);
    return;
  }

  active.currentStepIndex = nextStep.stepIndex;
  active.escalatedAt      = new Date().toISOString();
  activeAlerts.set(alertId, active);

  console.log(
    `[AlertManager] ${alertId} ${reason}로 인해`,
    `Step ${nextStep.stepIndex} → ${nextStep.targetUser.name} 에스컬레이션`,
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

  if (response === 'ACCEPTED') {
    clearEscalationTimer(alertId);
    active.response    = 'ACCEPTED';
    active.respondedBy = currentUserId;
    activeAlerts.set(alertId, active);
    console.log(`[AlertManager] ${alertId} 수락됨 by ${currentUserId}`);

    // TODO: 서버에 수락 응답 전송
    // await fetch(`/api/alerts/${alertId}/respond`, {
    //   method: 'POST',
    //   body: JSON.stringify({ response: 'ACCEPTED', userId: currentUserId }),
    // });

  } else if (response === 'REJECTED') {
    clearEscalationTimer(alertId);
    active.response = 'REJECTED';
    activeAlerts.set(alertId, active);
    console.log(`[AlertManager] ${alertId} 거절됨 → 즉시 에스컬레이션`);
    await escalateAlert(alertId, 'REJECTED', allUsers);
  }
}

// ── 조회 / 정리 ────────────────────────────────
export function getActiveAlerts(): ActiveAlert[] {
  return Array.from(activeAlerts.values());
}

export function resolveAlert(alertId: string) {
  clearEscalationTimer(alertId);
  activeAlerts.delete(alertId);
  policyCache.delete(alertId);
}
