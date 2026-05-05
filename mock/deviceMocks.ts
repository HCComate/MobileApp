// ─────────────────────────────────────────────
//  mocks/deviceMocks.ts
//  테스트용 더미 데이터 (서버 DTO camelCase 기준)
//
//  ⚠️  테스트 전용 파일입니다.
//  ─────────────────────────────────────────────
//  통신 연동 시 변경 방법:
//
//  [index.tsx]
//    현재: setDevices(generateMockSummaries())
//    변경: const res = await fetch('/api/devices', { headers: { Authorization: `Bearer ${token}` } });
//          const data: DeviceSummary[] = await res.json();
//          setDevices(data);
//
//  [deviceId].tsx]
//    현재: deviceStore.getDetail(deviceId) → 더미 상세 데이터
//    변경: const res = await fetch(`/api/devices/${deviceId}/detail`, ...);
//          const data: DeviceDetail = await res.json();
//          deviceStore.setDetail(data);
//          setDetail(data);
// ─────────────────────────────────────────────

import {
  DeviceSummary,
  DeviceDetail,
  MachineStatus,
  VisionResult,
  Severity,
  StatusInfo,
} from '../types/equipment';

// ── 시나리오 정의 (장비마다 다른 상태/센서/오류 값) ──
interface DeviceScenario {
  machineStatus: MachineStatus;
  visionResult:  VisionResult;
  severity:      Severity;
  temperature:   number;
  vibrationX:    number;
  vibrationY:    number;
  illumination:  number;
  humidity:      number;
  defectType:    string;
  confidence:    number;
  statusInfos:   StatusInfo[];
  timestamp:     string;
}

const SCENARIOS: DeviceScenario[] = [
  // 0: 정상 가동
  {
    machineStatus: 'RUN', visionResult: 'OK', severity: 'LOW',
    temperature: 38.5, vibrationX: 0.01, vibrationY: 0.01, illumination: 1250, humidity: 45.2,
    defectType: 'NONE', confidence: 0.99,
    statusInfos: [{ code: 'SV-PR-00', msg: 'Vision Inspection OK', severity: 'LOW',
      direction: 'TOP', partLocation: 'ZONE_ALL', isCaptureRequired: false }],
    timestamp: '2026-05-04 09:10:00.001',
  },
  // 1: 정상 가동 (다른 센서값)
  {
    machineStatus: 'RUN', visionResult: 'OK', severity: 'LOW',
    temperature: 41.2, vibrationX: 0.02, vibrationY: 0.01, illumination: 1230, humidity: 43.8,
    defectType: 'NONE', confidence: 0.97,
    statusInfos: [{ code: 'SV-PR-00', msg: 'Vision Inspection OK', severity: 'LOW',
      direction: 'TOP', partLocation: 'ZONE_ALL', isCaptureRequired: false }],
    timestamp: '2026-05-04 09:12:30.000',
  },
  // 2: NG - 스크래치 감지
  {
    machineStatus: 'ERROR', visionResult: 'NG', severity: 'MEDIUM',
    temperature: 45.2, vibrationX: 0.08, vibrationY: 0.09, illumination: 1050, humidity: 48.1,
    defectType: 'SCRATCH', confidence: 0.82,
    statusInfos: [{ code: 'SV-PR-05', msg: '표면 스크래치 감지 - 제품 표면 긁힘 불량 검출',
      severity: 'MEDIUM', direction: 'SIDE_LEFT', partLocation: 'ZONE_B3',
      isCaptureRequired: true }],
    timestamp: '2026-05-04 09:15:05.123',
  },
  // 3: 대기 상태
  {
    machineStatus: 'IDLE', visionResult: 'OK', severity: 'LOW',
    temperature: 35.0, vibrationX: 0.00, vibrationY: 0.00, illumination: 1100, humidity: 44.0,
    defectType: 'NONE', confidence: 0.95,
    statusInfos: [{ code: 'SV-PR-00', msg: 'Vision Inspection OK', severity: 'LOW',
      direction: 'TOP', partLocation: 'ZONE_ALL', isCaptureRequired: false }],
    timestamp: '2026-05-04 09:18:00.000',
  },
  // 4: 정지
  {
    machineStatus: 'STOP', visionResult: 'OK', severity: 'LOW',
    temperature: 33.1, vibrationX: 0.00, vibrationY: 0.00, illumination: 900, humidity: 42.5,
    defectType: 'NONE', confidence: 0.91,
    statusInfos: [{ code: 'SV-PR-00', msg: 'Vision Inspection OK', severity: 'LOW',
      direction: 'TOP', partLocation: 'ZONE_ALL', isCaptureRequired: false }],
    timestamp: '2026-05-04 09:20:00.000',
  },
  // 5: NG - 크랙 감지 (HIGH, 복합 에러)
  {
    machineStatus: 'ERROR', visionResult: 'NG', severity: 'HIGH',
    temperature: 52.8, vibrationX: 0.15, vibrationY: 0.13, illumination: 980, humidity: 51.3,
    defectType: 'CRACK', confidence: 0.91,
    statusInfos: [
      { code: 'SV-PR-04', msg: '크랙 감지 - 제품 표면 또는 내부 균열 검출',
        severity: 'HIGH', direction: 'TOP', partLocation: 'ZONE_A1', isCaptureRequired: true },
      { code: 'HM-TE-01', msg: '메인모터 과열 위험 - 모터 온도 위험 임계치 초과',
        severity: 'HIGH', direction: 'FRONT', partLocation: 'MOTOR_MAIN', isCaptureRequired: false },
    ],
    timestamp: '2026-05-04 09:22:45.555',
  },
  // 6: 정상 가동
  {
    machineStatus: 'RUN', visionResult: 'OK', severity: 'LOW',
    temperature: 39.7, vibrationX: 0.03, vibrationY: 0.02, illumination: 1270, humidity: 44.9,
    defectType: 'NONE', confidence: 0.98,
    statusInfos: [{ code: 'SV-PR-00', msg: 'Vision Inspection OK', severity: 'LOW',
      direction: 'TOP', partLocation: 'ZONE_ALL', isCaptureRequired: false }],
    timestamp: '2026-05-04 09:25:10.002',
  },
  // 7: NG - 부품 누락 (CRITICAL)
  {
    machineStatus: 'ERROR', visionResult: 'NG', severity: 'CRITICAL',
    temperature: 48.0, vibrationX: 0.11, vibrationY: 0.10, illumination: 1000, humidity: 49.7,
    defectType: 'MISSING', confidence: 0.99,
    statusInfos: [{ code: 'SV-PR-01', msg: '부품 누락 - 필수 부품이 없는 제품 검출',
      severity: 'CRITICAL', direction: 'TOP', partLocation: 'ZONE_C2', isCaptureRequired: true }],
    timestamp: '2026-05-04 09:27:30.999',
  },
  // 8: 정상 가동
  {
    machineStatus: 'RUN', visionResult: 'OK', severity: 'LOW',
    temperature: 40.1, vibrationX: 0.01, vibrationY: 0.02, illumination: 1245, humidity: 45.0,
    defectType: 'NONE', confidence: 0.96,
    statusInfos: [{ code: 'SV-PR-00', msg: 'Vision Inspection OK', severity: 'LOW',
      direction: 'TOP', partLocation: 'ZONE_ALL', isCaptureRequired: false }],
    timestamp: '2026-05-04 09:28:00.011',
  },
  // 9: NG - 오정렬 (MEDIUM)
  {
    machineStatus: 'ERROR', visionResult: 'NG', severity: 'MEDIUM',
    temperature: 43.5, vibrationX: 0.06, vibrationY: 0.07, illumination: 1080, humidity: 47.2,
    defectType: 'MISALIGNED', confidence: 0.78,
    statusInfos: [{ code: 'SV-PR-06', msg: '오정렬 감지 - 제품 탑재 방향·위치 어긋남 검출',
      severity: 'MEDIUM', direction: 'SIDE_RIGHT', partLocation: 'ZONE_D4',
      isCaptureRequired: true }],
    timestamp: '2026-05-04 09:29:15.333',
  },
];

const MODELS  = ['SMT_CHIP_A20', 'SMT_CHIP_B15', 'SMT_CHIP_C12', 'SMT_CHIP_D08', 'SMT_CHIP_E30'];
const BATCHES = ['BATCH_20260504_001', 'BATCH_20260504_002', 'BATCH_20260504_003'];

// ── 요약 더미 데이터 (index.tsx 목록용) ──────────
export const generateMockSummaries = (): DeviceSummary[] =>
  Array.from({ length: 25 }, (_, i) => {
    const sc = SCENARIOS[i % SCENARIOS.length];
    return {
      deviceId:      `RASP_PI_${String(i + 1).padStart(2, '0')}`,
      modelName:     MODELS[i % MODELS.length],
      machineStatus: sc.machineStatus,
      timestamp:     sc.timestamp,
      // 서버 추가 요청 중 필드
      visionResult:  sc.visionResult,
      severity:      sc.severity,
      lastSequence:  40 + i,
    };
  });

// ── 상세 더미 데이터 ([deviceId].tsx 상세용) ─────
export const generateMockDetails = (): DeviceDetail[] =>
  Array.from({ length: 25 }, (_, i) => {
    const sc = SCENARIOS[i % SCENARIOS.length];
    return {
      deviceId:      `RASP_PI_${String(i + 1).padStart(2, '0')}`,
      batchId:       BATCHES[i % BATCHES.length],
      modelName:     MODELS[i % MODELS.length],
      sequence:      40 + i,
      machineStatus: sc.machineStatus,
      temperature:   sc.temperature  + (i % 3) * 0.3,
      vibrationX:    sc.vibrationX   + (i % 4) * 0.005,
      vibrationY:    sc.vibrationY   + (i % 3) * 0.003,
      illumination:  sc.illumination - (i % 5) * 10,
      humidity:      sc.humidity     + (i % 4) * 0.5,
      timestamp:     sc.timestamp,
      statusInfos:   sc.statusInfos,
      visionResult: {
        result:         sc.visionResult,
        defectType:     sc.defectType,
        confidence:     sc.confidence,
        inspectionArea: sc.visionResult === 'NG'
          ? `ZONE_${String.fromCharCode(65 + (i % 4))}${i % 5 + 1}`
          : 'ALL',
        imageUrl: sc.visionResult === 'NG'
          ? `http://192.168.0.10/images/${40 + i}_ng_${sc.defectType.toLowerCase()}.jpg`
          : null,
      },
    };
  });
