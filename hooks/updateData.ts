import { useEffect, useState } from "react";
import { MOCK_RAW_LOGS, RawLog } from "../mock/Logs";
import { MOCK_DEVICES } from "../mock/devices";
import { isServerMode } from "../mock/userData";
import apiClient from "../services/apiClient";
import {
  DeviceSummary,
  MachineStatus,
  Severity,
  VisionStatus,
} from "../types/equipment";

/**
 * [IDLE 시간 변경 설정]
 * 아래 값을 밀리초(ms) 단위로 수정하여 IDLE 판정 시간을 조절할 수 있습니다.
 */
const IDLE_THRESHOLD_MS = 10000;

export function useLogData(): RawLog[] {
  const [logs, setLogs] = useState<RawLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      // 1. 가짜 데이터 모드 (MOCK)
      if (!isServerMode) {
        console.log("[useLogData] 현재 모드: MOCK");
        setLogs(
          [...MOCK_RAW_LOGS].sort(
            (a, b) =>
              new Date(b.body?.timestamp || 0).getTime() -
              new Date(a.body?.timestamp || 0).getTime(),
          ),
        );
        return;
      }

      // 2. 실제 서버 모드 (SERVER)
      try {
        const res = await apiClient.get<any>("/api/inspections/recent");

        // AdminPC Server: { success: true, data: [...] } 형식
        const serverData = res.data?.data ?? res.data ?? [];

        if (Array.isArray(serverData) && serverData.length > 0) {
          console.log(`[useLogData] SERVER 수신 성공 (${serverData.length}건)`);

          const mappedLogs: RawLog[] = serverData.map((item: any) => ({
            header: {
              device_id: item.deviceId,
              batch_id: item.batchId,
              model_name: item.modelName,
              assigned_worker_id: "",
            },
            body: {
              sequence: item.sequence,
              machine_status: item.machineStatus as any,
              status_info:
                item.statusInfos?.map((si: any) => ({
                  code: si.code,
                  msg: si.msg,
                  severity: si.severity,
                  direction: si.direction,
                  part_location: si.partLocation,
                  is_capture_required: si.isCaptureRequired,
                })) || [],
              vision_result: {
                result: item.visionResult?.result || "OK",
                defect_type: item.visionResult?.defectType || "NONE",
                confidence: item.visionResult?.confidence || 0,
                inspection_area: item.visionResult?.inspectionArea || "ALL",
                image_url: item.visionResult?.imageUrl || null,
              },
              sensor_data: {
                temperature: item.temperature,
                vibration_x: item.vibrationX,
                vibration_y: item.vibrationY,
                illumination: item.illumination,
                humidity: item.humidity || 0,
              },
              timestamp: item.timestamp,
            },
          }));

          const sortedLogs = mappedLogs.sort(
            (a, b) =>
              new Date(b.body.timestamp).getTime() -
              new Date(a.body.timestamp).getTime(),
          );
          setLogs(sortedLogs);
        } else {
          setLogs([]);
        }
      } catch (e) {
        console.error("[useLogData] SERVER 데이터 로드 실패:", e);
        setLogs(MOCK_RAW_LOGS);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return logs;
}

export function useDeviceData() {
  const logs = useLogData();
  const [devices, setDevices] = useState<DeviceSummary[]>([]);

  // 서버/Mock 공통 데이터 갱신 함수 (5초마다 실행)
  useEffect(() => {
    const updateDevices = async () => {
      // 서버 모드: /api/devices 직접 호출
      if (isServerMode) {
        try {
          const res = await apiClient.get<any>("/api/devices");
          const rawData = res.data?.data ?? res.data ?? [];
          if (Array.isArray(rawData) && rawData.length > 0) {
            console.log(`[useDeviceData] SERVER 기기 목록 수신 성공 (${rawData.length}건)`);
            setDevices(rawData.map((d: any) => ({
              deviceId: d.deviceId || d.device_id,
              modelName: d.modelName || d.model_name,
              machineStatus: (d.machineStatus || d.status) as MachineStatus,
              timestamp: d.timestamp,
              visionResult: d.visionResult as VisionStatus,
              severity: d.severity as Severity,
              lastSequence: d.lastSequence || 0,
            })));
            return;
          }
        } catch (e) {
          console.error("[useDeviceData] SERVER 기기 데이터 로드 실패:", e);
        }
      }

      // Mock/Fallback: logs 기반으로 장비 상태 계산
      console.log("[useDeviceData] MOCK/Fallback 데이터 로직 실행");
      const currentLogs = logs;
      setDevices(MOCK_DEVICES.map((device) => {
        const latestLog = currentLogs.find((l) => l.header?.device_id === device.id);
        let status: MachineStatus = "STOP";
        let timestamp = new Date().toISOString();
        let visionResult: VisionStatus = "OK";
        let severity: Severity = "LOW";
        let lastSequence = 0;

        if (latestLog) {
          const logTime = new Date(latestLog.body?.timestamp || 0).getTime();
          const currentLogStatus = (latestLog.body?.machine_status || "STOP") as MachineStatus;
          status = (currentLogStatus !== "ERROR" && currentLogStatus !== "LOCKED" &&
            Date.now() - logTime > IDLE_THRESHOLD_MS) ? "IDLE" : currentLogStatus;
          timestamp = latestLog.body?.timestamp || timestamp;
          visionResult = latestLog.body?.vision_result?.result as unknown as VisionStatus;
          severity = (latestLog.body?.status_info?.[0]?.severity || "LOW") as Severity;
          lastSequence = latestLog.body?.sequence || 0;
        }
        return { deviceId: device.id, modelName: device.name, machineStatus: status,
          timestamp, visionResult, severity, lastSequence };
      }));
    };

    updateDevices();
    const interval = setInterval(updateDevices, 5000);
    return () => clearInterval(interval);
  }, [logs]);

  return devices;
}
