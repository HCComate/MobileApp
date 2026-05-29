// mock/workers.ts
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

// Logs.ts를 참조하지 않고 담당 기기를 계산하기 위한 로직
const DEVICE_COUNT = 25;
const DEVICE_IDS = Array.from(
  { length: DEVICE_COUNT },
  (_, i) => `RASP_PI_${String(i + 1).padStart(2, "0")}`,
);

const getAssignedDevices = (workerId: string): string[] => {
  const workerIndex = WORKER_LIST.findIndex((w) => w.id === workerId);
  if (workerIndex === -1) return [];

  // Logs.ts의 할당 로직(index % length)을 역으로 계산하여 할당
  return DEVICE_IDS.filter((_, i) => i % WORKER_LIST.length === workerIndex);
};

export const MOCK_WORKERS: Worker[] = [
  ...WORKER_LIST.map((w) => ({
    id: w.id,
    name: w.name,
    status: w.id === "2111111" || w.id === "2344751" ? "근무 중" : "퇴근",
    image: "https://via.placeholder.com/50",
    userId: w.id,
    role: w.role,
    shiftStatus: (w.id === "2111111" || w.id === "2344751"
      ? "ON_DUTY"
      : "OFF_DUTY") as ShiftStatus,
    workStatus: "MONITORING" as WorkStatus,
    assignedDevices: getAssignedDevices(w.id), // 새 로직으로 담당 기기 할당
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
