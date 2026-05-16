import { ERROR_MASTER_DATA } from "../assets/data/statesheet";
import { handleAlertEvent } from "../services/alertManager";
import { WORKER_LIST } from "./workerConfig";
import { MOCK_WORKERS } from "./workers";

export interface RawStatusInfo {
  code: string;
  msg: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  direction: string;
  part_location: string;
  is_capture_required: boolean;
}

export interface RawVisionResult {
  result: "OK" | "NG";
  defect_type: string;
  confidence: number;
  inspection_area: string;
  image_url: string | null;
}

export interface RawLog {
  header: {
    device_id: string;
    batch_id: string;
    model_name: string;
    assigned_worker_id: string;
  };
  body: {
    sequence: number;
    machine_status: "RUN" | "ERROR" | "IDLE" | "STOP";
    status_info: RawStatusInfo[];
    vision_result: RawVisionResult;
    sensor_data: {
      temperature: number;
      vibration_x: number;
      vibration_y: number;
      illumination: number;
      humidity: number;
    };
    timestamp: string;
  };
}

const DEVICE_COUNT = 25;
const MAX_LOG_CAPACITY = 50000;
const INITIAL_DATA_COUNT = 50;
const ERROR_RATE = 0.05; // 5% 확률로 에러 발생
const RECOVERY_RATE = 0.2; // 20% 확률로 정상 복구

let globalSequence = 0;

const DEVICE_IDS = Array.from(
  { length: DEVICE_COUNT },
  (_, i) => `RASP_PI_${String(i + 1).padStart(2, "0")}`,
);

const deviceCurrentState = new Map<
  string,
  { status: "RUN" | "ERROR" | "IDLE" | "STOP"; info: RawStatusInfo[] }
>();

export let MOCK_RAW_LOGS: RawLog[] = [];

const createLogEntry = (
  deviceId: string,
  sequence: number,
  customTimestamp?: Date,
): RawLog => {
  const deviceIndex = DEVICE_IDS.indexOf(deviceId);
  const worker = WORKER_LIST[deviceIndex % WORKER_LIST.length];

  let state = deviceCurrentState.get(deviceId) || { status: "RUN", info: [] };
  let vision: RawVisionResult = {
    result: "OK",
    defect_type: "NONE",
    confidence: 0.99,
    inspection_area: "ALL",
    image_url: null,
  };

  // --- [핵심 수정] 에러 발생 로직 ---
  if (state.status === "RUN" && Math.random() < ERROR_RATE) {
    state.status = "ERROR";
    const randomError =
      ERROR_MASTER_DATA[Math.floor(Math.random() * ERROR_MASTER_DATA.length)];

    // 1. 에러 정보 생성
    const newErrorInfo: RawStatusInfo = {
      code: randomError.코드,
      msg: randomError.오류명,
      severity: randomError.심각도.toUpperCase() as any,
      direction: "TOP",
      part_location: "ZONE_A1",
      is_capture_required: true,
    };
    state.info = [newErrorInfo]; // 상태 업데이트

    // 2. 알람 트리거 발송
    const alertEvent = {
      alertId: `alert_${Date.now()}_${deviceId}`,
      deviceId: deviceId,
      errorCode: newErrorInfo.code,
      errorMsg: newErrorInfo.msg,
      severity: newErrorInfo.severity,
      timestamp: new Date().toISOString(),
    };
    handleAlertEvent(alertEvent, MOCK_WORKERS as any);
  } else if (state.status === "ERROR" && Math.random() < RECOVERY_RATE) {
    // 복구 로직
    state.status = "RUN";
    state.info = [
      {
        code: "NORMAL",
        msg: "Operational",
        severity: "LOW",
        direction: "NONE",
        part_location: "NONE",
        is_capture_required: false,
      },
    ];
  }

  // 상태가 없을 경우 초기화
  if (state.info.length === 0) {
    state.info = [
      {
        code: "NORMAL",
        msg: "Operational",
        severity: "LOW",
        direction: "NONE",
        part_location: "NONE",
        is_capture_required: false,
      },
    ];
  }

  if (state.status === "ERROR") {
    vision.result = "NG";
    vision.defect_type = "MISALIGN";
    vision.confidence = 0.45;
  }

  deviceCurrentState.set(deviceId, state);

  return {
    header: {
      device_id: deviceId,
      batch_id: "BATCH_REALTIME",
      model_name: "SMT_CHIP_A20",
      assigned_worker_id: worker.id,
    },
    body: {
      sequence,
      machine_status: state.status,
      status_info: state.info,
      vision_result: vision,
      sensor_data: {
        temperature: 35 + Math.random() * 15,
        vibration_x: Math.random() * 0.05,
        vibration_y: Math.random() * 0.05,
        illumination: 1200 + Math.random() * 200,
        humidity: 40 + Math.random() * 10,
      },
      timestamp: (customTimestamp || new Date()).toISOString(),
    },
  };
};

const init = () => {
  const tempLogs: RawLog[] = [];
  for (let i = 0; i < INITIAL_DATA_COUNT; i++) {
    const deviceId = DEVICE_IDS[i % DEVICE_COUNT];
    globalSequence++;
    const time = new Date(Date.now() - (INITIAL_DATA_COUNT - i) * 1000);
    tempLogs.push(createLogEntry(deviceId, globalSequence, time));
  }
  MOCK_RAW_LOGS = tempLogs.reverse();
};

init();

setInterval(() => {
  // 매초 3~7개의 랜덤한 장비만 선택하여 로그 생성
  const randomCount = Math.floor(Math.random() * 5) + 3;
  const shuffled = [...DEVICE_IDS].sort(() => 0.5 - Math.random());
  const selectedIds = shuffled.slice(0, randomCount);

  const newLogs = selectedIds.map((id) => {
    globalSequence++;
    return createLogEntry(id, globalSequence);
  });

  MOCK_RAW_LOGS = [...newLogs, ...MOCK_RAW_LOGS];

  if (MOCK_RAW_LOGS.length > MAX_LOG_CAPACITY) {
    MOCK_RAW_LOGS = MOCK_RAW_LOGS.slice(0, MAX_LOG_CAPACITY);
  }
}, 1000);

export const getDeviceIdsFromLogs = (): string[] => DEVICE_IDS;
export const getLatestLogByDevice = (deviceId: string): RawLog | undefined =>
  MOCK_RAW_LOGS.find((l) => l.header.device_id === deviceId);
export const getLogsByDevice = (deviceId: string): RawLog[] =>
  MOCK_RAW_LOGS.filter((l) => l.header.device_id === deviceId);
