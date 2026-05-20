// ─────────────────────────────────────────────
//  store/alertModalStore.ts
//  알람 팝업 전역 상태
//  알림 탭 → 앱 열림 → 팝업 표시를 위한 브릿지
// ─────────────────────────────────────────────

export interface AlertModalData {
  alertId: string;
  deviceId: string;
  errorCode: string;
  errorMsg: string;
  severity: string;
  timestamp: string;
}

type Listener = (data: AlertModalData | null) => void;

let _data: AlertModalData | null = null;
let _isActive: boolean = false;
let _listeners: Listener[] = [];

export const alertModalStore = {
  // 팝업 열기 (알림 탭 시 호출)
  show: (data: AlertModalData) => {
    _isActive = true;
    _data = data;
    _listeners.forEach((l) => l(_data));
  },

  // 팝업 닫기
  hide: () => {
    _isActive = false;
    _data = null;
    _listeners.forEach((l) => l(null));
  },

  // 현재 데이터 조회
  get: () => _data,
  isActive: () => _isActive,

  subscribe: (listener: Listener) => {
    _listeners.push(listener);
    if (_data) listener(_data);
    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
    };
  },
};
