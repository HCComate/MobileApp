import { useEffect, useState } from "react";
import { MOCK_RAW_LOGS, RawLog } from "../mock/Logs";
import { MOCK_DEVICES } from "../mock/devices";
import api from "../services/api";
import { alertModalStore } from "../store/alertModalStore";
import { DeviceSummary, MachineStatus } from "../types/equipment";

const USE_API = false;

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
    const interval = setInterval(fetchLogs, 1000);
    return () => clearInterval(interval);
  }, []);
  return logs;
}

export function useDeviceData() {
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  useEffect(() => {
    const fetchDevices = async () => {
      if (alertModalStore.isActive()) return;
      if (!USE_API) {
        const mappedMock: DeviceSummary[] = MOCK_DEVICES.map((d: any) => {
          // Status mapping: Mock uses "OFF", UI expects "STOP" or "IDLE"
          let status: MachineStatus = "IDLE";
          if (d.status === "RUN") status = "RUN";
          else if (d.status === "ERROR") status = "ERROR";
          else if (d.status === "OFF") status = "STOP";

          return {
            deviceId:
              d.id || d.device_id || d.deviceId || `DEV_${Math.random()}`,
            modelName: d.name || d.model_name || d.modelName || "Unknown",
            machineStatus: status,
            timestamp: d.timestamp || new Date().toISOString(),
            visionResult: d.vision_result || d.visionResult || "OK",
            severity: d.severity || "LOW",
            lastSequence: d.last_sequence || d.lastSequence || 0,
          };
        });
        setDevices(mappedMock);
        return;
      }
      try {
        const res = await api.get("/devices");
        const rawData = res.data.data || res.data || [];
        setDevices(
          rawData.map((d: any) => ({
            deviceId: d.device_id || d.deviceId || d.id,
            modelName: d.model_name || d.modelName || d.name,
            machineStatus: (d.machine_status ||
              d.machineStatus ||
              d.status ||
              "IDLE") as MachineStatus,
            timestamp: d.timestamp || "",
            visionResult: d.vision_result || d.visionResult,
            severity: d.severity,
            lastSequence: d.last_sequence || d.lastSequence,
          })),
        );
      } catch (e) {
        setDevices([]);
      }
    };
    fetchDevices();
    const interval = setInterval(fetchDevices, 1000);
    return () => clearInterval(interval);
  }, []);
  return devices;
}
