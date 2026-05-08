// ─────────────────────────────────────────────
//  mocks/alertMocks.ts
//  알람 시스템 테스트용 더미 데이터
//
//  ⚠️ 테스트 전용
//  TODO: 통신 연동 시 GET /api/users 응답으로 교체
// ─────────────────────────────────────────────

import { AlertEvent, AlertUser } from '../types/alert';

// ── 테스트용 사용자 목록 ──────────────────────
export const MOCK_USERS: AlertUser[] = [
  {
    userId:          'user_01',
    name:            '김마스터',
    role:            'MASTER',
    shiftStatus:     'ON_DUTY',
    workStatus:      'MONITORING',
    assignedDevices: [],
  },
  {
    userId:          'user_02',
    name:            '이기술',
    role:            'TECHNICIAN',
    shiftStatus:     'ON_DUTY',
    workStatus:      'IDLE',          // 대기 중 → 알람 우선
    assignedDevices: ['RASP_PI_01', 'RASP_PI_02', 'RASP_PI_03'],
  },
  {
    userId:          'user_03',
    name:            '박기술',
    role:            'TECHNICIAN',
    shiftStatus:     'ON_DUTY',
    workStatus:      'WORKING',       // 작업 중 → 나중에
    assignedDevices: ['RASP_PI_04', 'RASP_PI_05'],
  },
  {
    userId:          'user_04',
    name:            '최운영',
    role:            'OPERATOR',
    shiftStatus:     'ON_DUTY',
    workStatus:      'IDLE',          // 대기 중
    assignedDevices: ['RASP_PI_01', 'RASP_PI_03'],
  },
  {
    userId:          'user_05',
    name:            '정운영',
    role:            'OPERATOR',
    shiftStatus:     'ON_DUTY',
    workStatus:      'MONITORING',    // 모니터링 중
    assignedDevices: ['RASP_PI_02', 'RASP_PI_03'],
  },
  {
    userId:          'user_06',
    name:            '한운영',
    role:            'OPERATOR',
    shiftStatus:     'OFF_DUTY',      // 근무 외
    workStatus:      'IDLE',
    assignedDevices: ['RASP_PI_03'],
  },
];

// ── 테스트용 오류 이벤트 ──────────────────────
export const MOCK_ALERT_EVENTS: AlertEvent[] = [
  {
    alertId:   'alert_001',
    deviceId:  'RASP_PI_03',
    errorCode: 'SV-PR-05',
    errorMsg:  '표면 스크래치 감지',
    severity:  'MEDIUM',
    timestamp: '2026-05-05 10:00:00.000',
  },
  {
    alertId:   'alert_002',
    deviceId:  'RASP_PI_01',
    errorCode: 'SV-PR-01',
    errorMsg:  '부품 누락 감지',
    severity:  'CRITICAL',
    timestamp: '2026-05-05 10:05:00.000',
  },
];

// ── RASP_PI_03 오류 시 예상 에스컬레이션 순서 ──
//
// Step 0: 최운영 (OPERATOR / 담당자 / IDLE)       ← 60초 대기
// Step 1: 정운영 (OPERATOR / 담당자 / MONITORING)  ← 60초 대기
// Step 2: 이기술 (TECHNICIAN / 근무중 / IDLE)      ← 60초 대기
// Step 3: 박기술 (TECHNICIAN / 근무중 / WORKING)   ← 60초 대기
// Step 4: 김마스터 (MASTER)                        ← 60초 대기
// Step 5: 한운영 (OPERATOR / 담당자 / OFF_DUTY)    ← 60초 대기
