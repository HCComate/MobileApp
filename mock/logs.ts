import { handleAlertEvent } from "../services/alertManager";
import { AlertEvent } from "../types/alert";
import { isServerMode } from "./userData";
import { MOCK_WORKERS } from "./workers";

// [마스터 데이터] 다양한 에러 상황 정의
const ERROR_MASTER_DATA = [
  { 코드: "E001", 오류명: "모터 과열 감지", 심각도: "CRITICAL" },
  { 코드: "E002", 오류명: "센서 통신 단절", 심각도: "HIGH" },
  { 코드: "E003", 오류명: "전압 공급 불안정", 심각도: "MEDIUM" },
  { 코드: "E004", 오류명: "비전 정렬 불량 (Misalignment)", 심각도: "HIGH" },
  { 코드: "E005", 오류명: "컨베이어 벨트 슬립", 심각도: "MEDIUM" },
  { 코드: "E006", 오류명: "긴급 정지 버튼 활성화", 심각도: "CRITICAL" },
  { 코드: "E007", 오류명: "데이터 패킷 유실", 심각도: "LOW" },
];

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
    machine_status: "RUN" | "ERROR" | "IDLE" | "STOP" | "STANDBY" | "LOCKED";
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
const MAX_LOG_CAPACITY = 5000;
const INITIAL_DATA_COUNT = 100;
const ERROR_RATE = 0.001;
const RECOVERY_RATE = 0.00005;

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

// [추가된 함수] 장비 ID 목록 가져오기
export const getDeviceIdsFromLogs = (): string[] => {
  return DEVICE_IDS;
};

// [추가된 함수] 특정 장비의 최신 로그 가져오기
export const getLatestLogByDevice = (deviceId: string): RawLog | undefined => {
  return MOCK_RAW_LOGS.find((log) => log.header.device_id === deviceId);
};

const createLogEntry = (
  deviceId: string,
  sequence: number,
  customTimestamp?: Date,
): RawLog => {
  const deviceIndex = DEVICE_IDS.indexOf(deviceId);
  const worker = MOCK_WORKERS[deviceIndex % MOCK_WORKERS.length];

  let state = deviceCurrentState.get(deviceId) || { status: "RUN", info: [] };
  let vision: RawVisionResult = {
    result: "OK",
    defect_type: "NONE",
    confidence: 0.99,
    inspection_area: "ALL",
    image_url: null,
  };

  if (state.status === "RUN" && Math.random() < ERROR_RATE) {
    state.status = "ERROR";
    const randomError =
      ERROR_MASTER_DATA[Math.floor(Math.random() * ERROR_MASTER_DATA.length)];
    state.info = [
      {
        code: randomError.코드,
        msg: randomError.오류명,
        severity: randomError.심각도 as any,
        direction: "TOP",
        part_location: "ZONE_A1",
        is_capture_required: true,
      },
    ];

    const alertEvent: AlertEvent = {
      alertId: `alert_${Date.now()}_${deviceId}_${sequence}`,
      deviceId: deviceId,
      errorCode: randomError.코드,
      errorMsg: randomError.오류명,
      severity: randomError.심각도 as any,
      timestamp: new Date().toISOString(),
    };
    handleAlertEvent(alertEvent, MOCK_WORKERS as any);
  } else if (state.status === "ERROR" && Math.random() < RECOVERY_RATE) {
    state.status = "RUN";
    state.info = [];
  }

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
      assigned_worker_id: worker.userId,
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

export const resolveDeviceError = async (deviceId: string) => {
  const state = deviceCurrentState.get(deviceId);
  if (state && state.status === "ERROR") {
    state.status = "RUN";
    state.info = [];
    deviceCurrentState.set(deviceId, state);
    const newLog = createLogEntry(deviceId, ++globalSequence);
    MOCK_RAW_LOGS.unshift(newLog);
  }
  return true;
};

const init = () => {
  // 1. 초기 데이터 생성 (앱 실행 시 최초 1회만)
  for (let i = 0; i < INITIAL_DATA_COUNT; i++) {
    const id = DEVICE_IDS[Math.floor(Math.random() * DEVICE_IDS.length)];
    globalSequence++;
    MOCK_RAW_LOGS.push(createLogEntry(id, globalSequence));
  }

  // 2. 실시간 데이터 시뮬레이션
  setInterval(() => {
    // ⭐ [중요] 서버 모드가 활성화되어 있다면 가짜 로그 생성을 중단합니다.
    if (isServerMode) return;

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
};

init();
