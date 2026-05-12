import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

let currentNotificationId: string | null = null;

export async function ensureChannel() {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync("visionmate", {
      name: "visionMate",
      importance: Notifications.AndroidImportance.MAX,
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
      // Android 13+ 런타임 권한 요청
      try {
        await Notifications.requestPermissionsAsync();
      } catch (e) {}
      console.log(
        "[foregroundNotification] presenting persistent notification",
      );
      const id = await Notifications.presentNotificationAsync({
        title: "visionMate 실행중",
        body: "",
        data: { visionMate: true },
        android: {
          channelId: "visionmate",
          sticky: true,
          ongoing: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: false,
        },
      });
      currentNotificationId = id;
    }
  } catch (e) {
    console.warn("[foregroundNotification] show failed", e);
    // 실패 시 무시
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
    // 실패 시 무시
  }
}

export async function resetPersistentNotification() {
  currentNotificationId = null;
}

export function getCurrentNotificationId() {
  return currentNotificationId;
}
