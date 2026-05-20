// services/dtoMapper.ts

import { DeviceDetail, DeviceSummary, VisionStatus } from "@/types/equipment";

export const mapToDeviceSummary = (data: any): DeviceSummary => ({
  deviceId: data.deviceId || "",
  machineStatus: data.machineStatus || "IDLE",
  modelName: data.modelName || "Unknown",
  timestamp: data.timestamp || new Date().toISOString(),
  visionResult: (data.visionResult as VisionStatus) || "OK",
  severity: data.severity || "LOW",
  lastSequence: data.lastSequence || 0,
});

export const mapToDeviceDetail = (data: any): DeviceDetail => ({
  deviceId: data.deviceId || "",
  batchId: data.batchId || "",
  modelName: data.modelName || "",
  sequence: data.sequence || 0,
  machineStatus: data.machineStatus || "IDLE",
  timestamp: data.timestamp || new Date().toISOString(),
  temperature: data.temperature || 0,
  vibrationX: data.vibrationX || 0,
  vibrationY: data.vibrationY || 0,
  illumination: data.illumination || 0,
  humidity: data.humidity || 0,
  statusInfos: (data.statusInfos || []).map((s: any) => ({
    code: s.code || "",
    msg: s.msg || "",
    severity: s.severity || "LOW",
    direction: (s.direction as any) || "NONE",
    partLocation: s.partLocation || "",
    isCaptureRequired: !!s.isCaptureRequired,
  })),
  visionResult: {
    result: (data.visionResult?.result as VisionStatus) || "OK",
    defectType: data.visionResult?.defectType || "NONE",
    confidence: data.visionResult?.confidence || 0,
    inspectionArea: data.visionResult?.inspectionArea || "ALL",
    imageUrl: data.visionResult?.imageUrl || null,
  },
});
