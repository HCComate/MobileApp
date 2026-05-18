import { useEffect, useState } from "react";
import { RawLog } from "../mock/logs";
import api from "../services/api";
import { alertModalStore } from "../store/alertModalStore";
import { DeviceSummary } from "../types/equipment";

/**
 * 1초마다 MOCK_RAW_LOGS를 구독하여 최신 로그 배열을 반환하는 훅
 */
export function useLogData(): RawLog[] {
  const [logs, setLogs] = useState<RawLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        if (!alertModalStore.isActive()) {
          const response = await api.get<RawLog[]>("/inspections"); // Assuming /inspections is the endpoint for all logs
          setLogs(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    };

    fetchLogs(); // Initial fetch
    const interval = setInterval(fetchLogs, 1000); // Fetch every second

    return () => clearInterval(interval);
  }, []);

  return logs;
}

export function useDeviceData() {
  const [devices, setDevices] = useState<DeviceSummary[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        if (!alertModalStore.isActive()) {
          const response = await api.get<DeviceSummary[]>("/devices");
          setDevices(response.data.data); // Assuming response.data.data contains the array of devices
        }
      } catch (error) {
        console.error("Failed to fetch devices:", error);
      }
    };

    fetchDevices(); // Initial fetch
    const interval = setInterval(fetchDevices, 1000); // Fetch every second

    return () => clearInterval(interval);
  }, []);

  return devices;
}
