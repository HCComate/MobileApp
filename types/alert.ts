// ─────────────────────────────────────────────
//  types/alert.ts
//  알람 에스컬레이션 시스템 타입 정의
// ─────────────────────────────────────────────

// ── 직급 ──────────────────────────────────────
export type UserRole =
  | 'MASTER'      // 최고 관리자
  | 'TECHNICIAN'  // 기술자
  | 'OPERATOR';   // 운영자

// ── 근무 상태 ──────────────────────────────────
export type ShiftStatus = 'ON_DUTY' | 'OFF_DUTY';

// ── 현재 작업 상태 ─────────────────────────────
//  알람 수신 우선순위에 영향을 줌
export type WorkStatus =
  | 'IDLE'        // 대기 중 → 알람 수신 최우선
  | 'MONITORING'  // 모니터링 중 → 2순위
  | 'WORKING';    // 작업 중 (기기 수리 등) → 3순위

// ── 사용자 정보 ────────────────────────────────
export interface AlertUser {
  userId:          string;
  name:            string;
  role:            UserRole;
  shiftStatus:     ShiftStatus;
  workStatus:      WorkStatus;   // ← 추가
  assignedDevices: string[];     // 담당 기기 ID 목록
  fcmToken?:       string;       // 푸시 알람 토큰 (추후 연동)
}

// ── 알람 심각도 ────────────────────────────────
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ── 알람 이벤트 (서버에서 오는 오류 데이터) ─────
export interface AlertEvent {
  alertId:   string;
  deviceId:  string;
  errorCode: string;
  errorMsg:  string;
  severity:  AlertSeverity;
  timestamp: string;
}

// ── 에스컬레이션 단계 (한 명씩 순서대로) ────────
export interface EscalationStep {
  stepIndex:   number;
  targetUser:  AlertUser;  // 단일 사용자 (한 명씩 전송)
  timeoutSec:  number;
}

// ── 에스컬레이션 정책 ──────────────────────────
export interface EscalationPolicy {
  severity: AlertSeverity;
  steps:    EscalationStep[];
}

// ── 알람 응답 ──────────────────────────────────
export type AlertResponse = 'ACCEPTED' | 'REJECTED' | 'TIMEOUT';

// ── 진행 중인 알람 상태 ────────────────────────
export interface ActiveAlert {
  alertEvent:       AlertEvent;
  currentStepIndex: number;
  respondedBy?:     string;
  response?:        AlertResponse;
  createdAt:        string;
  escalatedAt?:     string;
}
