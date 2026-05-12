// ─────────────────────────────────────────────
//  mocks/alertMocks.ts
//  알람 시스템 테스트용 더미 데이터
//  - MOCK_USERS를 workers.ts에서 import (중복 제거)

//  ⚠️ 테스트 전용
//  TODO: 통신 연동 시 GET /api/users 응답으로 교체
// ─────────────────────────────────────────────

import { AlertEvent } from "../types/alert";

// AlertUser 형태로 re-export (alertManager에서 사용)
export { MOCK_WORKERS as MOCK_USERS } from "./workers";

// ── 테스트용 오류 이벤트 ──────────────────────
export const MOCK_ALERT_EVENTS: AlertEvent[] = [
  {
    alertId: "alert_001",
    deviceId: "RASP_PI_03",
    errorCode: "SV-PR-41",
    errorMsg: "Component Missing Error",
    severity: "CRITICAL",
    timestamp: "2026-05-01 17:40:05.005",
  },
  {
    alertId: "alert_002",
    deviceId: "RASP_PI_06",
    errorCode: "HM-TE-01",
    errorMsg: "Main Motor Overheat",
    severity: "HIGH",
    timestamp: "2026-05-01 17:38:15.882",
  },
];

// ── RASP_PI_03 오류 시 예상 에스컬레이션 순서 ──
//
// Step 0: 김철수 (OPERATOR / 담당자 / WORKING)
// Step 1: 홍길동 (TECHNICIAN / 근무중 / IDLE)
// Step 2: 한성   (TECHNICIAN / 근무중 / MONITORING)
// Step 3: 관리자 (MASTER)
// Step 4: 박한수 (OPERATOR / 담당자 / OFF_DUTY)
