// 더 이상 사용하지 않는 타이머 변수와 notifyErrorLog import는 제거했습니다.

console.log("[logListener] module loaded");

/**
 * 로그 리스너 서비스
 *
 * 현재 구조:
 * - Mock 데이터 환경: mock/logs.ts 내부에서 에러 발생 시 직접 handleAlertEvent를 호출합니다.
 * - 실제 서버 환경: 아래 startLogListener 내부의 주석된 WebSocket 로직을 통해 서버 이벤트를 수신합니다.
 */
export function startLogListener() {
  stopLogListener();

  console.log("[logListener] startLogListener called");
  console.log(
    "[logListener] 현재 실시간 로그 기반 알람 대기 중 (mock/logs.ts 연동)",
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TODO: 실제 서버 연동 시 아래 주석을 해제하고 구현하세요.
  // 이 부분이 서버로부터 "진짜 에러"를 받아 알람을 터뜨리는 입구가 됩니다.
  // ─────────────────────────────────────────────────────────────────────────────
  /*
  const socket = new WebSocket('ws://your-server-url/logs');
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // 서버에서 에러 로그가 날라왔을 때
    if (data.machine_status === 'ERROR') {
      const alertEvent: AlertEvent = {
        alertId: data.id,
        deviceId: data.device_id,
        errorCode: data.error_code,
        errorMsg: data.error_msg,
        severity: data.severity,
        timestamp: data.timestamp
      };
      
      // 알람 매니저에게 전달하여 에스컬레이션 시작
      handleAlertEvent(alertEvent, MOCK_WORKERS as any);
    }
  };
  
  socket.onclose = () => console.log("[logListener] 서버 연결 종료");
  */
}

export function stopLogListener() {
  // 현재는 Mock 기반이라 중단할 타이머나 소켓이 없지만,
  // 나중에 socket.close() 등을 여기서 처리합니다.
  console.log("[logListener] stopLogListener called");
}

export default { startLogListener, stopLogListener };
