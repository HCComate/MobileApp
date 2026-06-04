import { useEffect, useMemo, useRef, useState } from "react";
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

// 화면에 누적해 둘 최대 로그 개수 (메모리 보호용 상한)
const MAX_ACCUMULATED_LOGS = 1000;

export function useLogData(): RawLog[] {
  const [logs, setLogs] = useState<RawLog[]>([]);
  // 이미 화면에 추가한 로그를 식별하는 키 집합 (중복 누적 방지)
  const seenKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 로그 1건을 유일하게 식별하는 키 (장비 + 시퀀스 + 타임스탬프)
    const makeKey = (l: RawLog) =>
      `${l.header.device_id}__${l.body.sequence}__${l.body.timestamp}`;

    const fetchLogs = async () => {
      // 1. 가짜 데이터 모드 (MOCK) — 기존 동작 유지(전체 교체)
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

      // 2. 실제 서버 모드 (SERVER) — 덮어쓰기 대신 "누적"
      try {
        // limit을 넉넉히 줘서 RESOLVED 등 이벤트성 로그가 최근 50건 밖으로
        // 밀려 누락되는 것을 방지한다. (한 번이라도 받으면 seenKeys에 누적됨)
        const res = await apiClient.get<any>("/api/inspections/recent", {
          params: { limit: 200 },
        });

        // AdminPC Server: { success: true, data: [...] } 형식
        const serverData = res.data?.data ?? res.data ?? [];

        if (!Array.isArray(serverData) || serverData.length === 0) {
          // 받은 게 없으면 기존 누적분을 그대로 유지 (비우지 않음)
          return;
        }

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

        // 아직 화면에 없는(처음 보는) 로그만 추출
        const freshLogs = mappedLogs.filter(
          (l) => !seenKeysRef.current.has(makeKey(l)),
        );
        if (freshLogs.length === 0) {
          // 새 로그 없음 → 상태 변경/리렌더 없이 종료
          return;
        }
        console.log(`[useLogData] SERVER 신규 로그 ${freshLogs.length}건 누적`);
        freshLogs.forEach((l) => seenKeysRef.current.add(makeKey(l)));

        setLogs((prev) => {
          // 새 로그 + 기존 누적분을 합쳐 최신순 정렬
          const merged = [...freshLogs, ...prev].sort(
            (a, b) =>
              new Date(b.body.timestamp).getTime() -
              new Date(a.body.timestamp).getTime(),
          );

          // 상한 초과 시 오래된 로그부터 잘라내고 키 집합도 동기화
          if (merged.length > MAX_ACCUMULATED_LOGS) {
            const trimmed = merged.slice(0, MAX_ACCUMULATED_LOGS);
            seenKeysRef.current = new Set(trimmed.map(makeKey));
            return trimmed;
          }
          return merged;
        });
      } catch (e) {
        console.error("[useLogData] SERVER 데이터 로드 실패:", e);
        // 실패 시 기존 누적분 유지 (비우지 않음)
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return logs;
}

export function useDeviceData() {
  const logs = useLogData();
  const [devices, setDevices] = useState<DeviceSummary[]>([]);

  // 서버 모드: 5초 폴링 (isServerMode가 나중에 true가 되어도 interval에서 감지)
  useEffect(() => {
    const fetchServerDevices = async () => {
      if (!isServerMode) return;
      try {
        const res = await apiClient.get<any>("/api/devices");
        const rawData = res.data?.data ?? res.data ?? [];
        if (Array.isArray(rawData)) {
          console.log(`[useDeviceData] SERVER 기기 목록 수신: ${rawData.length}건`);
          setDevices(rawData.map((d: any) => ({
            deviceId: d.deviceId || d.device_id,
            modelName: d.modelName || d.model_name || "",
            machineStatus: (d.machineStatus || d.status) as MachineStatus,
            timestamp: d.timestamp || "",
            // 서버가 장비별 최신 로그의 vision 정보를 함께 내려준다.
            visionResult: (d.visionResult as VisionStatus) || "OK",
            severity: (d.severity as Severity) || "LOW",
            lastSequence: d.lastSequence || 0,
            defectType: d.defectType,
            imageUrl: d.imageUrl ?? null,
          })));
        }
      } catch (e) {
        console.error("[useDeviceData] SERVER 기기 데이터 로드 실패:", e);
      }
    };

    fetchServerDevices();
    const interval = setInterval(fetchServerDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  // MOCK 모드: logs 변경 시마다 장비 상태 재계산
  useEffect(() => {
    if (isServerMode) return;

    console.log("[useDeviceData] MOCK 데이터 로직 실행");
    setDevices(MOCK_DEVICES.map((device) => {
      const latestLog = logs.find((l) => l.header?.device_id === device.id);
      let status: MachineStatus = "STOP";
      let timestamp = new Date().toISOString();
      let visionResult: VisionStatus = "OK";
      let severity: Severity = "LOW";
      let lastSequence = 0;

      if (latestLog) {
        const logTime = new Date(latestLog.body?.timestamp || 0).getTime();
        const currentLogStatus = (latestLog.body?.machine_status || "STOP") as MachineStatus;
        status = (currentLogStatus !== "ERROR" && currentLogStatus !== "LOCKED" &&
          Date.now() - logTime > IDLE_THRESHOLD_MS) ? "IDLE" : currentLogStatus;
        timestamp = latestLog.body?.timestamp || timestamp;
        visionResult = latestLog.body?.vision_result?.result as unknown as VisionStatus;
        severity = (latestLog.body?.status_info?.[0]?.severity || "LOW") as Severity;
        lastSequence = latestLog.body?.sequence || 0;
      }
      return { deviceId: device.id, modelName: device.name, machineStatus: status,
        timestamp, visionResult, severity, lastSequence };
    }));
  }, [logs]);

  // 비전 이미지는 'visionResult'를 기준으로 정합을 맞춘다.
  // 목록 API(MobileServer /api/devices)는 defectType/imageUrl을 주지 않으므로
  // 누적 로그에서 보강하되, visionResult와 출처가 어긋나(OK 장비에 과거 NG 로그의
  // 결함 이미지가 붙는) 모순을 막는다.
  const enrichedDevices = useMemo<DeviceSummary[]>(() => {
    return devices.map((d) => {
      // 1. OK(=비NG): 결함 이미지 정보를 비워 항상 vision_ok가 뜨도록 강제한다.
      //    (이래야 폴링마다 누적 로그가 바뀌어도 OK 장비 이미지가 흔들리지 않음)
      if (d.visionResult !== "NG") {
        return { ...d, defectType: undefined, imageUrl: null };
      }

      // 2. NG이고 유효한 결함 정보가 이미 있으면(서버 직접 제공) 그대로 사용.
      const hasDefectInfo =
        (d.defectType && d.defectType !== "NONE") || d.imageUrl;
      if (hasDefectInfo) return d;

      // 3. NG인데 결함 정보가 비었으면, 같은 장비의 'NG' 로그에서만 보강한다.
      //    (OK 로그를 끌어와 imageUrl이 어긋나는 일을 차단)
      const log = logs.find(
        (l) =>
          l.header?.device_id === d.deviceId &&
          l.body?.vision_result?.result === "NG",
      );
      const v = log?.body?.vision_result;
      if (!v) return d;
      return {
        ...d,
        severity:
          d.severity ??
          (log?.body?.status_info?.[0]?.severity as Severity) ??
          "LOW",
        defectType: v.defect_type,
        imageUrl: v.image_url ?? null,
      };
    });
  }, [devices, logs]);

  return enrichedDevices;
}
