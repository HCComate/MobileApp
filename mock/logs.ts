import { ERROR_MASTER_DATA } from "../assets/data/statesheet";
import { WORKER_LIST } from "./workerConfig";

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
const INITIAL_DATA_COUNT = 500;
const ERROR_RATE = 0.0005;

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

  if (state.status === "RUN" && Math.random() < ERROR_RATE) {
    state.status = "ERROR";

    // statesheet 데이터에서 랜덤하게 에러 하나 선택
    const randomError =
      ERROR_MASTER_DATA[Math.floor(Math.random() * ERROR_MASTER_DATA.length)];

    state.info = [
      {
        code: randomError.코드,
        msg: randomError.오류명,
        severity: randomError.심각도.toUpperCase() as any,
        direction: "TOP",
        part_location: "ZONE_A1",
        is_capture_required: true,
      },
    ];
  }

  if (state.status === "ERROR") {
    vision = {
      ...vision,
      result: "NG",
      defect_type: "MISALIGN",
      confidence: 0.45,
    };
  } else {
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
    const seq = Math.floor(i / DEVICE_COUNT) + 1;
    const time = new Date(Date.now() - (INITIAL_DATA_COUNT - i) * 1000);
    tempLogs.push(createLogEntry(deviceId, seq, time));
  }
  MOCK_RAW_LOGS = tempLogs.reverse();
};

init();

setInterval(() => {
  const currentMaxSeq =
    MOCK_RAW_LOGS.length > 0 ? MOCK_RAW_LOGS[0].body.sequence : 0;
  const newBatch = DEVICE_IDS.map((id) =>
    createLogEntry(id, currentMaxSeq + 1),
  );
  MOCK_RAW_LOGS = [...newBatch, ...MOCK_RAW_LOGS];

  if (MOCK_RAW_LOGS.length > MAX_LOG_CAPACITY) {
    MOCK_RAW_LOGS = MOCK_RAW_LOGS.slice(0, MAX_LOG_CAPACITY);
  }
}, 1000);

export const getDeviceIdsFromLogs = (): string[] => DEVICE_IDS;
export const getLatestLogByDevice = (deviceId: string): RawLog | undefined =>
  MOCK_RAW_LOGS.find((l) => l.header.device_id === deviceId);
export const getLogsByDevice = (deviceId: string): RawLog[] =>
  MOCK_RAW_LOGS.filter((l) => l.header.device_id === deviceId);
