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
          
          setLogs((prevLogs) => {
            const map = new Map<string, RawLog>();
            // 1. 기존 로그 저장
            prevLogs.forEach(log => {
                const key = `${log.header.device_id}_${log.body.timestamp}`;
                map.set(key, log);
            });
            // 2. 새 로그로 덮어쓰기/추가
            sortedLogs.forEach(log => {
                const key = `${log.header.device_id}_${log.body.timestamp}`;
                map.set(key, log);
            });
            
            // 3. 다시 정렬 후 최대 1000개까지만 유지
            const allLogs = Array.from(map.values()).sort(
                (a, b) =>
                  new Date(b.body.timestamp).getTime() -
                  new Date(a.body.timestamp).getTime()
            );
            return allLogs.slice(0, 1000);
          });
        } else {
          // 서버 데이터가 아예 없는 경우 (빈 배열 반환 시)에는 아무것도 안 함 (기존 누적 유지)
        }
      } catch (e) {
        console.error("[useLogData] SERVER 데이터 로드 실패:", e);
        setLogs(MOCK_RAW_LOGS);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  return logs;
}

export function useDeviceData() {
  const logs = useLogData();
  const [devices, setDevices] = useState<DeviceSummary[]>([]);

  useEffect(() => {
    const updateDevices = async () => {
      // 1. 실제 서버 모드
      if (isServerMode) {
        try {
          const res = await apiClient.get<any>("/api/devices");

          // AdminPC Server: 배열 직접 반환 [...] 또는 { data: [...] }
          const rawData = res.data?.data ?? res.data ?? [];
          if (Array.isArray(rawData) && rawData.length > 0) {
            console.log(
              `[useDeviceData] SERVER 기기 목록 수신 성공 (${rawData.length}건)`,
            );

            const mappedDevices: DeviceSummary[] = rawData.map((d: any) => ({
              deviceId: d.deviceId || d.device_id,
              modelName: d.modelName || d.model_name,
              machineStatus: (d.machineStatus || d.status) as MachineStatus,
              timestamp: d.timestamp,
              visionResult: d.visionResult as VisionStatus,
              severity: d.severity as Severity,
              lastSequence: d.lastSequence || 0,
            }));

            setDevices(mappedDevices);
            return;
          }
        } catch (e) {
          console.error("[useDeviceData] SERVER 기기 데이터 로드 실패:", e);
        }
      }

      // 2. 가짜 데이터 처리 로직 (MOCK 모드이거나 서버 호출 실패 시)
      console.log("[useDeviceData] MOCK/Fallback 데이터 로직 실행");
      const mappedDevices: DeviceSummary[] = MOCK_DEVICES.map((device) => {
        const deviceLogs = logs.filter(
          (l) => l.header?.device_id === device.id,
        );
        const latestLog = deviceLogs[0];

        let status: MachineStatus = "STOP";
        let timestamp = new Date().toISOString();
        let visionResult: VisionStatus = "OK";
        let severity: Severity = "LOW";
        let lastSequence = 0;

        if (latestLog) {
          const logTime = new Date(latestLog.body?.timestamp || 0).getTime();
          const now = Date.now();
          const currentLogStatus = (latestLog.body?.machine_status ||
            "STOP") as MachineStatus;

          if (
            currentLogStatus !== "ERROR" &&
            now - logTime > IDLE_THRESHOLD_MS
          ) {
            status = "IDLE";
          } else {
            status = currentLogStatus;
          }

          timestamp = latestLog.body?.timestamp || timestamp;
          visionResult = latestLog.body?.vision_result
            ?.result as unknown as VisionStatus;
          severity = (latestLog.body?.status_info?.[0]?.severity ||
            "LOW") as Severity;
          lastSequence = latestLog.body?.sequence || 0;
        }

        return {
          deviceId: device.id,
          modelName: device.name,
          machineStatus: status,
          timestamp: timestamp,
          visionResult: visionResult,
          severity: severity,
          lastSequence: lastSequence,
        };
      });

      setDevices(mappedDevices);
    };

    updateDevices();
  }, [logs]);

  return devices;
}
