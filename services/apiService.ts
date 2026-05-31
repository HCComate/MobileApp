import { AlertUser, UserRole, WorkStatus } from "@/types/alert";
import { DeviceDetail, DeviceSummary } from "@/types/equipment";
import apiClient from "./apiClient";
import { mapToDeviceDetail, mapToDeviceSummary } from "./dtoMapper";

// AdminPC Server 호환: 응답이 { success, data } 래핑이면 data만, 아니면 그대로 반환
const unwrap = <T>(responseData: any): T => {
  if (responseData?.success !== undefined && responseData?.data !== undefined)
    return responseData.data as T;
  if (Array.isArray(responseData)) return responseData as T;
  return responseData as T;
};

const ROLE_MAP: Record<string, UserRole> = {
  MASTER: "MASTER",
  ADMIN: "MASTER",
  TECHNICIAN: "TECHNICIAN",
  OPERATOR: "OPERATOR",
};

const WORK_STATUS_MAP: Record<string, WorkStatus> = {
  IDLE: "IDLE",
  MONITORING: "MONITORING",
  WORKING: "WORKING",
  BUSY: "WORKING",
};

function mapServerUserToAlertUser(raw: any): AlertUser {
  return {
    userId: raw.userId,
    name: raw.name,
    role: ROLE_MAP[raw.role] ?? "OPERATOR",
    shiftStatus: raw.shiftStatus === "ON_DUTY" ? "ON_DUTY" : "OFF_DUTY",
    workStatus: WORK_STATUS_MAP[raw.workStatus] ?? "IDLE",
    assignedDevices: raw.assignedDevices ?? [],
  };
}

export async function fetchAlertUsers(): Promise<AlertUser[]> {
  try {
    const response = await apiClient.get<any>("/api/users");
    const data = unwrap<any[]>(response.data);
    return data.map(mapServerUserToAlertUser);
  } catch (error) {
    console.error("[API Service] 사용자 목록 가져오기 실패:", error);
    return [];
  }
}

export async function fetchDeviceSummaries(): Promise<DeviceSummary[]> {
  try {
    const response = await apiClient.get<any>("/api/devices");
    const data = unwrap<any[]>(response.data); // ← 언랩 추가
    return data.map(mapToDeviceSummary);
  } catch (error) {
    console.error("[API Service] 장비 요약 정보 가져오기 실패:", error);
    throw error;
  }
}

export async function fetchDeviceDetail(
  deviceId: string,
): Promise<DeviceDetail> {
  try {
    const response = await apiClient.get<any>(
      `/api/devices/${deviceId}/detail`, // ← /detail 추가
    );
    const data = unwrap<any>(response.data); // ← 언랩 추가
    return mapToDeviceDetail(data);
  } catch (error) {
    console.error(
      `[API Service] 장비 ${deviceId} 상세 정보 가져오기 실패:`,
      error,
    );
    throw error;
  }
}
