export interface AlertModalData {
  alertId: string;
  deviceId: string;
  errorCode: string;
  errorMsg: string;
  severity: string;
  timestamp: string;
}

type Listener = (data: AlertModalData | null) => void;

let _queue: AlertModalData[] = []; // 알람을 담을 큐
let _listeners: Listener[] = [];

export const alertModalStore = {
  show: (data: AlertModalData) => {
    const isDuplicate = _queue.some((item) => item.alertId === data.alertId);
    if (isDuplicate) return;
    _queue.push(data);
    if (_queue.length === 1) {
      _listeners.forEach((l) => l(_queue[0]));
    }
  },

  hide: () => {
    if (_queue.length > 0) {
      _queue.shift();
    }
    const nextData = _queue.length > 0 ? _queue[0] : null;
    _listeners.forEach((l) => l(nextData));
  },

  // 특정 alertId 알람을 큐에서 제거한다(맨 앞이 아니어도 제거).
  // 서버가 다음 담당자로 에스컬레이션했거나 외부에서 해제됐을 때, 더 이상
  // 내 차례가 아닌 모달을 닫기 위해 사용한다.
  dismiss: (alertId: string) => {
    const before = _queue.length;
    _queue = _queue.filter((item) => item.alertId !== alertId);
    if (_queue.length !== before) {
      const nextData = _queue.length > 0 ? _queue[0] : null;
      _listeners.forEach((l) => l(nextData));
    }
  },

  get: () => (_queue.length > 0 ? _queue[0] : null),
  isActive: () => _queue.length > 0,

  // ⭐ 이 함수가 누락되면 오류가 발생합니다!
  getQueueLength: () => _queue.length,

  subscribe: (listener: Listener) => {
    _listeners.push(listener);
    listener(_queue.length > 0 ? _queue[0] : null);
    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
    };
  },
};
