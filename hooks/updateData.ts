import { useEffect, useState } from "react";
import { MOCK_RAW_LOGS, RawLog } from "../mock/Logs";
import { MOCK_DEVICES } from "../mock/devices";
import apiClient from "../services/apiClient"; // api 대신 apiClient 사용
import { fetchDeviceSummaries } from "../services/apiService"; // 실제 서버 데이터 호출 함수
import {
  DeviceSummary,
  MachineStatus,
  Severity,
  VisionStatus, // VisionResult 대신 VisionStatus 사용
} from "../types/equipment";

// --- 데이터 소스 전환 플래그 ---
// 이 값을 true로 바꾸면 실제 서버에서 데이터를 가져옵니다.
const USE_REAL_SERVER = false;
// -------------------------------

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
      // 가짜 데이터 모드
      if (!USE_REAL_SERVER) {
        setLogs(
          [...MOCK_RAW_LOGS].sort(
            (a, b) =>
              new Date(b.body?.timestamp || 0).getTime() -
              new Date(a.body?.timestamp || 0).getTime(),
          ),
        );
        return;
      }

      // 실제 서버 모드
      try {
        const res = await apiClient.get<RawLog[]>("/api/inspections");
        setLogs(
          [...res.data].sort(
            (a, b) =>
              new Date(b.body?.timestamp || 0).getTime() -
              new Date(a.body?.timestamp || 0).getTime(),
          ),
        );
      } catch (e) {
        console.error("[useLogData] 서버 데이터 로드 실패:", e);
        setLogs(MOCK_RAW_LOGS); // 실패 시 가짜 데이터로 폴백
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
    const updateDevices = async () => {
      // 실제 서버 모드
      if (USE_REAL_SERVER) {
        try {
          const realDevices = await fetchDeviceSummaries();
          setDevices(realDevices);
          return;
        } catch (e) {
          console.error("[useDeviceData] 서버 데이터 로드 실패:", e);
          // 실패 시 가짜 데이터 로직으로 진행
        }
      }

      // 가짜 데이터 처리 로직
      const mappedDevices: DeviceSummary[] = MOCK_DEVICES.map((device) => {
        const deviceLogs = logs.filter(
          (l) => l.header?.device_id === device.id,
        );
        const latestLog = deviceLogs[0];

        let status: MachineStatus = "STOP";
        let timestamp = new Date().toISOString();
        let visionResult: VisionStatus = "OK"; // VisionStatus로 타입 수정
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
          // unknown을 거쳐 VisionStatus로 안전하게 캐스팅
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
