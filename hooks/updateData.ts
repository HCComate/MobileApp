import { useEffect, useState } from "react";
import { MOCK_RAW_LOGS, RawLog } from "../mock/Logs";
import { MOCK_DEVICES } from "../mock/devices";
import api from "../services/api";
import { alertModalStore } from "../store/alertModalStore";
import {
  DeviceSummary,
  MachineStatus,
  Severity,
  VisionResult,
} from "../types/equipment";

const USE_API = false;

/**
 * [IDLE 시간 변경 설정]
 * 아래 값을 밀리초(ms) 단위로 수정하여 IDLE 판정 시간을 조절할 수 있습니다.
 * 예: 5000 = 5초, 10000 = 10초
 */
const IDLE_THRESHOLD_MS = 10000;

export function useLogData(): RawLog[] {
  const [logs, setLogs] = useState<RawLog[]>([]);
  useEffect(() => {
    const fetchLogs = async () => {
      if (alertModalStore.isActive()) return;
      if (!USE_API) {
        setLogs(
          [...MOCK_RAW_LOGS].sort(
            (a, b) =>
              new Date(b.body?.timestamp || 0).getTime() -
              new Date(a.body?.timestamp || 0).getTime(),
          ),
        );
        return;
      }
      try {
        const res = await api.get<RawLog[]>("/inspections");
        setLogs(
          [...res.data].sort(
            (a, b) =>
              new Date(b.body?.timestamp || 0).getTime() -
              new Date(a.body?.timestamp || 0).getTime(),
          ),
        );
      } catch (e) {
        setLogs(MOCK_RAW_LOGS);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 500);
    return () => clearInterval(interval);
  }, []);
  return logs;
}

export function useDeviceData() {
  const logs = useLogData();
  const [devices, setDevices] = useState<DeviceSummary[]>([]);

  useEffect(() => {
    const updateDevices = () => {
      if (alertModalStore.isActive()) return;

      const mappedDevices: DeviceSummary[] = MOCK_DEVICES.map((device) => {
        const deviceLogs = logs.filter(
          (l) => l.header?.device_id === device.id,
        );
        const latestLog = deviceLogs[0];

        let status: MachineStatus = "STOP";
        let timestamp = new Date().toISOString();
        let visionResult: VisionResult = "OK";
        let severity: Severity = "LOW";
        let lastSequence = 0;

        if (latestLog) {
          const logTime = new Date(latestLog.body?.timestamp || 0).getTime();
          const now = Date.now();
          const currentLogStatus = (latestLog.body?.machine_status ||
            "STOP") as MachineStatus;

          // [수정] ERROR 상태인 장비는 IDLE 체크 대상에서 제외
          if (
            currentLogStatus !== "ERROR" &&
            now - logTime > IDLE_THRESHOLD_MS
          ) {
            status = "IDLE";
          } else {
            status = currentLogStatus;
          }

          timestamp = latestLog.body?.timestamp || timestamp;
          visionResult = (latestLog.body?.vision_result?.result ||
            "OK") as VisionResult;
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
