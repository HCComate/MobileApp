// services/dtoMapper.ts

import { DeviceDetail, DeviceSummary, VisionStatus } from "@/types/equipment";

export const mapToDeviceSummary = (data: any): DeviceSummary => ({
  deviceId: data.deviceId || data.device_id || "",
  machineStatus: data.machineStatus || data.status || "IDLE",
  modelName: data.modelName || data.model_name || "Unknown",
  timestamp: data.timestamp || new Date().toISOString(),
  visionResult: (data.visionResult as VisionStatus) || "OK",
  severity: data.severity || "LOW",
  lastSequence: data.lastSequence || data.sequence || 0,
});

export const mapToDeviceDetail = (data: any): DeviceDetail => ({
  deviceId: data.deviceId || data.device_id || "",
  batchId: data.batchId || data.batch_id || "",
  modelName: data.modelName || data.model_name || "",
  sequence: data.sequence || 0,
  machineStatus: data.machineStatus || data.machine_status || "IDLE",
  timestamp: data.timestamp || new Date().toISOString(),
  temperature: data.temperature || 0,
  vibrationX: data.vibrationX || data.vibration_x || 0,
  vibrationY: data.vibrationY || data.vibration_y || 0,
  illumination: data.illumination || 0,
  humidity: data.humidity || 0,
  statusInfos: (data.statusInfos || data.status_info || []).map((s: any) => ({
    code: s.code || "",
    msg: s.msg || "",
    severity: s.severity || "LOW",
    direction: (s.direction as any) || "NONE",
    partLocation: s.partLocation || s.part_location || "",
    isCaptureRequired: !!s.isCaptureRequired || !!s.is_capture_required,
  })),
  visionResult: {
    result: (data.visionResult?.result as VisionStatus) || "OK",
    defectType: data.visionResult?.defectType || data.visionResult?.defect_type || "NONE",
    confidence: data.visionResult?.confidence || 0,
    inspectionArea: data.visionResult?.inspectionArea || data.visionResult?.inspection_area || "ALL",
    imageUrl: data.visionResult?.imageUrl || data.visionResult?.image_url || null,
  },
});
