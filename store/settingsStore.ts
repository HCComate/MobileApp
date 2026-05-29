import { useEffect, useState } from "react";

/**
 * 앱 설정을 관리하는 간단한 전역 스토어
 */
interface SettingsState {
  isPushEnabled: boolean;
}

let _state: SettingsState = {
  isPushEnabled: true, // 기본값 ON
};

type Listener = (state: SettingsState) => void;
let _listeners: Listener[] = [];

export const settingsStore = {
  get: () => _state,

  setPushEnabled: (enabled: boolean) => {
    _state = { ..._state, isPushEnabled: enabled };
    _listeners.forEach((l) => l(_state));
    console.log(`[Settings] 푸시 알림 설정 변경: ${enabled ? "ON" : "OFF"}`);
  },

  subscribe: (listener: Listener) => {
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
    };
  },
};

/**
 * React 컴포넌트에서 설정을 사용하기 위한 커스텀 훅
 */
export function useSettings() {
  const [state, setState] = useState(_state);

  useEffect(() => {
    return settingsStore.subscribe(setState);
  }, []);

  return state;
}
