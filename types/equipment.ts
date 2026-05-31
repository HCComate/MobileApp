// types/equipment.ts

export type MachineStatus = "IDLE" | "RUN" | "ERROR" | "STOP" | "STANDBY" | "LOCKED";
export type VisionStatus = "OK" | "NG"; // 명칭 분리하여 충돌 방지
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Direction =
  | "TOP"
  | "SIDE_LEFT"
  | "SIDE_RIGHT"
  | "FRONT"
  | "BACK"
  | "NONE";

export interface StatusInfo {
  code: string;
  msg: string;
  severity: Severity;
  direction: Direction;
  partLocation: string;
  isCaptureRequired: boolean;
}

export interface VisionResult {
  result: VisionStatus;
  defectType: string;
  confidence: number;
  inspectionArea: string;
  imageUrl: string | null;
}

export interface DeviceSummary {
  deviceId: string;
  modelName: string;
  machineStatus: MachineStatus;
  timestamp: string;
  visionResult: VisionStatus;
  severity: Severity;
  lastSequence: number;
}

export interface DeviceDetail {
  deviceId: string;
  batchId: string;
  modelName: string;
  sequence: number;
  machineStatus: MachineStatus;
  temperature: number;
  vibrationX: number;
  vibrationY: number;
  illumination: number;
  humidity?: number;
  timestamp: string;
  statusInfos: StatusInfo[];
  visionResult: VisionResult;
}
