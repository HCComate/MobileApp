// ─────────────────────────────────────────────
//  services/errorAlert.ts
//  오류 알림 전송
//
//  SDK 54 변경사항:
//  - content 안에 android: {} 중첩 객체 제거
//  - Android 설정은 채널에서 처리
// ─────────────────────────────────────────────

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { ensureChannel } from "./foregroundNotification";

export let lastError: { title: string; body: string; ts: string } | null = null;

export async function notifyErrorLog(title: string, body: string) {
  console.log("[errorAlert] notifyErrorLog called", { title, body });
  lastError = {
    title: title || "로그 오류",
    body: body || "",
    ts: new Date().toISOString(),
  };

  try {
    await Notifications.requestPermissionsAsync();
  } catch (e) {}

  try {
    if (Platform.OS === "android") await ensureChannel();

    // android: {} 중첩 객체 제거 → 채널 설정으로 대체
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: lastError.title,
        body: lastError.body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX, // 우선순위 최대로
      },
      trigger: {
        channelId: "visionmate-alert",
        seconds: 1,
      } as any,
    });

    console.log("✅ OS에 알림 발송 명령 완료! ID:", id);
  } catch (e) {
    console.error("[errorAlert] 푸시 발송 실패:", e);
  }
}

export default { notifyErrorLog };
