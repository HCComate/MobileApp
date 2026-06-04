import { useEffect, useState } from "react";
import { MOCK_RAW_LOGS, RawLog } from "../mock/Logs";
import { isServerMode } from "../mock/userData";
import apiClient from "../services/apiClient";

// 이벤트 로그(오류/이벤트성 로그) 전용 훅.
//
// 왜 useLogData(/api/inspections/recent)를 쓰지 않나:
// 장비가 초당 ~50건의 정상 로그를 쏟아내므로 "최근 N건"을 받아 앱에서 ERROR를
// 필터하면, 5초 폴링 사이(=250건)에 정상 로그에 묻혀 ERROR가 영구 누락된다.
// 서버 전용 엔드포인트(/api/inspections/events)는 H2(증분 폴링으로 빠짐없이 적재)에서
// ERROR/LOCKED만 골라 내리므로 폭주와 무관하게 항상 이벤트가 표시된다.

const EVENT_LIMIT = 200;

export function useEventLogs(): RawLog[] {
  const [logs, setLogs] = useState<RawLog[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      // 목업 모드: MOCK 로그에서 이벤트성만 필터 (서버와 동일한 화면 유지)
      if (!isServerMode) {
        setLogs(
          MOCK_RAW_LOGS.filter(
            (l) =>
              l.body.machine_status === "ERROR" ||
              l.body.machine_status === "LOCKED",
          ),
        );
        return;
      }

      try {
        const res = await apiClient.get<any>("/api/inspections/events", {
          params: { limit: EVENT_LIMIT },
        });
        const serverData = res.data?.data ?? res.data ?? [];
        if (!Array.isArray(serverData)) return;

        const mapped: RawLog[] = serverData.map((item: any) => ({
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

        // 서버가 id 내림차순(최신순)으로 이미 정렬해 내려준다. 그대로 교체.
        setLogs(mapped);
      } catch (e) {
        // 실패 시 기존 목록 유지 (비우지 않음)
        console.error("[useEventLogs] 이벤트 로그 로드 실패:", e);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  return logs;
}
