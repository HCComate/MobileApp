// ─────────────────────────────────────────────
//  services/alertPriority.ts
//  알람 우선순위 계산 및 에스컬레이션 단계 생성
//
//  에스컬레이션 순서 (한 명씩 순서대로 전송):
//  1. 해당 기기 담당자 + 근무 중 + IDLE
//  2. 해당 기기 담당자 + 근무 중 + MONITORING
//  3. 해당 기기 담당자 + 근무 중 + WORKING
//  4. 같은 직급(OPERATOR) + 근무 중 + IDLE
//  5. 같은 직급(OPERATOR) + 근무 중 + MONITORING
//  6. 같은 직급(OPERATOR) + 근무 중 + WORKING
//  7. TECHNICIAN + 근무 중 + IDLE
//  8. TECHNICIAN + 근무 중 + MONITORING
//  9. TECHNICIAN + 근무 중 + WORKING
//  10. MASTER
//  11. 근무 외 담당자 (OFF_DUTY)
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
//  TODO: 실제 운영 환경에 맞게 조정
const SEVERITY_TIMEOUT: Record<AlertSeverity, number> = {
  LOW: 120,
  MEDIUM: 60,
  HIGH: 30,
  CRITICAL: 15,
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

  // ── 헬퍼: 유저 목록을 한 명씩 step으로 추가 ──
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

  // 1~3. 해당 기기 담당자 + 근무 중 (IDLE → MONITORING → WORKING 순)
  const assignedOnDuty = allUsers.filter(
    (u) =>
      u.assignedDevices.includes(event.deviceId) && u.shiftStatus === "ON_DUTY",
  );
  addSteps(assignedOnDuty);

  // 담당자 직급 파악 (없으면 OPERATOR 기준)
  const assignedRole: UserRole = assignedOnDuty[0]?.role ?? "OPERATOR";

  // 4~6. 같은 직급 + 근무 중 (담당자 제외)
  const sameRoleOnDuty = allUsers.filter(
    (u) =>
      !addedIds.has(u.userId) &&
      u.role === assignedRole &&
      u.shiftStatus === "ON_DUTY",
  );
  addSteps(sameRoleOnDuty);

  // 7~9. TECHNICIAN + 근무 중 (이미 추가된 사람 제외)
  if (assignedRole !== "TECHNICIAN") {
    const techOnDuty = allUsers.filter(
      (u) =>
        !addedIds.has(u.userId) &&
        u.role === "TECHNICIAN" &&
        u.shiftStatus === "ON_DUTY",
    );
    addSteps(techOnDuty);
  }

  // 10. MASTER (근무 상태 무관)
  const masters = allUsers.filter(
    (u) => !addedIds.has(u.userId) && u.role === "MASTER",
  );
  addSteps(masters);

  // 11. 근무 외 담당자 (OFF_DUTY)
  const assignedOffDuty = allUsers.filter(
    (u) =>
      !addedIds.has(u.userId) &&
      u.assignedDevices.includes(event.deviceId) &&
      u.shiftStatus === "OFF_DUTY",
  );
  addSteps(assignedOffDuty);

  // 단계가 없으면 전체 사용자 대상
  if (steps.length === 0) {
    addSteps(allUsers);
  }

  console.log(
    "[Priority] assignedOnDuty:",
    assignedOnDuty.map((u) => u.name),
  );
  console.log(
    "[Priority] steps:",
    steps.map((s) => `${s.stepIndex}:${s.targetUser.name}`),
  );

  return { severity: event.severity, steps };
}

// ── 다음 에스컬레이션 단계 ────────────────────
export function getNextStep(
  policy: EscalationPolicy,
  currentStepIndex: number,
): EscalationStep | null {
  return policy.steps[currentStepIndex + 1] ?? null;
}
