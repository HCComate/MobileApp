// ─────────────────────────────────────────────
//  services/alertPriority.ts
//  알람 우선순위 계산 및 에스컬레이션 단계 생성
// ─────────────────────────────────────────────

import {
  AlertEvent,
  AlertSeverity,
  AlertUser,
  EscalationPolicy,
  EscalationStep,
  UserRole,
  WorkStatus,
} from "../types/alert";

// ── 직급 우선순위 (낮을수록 높은 직급) ──────────
const ROLE_PRIORITY: Record<UserRole, number> = {
  MASTER: 1,
  TECHNICIAN: 2,
  OPERATOR: 3,
};

// ── 작업 상태 우선순위 (낮을수록 먼저 알람) ──────
const WORK_STATUS_PRIORITY: Record<WorkStatus, number> = {
  IDLE: 1, // 대기 중 → 가장 먼저
  MONITORING: 2, // 모니터링 중
  WORKING: 3, // 작업 중 → 마지막
};

// ── 심각도별 타임아웃 (초) ────────────────────
const SEVERITY_TIMEOUT: Record<AlertSeverity, number> = {
  LOW: 120,
  MEDIUM: 60,
  HIGH: 30,
  CRITICAL: 20,
};

// ── 사용자 정렬 (작업 상태 기준) ─────────────────
function sortByWorkStatus(users: AlertUser[]): AlertUser[] {
  return [...users].sort(
    (a, b) =>
      WORK_STATUS_PRIORITY[a.workStatus] - WORK_STATUS_PRIORITY[b.workStatus],
  );
}

// ════════════════════════════════════════════════
//  에스컬레이션 정책 생성
// ════════════════════════════════════════════════
export function buildEscalationPolicy(
  event: AlertEvent,
  allUsers: AlertUser[],
): EscalationPolicy {
  const timeout = SEVERITY_TIMEOUT[event.severity];
  const steps: EscalationStep[] = [];
  const addedIds = new Set<string>();

  const addSteps = (users: AlertUser[]) => {
    sortByWorkStatus(users).forEach((user) => {
      if (addedIds.has(user.userId)) return;
      steps.push({
        stepIndex: steps.length,
        targetUser: user,
        timeoutSec: timeout,
      });
      addedIds.add(user.userId);
    });
  };

  const assignedOnDuty = allUsers.filter(
    (u) =>
      u.assignedDevices.includes(event.deviceId) && u.shiftStatus === "ON_DUTY",
  );
  addSteps(assignedOnDuty);

  const assignedRole: UserRole = assignedOnDuty[0]?.role ?? "OPERATOR";

  const sameRoleOnDuty = allUsers.filter(
    (u) =>
      !addedIds.has(u.userId) &&
      u.role === assignedRole &&
      u.shiftStatus === "ON_DUTY",
  );
  addSteps(sameRoleOnDuty);

  if (assignedRole !== "TECHNICIAN") {
    const techOnDuty = allUsers.filter(
      (u) =>
        !addedIds.has(u.userId) &&
        u.role === "TECHNICIAN" &&
        u.shiftStatus === "ON_DUTY",
    );
    addSteps(techOnDuty);
  }

  const masters = allUsers.filter(
    (u) => !addedIds.has(u.userId) && u.role === "MASTER",
  );
  addSteps(masters);

  const assignedOffDuty = allUsers.filter(
    (u) =>
      !addedIds.has(u.userId) &&
      u.assignedDevices.includes(event.deviceId) &&
      u.shiftStatus === "OFF_DUTY",
  );
  addSteps(assignedOffDuty);

  if (steps.length === 0) {
    addSteps(allUsers);
  }

  return { severity: event.severity, steps };
}

// ── 다음 에스컬레이션 단계 ────────────────────
export function getNextStep(
  policy: EscalationPolicy,
  currentStepIndex: number,
): EscalationStep | null {
  return policy.steps[currentStepIndex + 1] ?? null;
}
