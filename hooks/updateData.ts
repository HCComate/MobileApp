import { useEffect, useState } from "react";
import { generateMockSummaries } from "../mock/deviceMocks";
import { DeviceSummary } from "../types/equipment";

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
