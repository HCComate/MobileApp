import { DeviceDetail, DeviceSummary } from "@/types/equipment";
import apiClient from "./apiClient";
import { mapToDeviceDetail, mapToDeviceSummary } from "./dtoMapper";

/**
 * 실제 서버에서 모든 장비의 요약 정보를 가져옵니다.
 * @returns DeviceSummary[]
 */
export async function fetchDeviceSummaries(): Promise<DeviceSummary[]> {
  try {
    const response = await apiClient.get<any[]>("/api/devices");
    return response.data.map(mapToDeviceSummary);
  } catch (error) {
    console.error("[API Service] 장비 요약 정보 가져오기 실패:", error);
    throw error; // 에러를 다시 던져서 호출하는 쪽에서 처리할 수 있도록 함
  }
}

/**
 * 실제 서버에서 특정 장비의 상세 정보를 가져옵니다.
 * @param deviceId 장비 ID
 * @returns DeviceDetail
 */
export async function fetchDeviceDetail(
  deviceId: string,
): Promise<DeviceDetail> {
  try {
    const response = await apiClient.get<any>(`/api/devices/${deviceId}`);
    return mapToDeviceDetail(response.data);
  } catch (error) {
    console.error(
      `[API Service] 장비 ${deviceId} 상세 정보 가져오기 실패:`,
      error,
    );
    throw error; // 에러를 다시 던져서 호출하는 쪽에서 처리할 수 있도록 함
  }
}
