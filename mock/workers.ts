// ─────────────────────────────────────────────
//  mocks/workers.ts
//  통합 작업자 데이터
//  - 기존 Worker 인터페이스 호환 유지
//  - AlertUser 필드 추가 (role, workStatus, assignedDevices)
//  - userData.ts의 MOCK_USER_DATA와 id 통일
//
//  ⚠️ 테스트 전용
//  TODO: 통신 연동 시 GET /api/users 응답으로 교체
// ─────────────────────────────────────────────

import { MOCK_RAW_LOGS } from "./rawLogs";

// ── 직급 ──────────────────────────────────────
export type UserRole = "MASTER" | "TECHNICIAN" | "OPERATOR";
export type ShiftStatus = "ON_DUTY" | "OFF_DUTY";
export type WorkStatus = "IDLE" | "MONITORING" | "WORKING";

// ── 통합 Worker 타입 ──────────────────────────
export interface Worker {
  // 기존 필드 (schedule.ts, 화면 호환)
  id: string;
  name: string;
  status: string; // "근무 중" | "퇴근" (UI 표시용)
  image: string;

  // AlertUser 호환 필드 (알람 에스컬레이션용)
  userId: string; // id와 동일
  role: UserRole;
  shiftStatus: ShiftStatus;
  workStatus: WorkStatus;
  assignedDevices: string[];
}

// ─────────────────────────────────────────────
//  logs에서 담당 장비 자동 추출
// ─────────────────────────────────────────────
const getAssignedDevices = (workerId: string): string[] => [
  ...new Set(
    MOCK_RAW_LOGS.filter((l) => l.header.assigned_worker_id === workerId).map(
      (l) => l.header.device_id,
    ),
  ),
];

// ─────────────────────────────────────────────
//  통합 작업자 목록
// ─────────────────────────────────────────────
export const MOCK_WORKERS: Worker[] = [
  {
    id: "2111111",
    name: "한성",
    status: "근무 중",
    image: "https://via.placeholder.com/50",
    userId: "2111111",
    role: "TECHNICIAN",
    shiftStatus: "ON_DUTY",
    workStatus: "MONITORING",
    assignedDevices: getAssignedDevices("2111111"),
  },
  {
    id: "2344751",
    name: "홍길동",
    status: "근무 중",
    image: "https://via.placeholder.com/50",
    userId: "2344751",
    role: "TECHNICIAN",
    shiftStatus: "ON_DUTY",
    workStatus: "IDLE",
    assignedDevices: getAssignedDevices("2344751"),
  },
  {
    id: "2744135",
    name: "김철수",
    status: "근무 중",
    image: "https://via.placeholder.com/50",
    userId: "2744135",
    role: "OPERATOR",
    shiftStatus: "ON_DUTY",
    workStatus: "WORKING",
    assignedDevices: getAssignedDevices("2744135"),
  },
  {
    id: "2844232",
    name: "박한수",
    status: "퇴근",
    image: "https://via.placeholder.com/50",
    userId: "2844232",
    role: "OPERATOR",
    shiftStatus: "OFF_DUTY",
    workStatus: "IDLE",
    assignedDevices: getAssignedDevices("2844232"),
  },
  {
    id: "2744773",
    name: "최서울",
    status: "퇴근",
    image: "https://via.placeholder.com/50",
    userId: "2744773",
    role: "OPERATOR",
    shiftStatus: "OFF_DUTY",
    workStatus: "IDLE",
    assignedDevices: getAssignedDevices("2744773"),
  },
  {
    id: "9999999",
    name: "관리자",
    status: "근무 중",
    image: "https://via.placeholder.com/50",
    userId: "9999999",
    role: "MASTER",
    shiftStatus: "ON_DUTY",
    workStatus: "MONITORING",
    assignedDevices: [],
  },
];

// ─────────────────────────────────────────────
//  헬퍼 함수
// ─────────────────────────────────────────────

// ID로 작업자 찾기
export const getWorkerById = (id: string): Worker | undefined =>
  MOCK_WORKERS.find((w) => w.id === id);

// 근무 중인 작업자만
export const getOnDutyWorkers = (): Worker[] =>
  MOCK_WORKERS.filter((w) => w.shiftStatus === "ON_DUTY");

// 특정 장비 담당자
export const getWorkersByDevice = (deviceId: string): Worker[] =>
  MOCK_WORKERS.filter((w) => w.assignedDevices.includes(deviceId));
