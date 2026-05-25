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
