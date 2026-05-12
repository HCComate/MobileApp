import { MOCK_WORKERS } from "../mock/workers";
import { AlertEvent } from "../types/alert";
import { handleAlertEvent } from "./alertManager";
import { notifyErrorLog } from "./errorAlert";

let _timer: ReturnType<typeof setTimeout> | null = null;

console.log("[logListener] module loaded");

/**
 * 간단한 로그 리스너 시작.
 * 현재 동작:
 *  - 시작 후 20초 뒤 테스트용 오류 로그를 시뮬레이션합니다.
 *  - WebSocket 또는 HTTP 롱폴링 구현을 위한 플레이스홀더입니다.
 */
export function startLogListener() {
  stopLogListener();

  console.log("[logListener] startLogListener called");

  // 예시: 20초 후 서버 푸시를 시뮬레이션
  _timer = setTimeout(async () => {
    const sample = {
      id: "sim-1",
      deviceId: "RASP_PI_03",
      level: "error",
      message: "샘플 오류: 공정 중 예외 발생",
      timestamp: new Date().toISOString(),
    };
    console.log("[logListener] simulated error log received", sample);
    try {
      await notifyErrorLog(
        `공정 오류 발생 - ${sample.deviceId}`,
        `${sample.message} (${sample.timestamp})`,
      );
      // AlertManager에 에러 이벤트로 전달하여 에스컬레이션을 시작
      const event: AlertEvent = {
        alertId: sample.id,
        deviceId: sample.deviceId,
        errorCode: "E_SIM",
        errorMsg: sample.message,
        severity: "HIGH",
        timestamp: sample.timestamp,
      };
      console.log("[logListener] forwarding to AlertManager", event);
      await handleAlertEvent(event, MOCK_WORKERS as any);
      console.log("[logListener] handleAlertEvent completed");
      console.log("[logListener] notifyErrorLog call finished");
    } catch (e) {
      console.warn("[logListener] notifyErrorLog failed", e);
    }
  }, 20000);

  // 실제 구현 예시(주석):
  // const ws = new WebSocket('ws://192.168.1.100:3000/logs');
  // ws.onmessage = (ev) => { const data = JSON.parse(ev.data); if (data.level === 'error') notifyErrorLog(...); };
  // stop 시 ws.close()를 호출하도록 ws를 저장하세요.
}

export function stopLogListener() {
  if (_timer) {
    clearTimeout(_timer);
    _timer = null;
    console.log("[logListener] stopLogListener called");
  }
}

export default { startLogListener, stopLogListener };
