import {
    DeviceDetail,
    DeviceSummary,
    StatusInfo,
    VisionResultData,
} from "../types/equipment";

const makeTimestamp = () => "2026-05-04 09:30:00.000";

export const generateMockSummaries = (): DeviceSummary[] => {
  const statuses = ["RUN", "RUN", "ERROR", "IDLE", "STOP"] as const;
  const severities = ["LOW", "LOW", "MEDIUM", "HIGH", "LOW"] as const;
  return Array.from({ length: 25 }, (_, i) => ({
    deviceId: `RASP_PI_${String(i + 1).padStart(2, "0")}`,
    modelName: `SMT_CHIP_${String.fromCharCode(65 + (i % 5))}${10 + i}`,
    machineStatus: statuses[i % 5] as any,
    visionResult: (i % 7 === 2 ? "NG" : "OK") as any,
    severity: severities[i % 5] as any,
    lastSequence: 40 + i,
    timestamp: makeTimestamp(),
  }));
};

export const generateMockDetails = (): DeviceDetail[] => {
  return generateMockSummaries().map((s, i) => ({
    deviceId: s.deviceId,
    modelName: s.modelName,
    batchId: `BATCH_${Math.floor(i / 5)}`,
    sequence: s.lastSequence ?? 0,
    machineStatus: s.machineStatus,
    temperature: 36.5 + (i % 5) * 0.1,
    vibrationX: 0.012 * (i % 3),
    vibrationY: 0.008 * (i % 4),
    illumination: 120 + i,
    humidity: 45 + (i % 10),
    timestamp: s.timestamp,
    statusInfos: [
      {
        code: "S001",
        msg: "온도 이상",
        severity: "LOW",
        direction: "FRONT",
        partLocation: "상단",
        isCaptureRequired: false,
      } as StatusInfo,
    ],
    visionResult: {
      result: s.visionResult as any,
      defectType: s.visionResult === "NG" ? "크랙" : "",
      confidence: s.visionResult === "NG" ? 0.82 : 0.98,
      inspectionArea: "홀더",
      imageUrl: null,
    } as VisionResultData,
  }));
};

export default { generateMockSummaries, generateMockDetails };
