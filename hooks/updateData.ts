import { useEffect, useState } from "react";
import { generateMockSummaries } from "../mock/deviceMocks";
import { MOCK_RAW_LOGS, RawLog } from "../mock/Logs";
import { DeviceSummary } from "../types/equipment";

/**
 * 1초마다 MOCK_RAW_LOGS를 구독하여 최신 로그 배열을 반환하는 훅
 */
export function useLogData(): RawLog[] {
  const [logs, setLogs] = useState<RawLog[]>([...MOCK_RAW_LOGS]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...MOCK_RAW_LOGS]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return logs;
}

export function useDeviceData() {
  const [devices, setDevices] = useState<DeviceSummary[]>(
    generateMockSummaries(),
  );

  useEffect(() => {
    // 1초마다 데이터를 새로 가져와서 상태 업데이트
    const interval = setInterval(() => {
      const freshData = generateMockSummaries();
      setDevices(freshData);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return devices;
}
