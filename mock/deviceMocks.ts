import { DeviceDetail, DeviceSummary, StatusInfo } from "../types/equipment";
import { getDeviceIdsFromLogs, getLatestLogByDevice } from "./Logs";

// ─────────────────────────────────────────────
//  RawLog → DeviceSummary 변환
// ─────────────────────────────────────────────
export const generateMockSummaries = (): DeviceSummary[] =>
  getDeviceIdsFromLogs().map((deviceId: string) => {
    const log = getLatestLogByDevice(deviceId)!;
    return {
      deviceId: log.header.device_id,
      modelName: log.header.model_name,
      machineStatus: log.body.machine_status as any,
      timestamp: log.body.timestamp,
      visionResult: log.body.vision_result.result as any,
      severity: (log.body.status_info[0]?.severity as any) ?? "LOW",
      lastSequence: log.body.sequence,
    };
  });

// ─────────────────────────────────────────────
//  RawLog → DeviceDetail 변환
// ─────────────────────────────────────────────
export const generateMockDetails = (): DeviceDetail[] =>
  getDeviceIdsFromLogs().map((deviceId: string) => {
    const log = getLatestLogByDevice(deviceId)!;
    return {
      deviceId: log.header.device_id,
      batchId: log.header.batch_id,
      modelName: log.header.model_name,
      sequence: log.body.sequence,
      machineStatus: log.body.machine_status as any,
      temperature: log.body.sensor_data.temperature,
      vibrationX: log.body.sensor_data.vibration_x,
      vibrationY: log.body.sensor_data.vibration_y,
      illumination: log.body.sensor_data.illumination,
      timestamp: log.body.timestamp,
      statusInfos: log.body.status_info.map((s: any) => ({
        code: s.code,
        msg: s.msg,
        severity: s.severity as any,
        direction: s.direction as any,
        partLocation: s.part_location,
        isCaptureRequired: s.is_capture_required,
      })) as StatusInfo[],
      visionResult: {
        result: log.body.vision_result.result as any,
        defectType: log.body.vision_result.defect_type,
        confidence: log.body.vision_result.confidence,
        inspectionArea: log.body.vision_result.inspection_area,
        imageUrl: log.body.vision_result.image_url,
      },
    };
  });

// ─────────────────────────────────────────────
//  특정 장비 상세 데이터 (단건)
// ─────────────────────────────────────────────
export const getMockDetailByDevice = (
  deviceId: string,
): DeviceDetail | undefined =>
  generateMockDetails().find((d) => d.deviceId === deviceId);
