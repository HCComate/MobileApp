import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

let currentNotificationId: string | null = null;

export async function ensureChannel() {
  if (Platform.OS !== "android") return;
  try {
    // 상태바 유지용 채널 (LOW → 팝업 없이 상태바에만 표시)
    await Notifications.setNotificationChannelAsync("visionmate-persistent", {
      name: "VisionMate 실행 중",
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: undefined,
      sound: undefined,
      showBadge: false,
    });

    // 오류 알림용 채널 (HIGH → 팝업 표시)
    await Notifications.setNotificationChannelAsync("visionmate-alert", {
      name: "VisionMate 오류 알림",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    });
  } catch (e) {
    // 실패 시 무시
  }
}

export async function showPersistentNotification() {
  if (Platform.OS !== "android") return;
  try {
    if (!currentNotificationId) {
      await ensureChannel();
      try {
        await Notifications.requestPermissionsAsync();
      } catch (e) {}

      console.log(
        "[foregroundNotification] presenting persistent notification",
      );

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "VisionMate 실행 중",
          body: "공정 모니터링 중입니다. 탭하여 앱으로 이동",
          data: { visionMate: true },
          sticky: true,
        },
        trigger: null,
      });

      currentNotificationId = id;
    }
  } catch (e) {
    console.warn("[foregroundNotification] show failed", e);
  }
}

export async function hidePersistentNotification() {
  if (Platform.OS !== "android") return;
  try {
    if (currentNotificationId) {
      console.log(
        "[foregroundNotification] dismissing notification",
        currentNotificationId,
      );
      await Notifications.dismissNotificationAsync(currentNotificationId);
      currentNotificationId = null;
    }
  } catch (e) {
    console.warn("[foregroundNotification] dismiss failed", e);
  }
}

export async function resetPersistentNotification() {
  currentNotificationId = null;
}

export function getCurrentNotificationId() {
  return currentNotificationId;
}
