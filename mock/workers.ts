// ─────────────────────────────────────────────
//  mocks/workers.ts
//  통합 작업자 데이터
//  - 기존 Worker 인터페이스 호환 유지
//  - AlertUser 필드 추가 (role, workStatus, assignedDevices)
//  - userData.ts의 MOCK_USER_DATA와 id 통일
//
//  ⚠️ 테스트 전용
//  TODO: 통신 연동 시 GET /api/users 응답으로 교체
// ─────────────────────────────────────────────

import { MOCK_RAW_LOGS } from "./Logs";
import { UserRole, WORKER_LIST } from "./workerConfig";

export type ShiftStatus = "ON_DUTY" | "OFF_DUTY";
export type WorkStatus = "IDLE" | "MONITORING" | "WORKING";
export interface Worker {
  id: string;
  name: string;
  status: string;
  image: string;
  userId: string;
  role: UserRole;
  shiftStatus: ShiftStatus;
  workStatus: WorkStatus;
  assignedDevices: string[];
}

const getAssignedDevices = (workerId: string): string[] => [
  ...new Set(
    MOCK_RAW_LOGS.filter((l) => l.header.assigned_worker_id === workerId).map(
      (l) => l.header.device_id,
    ),
  ),
];

export const MOCK_WORKERS: Worker[] = [
  ...WORKER_LIST.map((w) => ({
    id: w.id,
    name: w.name,
    status: w.id === "2111111" || w.id === "2344751" ? "근무 중" : "퇴근", // 수정
    image: "https://via.placeholder.com/50",
    userId: w.id,
    role: w.role,
    shiftStatus: (w.id === "2111111" || w.id === "2344751"
      ? "ON_DUTY"
      : "OFF_DUTY") as ShiftStatus,
    workStatus: "MONITORING" as WorkStatus,
    assignedDevices: getAssignedDevices(w.id),
  })),
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

export const getWorkerById = (id: string): Worker | undefined =>
  MOCK_WORKERS.find((w) => w.id === id);
export const getOnDutyWorkers = (): Worker[] =>
  MOCK_WORKERS.filter((w) => w.shiftStatus === "ON_DUTY");
export const getWorkersByDevice = (deviceId: string): Worker[] =>
  MOCK_WORKERS.filter((w) => w.assignedDevices.includes(deviceId));
