// ─────────────────────────────────────────────
//  types/equipment.ts
//  장비 모니터링 공통 타입 정의
//
//  ✅ 서버 DTO 기준으로 camelCase 통일
//     MobileServer dto 파일 참조:
//     - DeviceListResponse.java
//     - DeviceDetailResponse.java
//     - StatusInfoResponse.java
//     - VisionResultResponse.java
// ─────────────────────────────────────────────

export type MachineStatus = 'IDLE' | 'RUN' | 'ERROR' | 'STOP';
export type VisionResult  = 'OK'   | 'NG';
export type Severity      = 'LOW'  | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Direction     = 'TOP'  | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'FRONT' | 'BACK';

// ── StatusInfoResponse.java 대응 ──────────────
export interface StatusInfo {
  code:              string;
  msg:               string;
  severity:          Severity;
  direction:         Direction;
  partLocation:      string;     // 구: part_location
  isCaptureRequired: boolean;    // 구: is_capture_required
}

// ── VisionResultResponse.java 대응 ───────────
export interface VisionResultData {
  result:         VisionResult;
  defectType:     string;        // 구: defect_type
  confidence:     number;        // 0.0 ~ 1.0
  inspectionArea: string;        // 구: inspection_area
  imageUrl:       string | null; // 구: image_url
}

// ── DeviceListResponse.java 대응 (목록용 요약) ──
// ※ visionResult / severity / lastSequence 는
//   현재 서버 응답에 없음 → 서버 팀에 추가 요청 필요
//   추가되기 전까지 optional 처리
export interface DeviceSummary {
  deviceId:       string;        // 구: device_id
  modelName:      string;        // 구: model_name
  machineStatus:  MachineStatus; // 구: machine_status
  timestamp:      string;
  // 서버에 추가 요청 중인 필드 (optional)
  visionResult?:  VisionResult;  // 구: vision_result
  severity?:      Severity;
  lastSequence?:  number;        // 구: last_sequence
}

// ── DeviceDetailResponse.java 대응 (상세용) ───
// ※ 서버가 센서 데이터를 별도 객체 없이
//   DeviceDetail 안에 flat하게 포함
export interface DeviceDetail {
  deviceId:      string;         // 구: device_id
  batchId:       string;         // 구: batch_id
  modelName:     string;         // 구: model_name
  sequence:      number;
  machineStatus: MachineStatus;  // 구: machine_status
  temperature:   number;
  vibrationX:    number;         // 구: vibration_x
  vibrationY:    number;         // 구: vibration_y
  illumination:  number;
  humidity:      number;         // 서버에 있었으나 우리 타입에 없던 필드 → 추가
  timestamp:     string;
  statusInfos:   StatusInfo[];   // 구: status_info
  visionResult:  VisionResultData;
}
