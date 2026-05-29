import { NativeModules, Platform } from "react-native";
import {
    ensureChannel,
    hidePersistentNotification,
    showPersistentNotification,
} from "./foregroundNotification";

// JS 페이사드: 가능하면 네이티브 ForegroundService 모듈을 사용합니다 (APK / 커스텀 클라이언트용).
// Expo Go에서 실행되거나 네이티브 모듈이 없을 경우에는 `expo-notifications`를 통한
// 지속 알림(fallback)을 사용하여 사용자가 계속 알림을 볼 수 있게 합니다.

const NativeForeground = (NativeModules as any).ForegroundService || null;

function isRunningInExpoGo(): boolean {
  // 간단한 판별법: Expo Go는 보통 NativeModules에 `ExponentConstants`를 노출합니다.
  // 더 정확한 검사 필요 시 `expo-constants`의 `executionEnvironment`를 사용하세요.
  try {
    const ExponentConstants =
      (NativeModules as any).ExponentConstants ||
      (NativeModules as any).ExpoConstants;
    if (ExponentConstants && ExponentConstants.appOwnership) {
      // appOwnership: 'expo', 'standalone', 'guest'
      return (
        ExponentConstants.appOwnership === "expo" ||
        ExponentConstants.appOwnership === "guest"
      );
    }
  } catch (e) {}
  return false;
}

export async function startForegroundService(): Promise<void> {
  console.log("[foregroundService] startForegroundService called", {
    platform: Platform.OS,
  });
  // Android가 아니면 네이티브 포그라운드 서비스가 없으므로 알림(fallback)을 사용합니다.
  if (Platform.OS !== "android") {
    await ensureChannel();
    console.log("[foregroundService] not android, using fallback notification");
    return showPersistentNotification();
  }

  // Expo Go(개발 환경)에서 실행 중이면 네이티브 모듈이 없으므로 fallback을 사용합니다.
  if (isRunningInExpoGo()) {
    await ensureChannel();
    console.log(
      "[foregroundService] running in Expo Go, using fallback notification",
    );
    return showPersistentNotification();
  }

  // 스탠드얼론 APK 또는 커스텀 개발 클라이언트용 네이티브 모듈을 시도합니다.
  // 모듈이 없으면 아래의 fallback(알림)으로 전환합니다.
  try {
    if (NativeForeground && typeof NativeForeground.start === "function") {
      console.log("[foregroundService] calling native module start()");
      await NativeForeground.start();
      console.log("[foregroundService] native module start() returned");
      return;
    } else {
      console.log(
        "[foregroundService] native module not available, falling back",
      );
    }
  } catch (e) {
    console.warn("[foregroundService] native start() threw", e);
  }

  // expo-notifications 기반의 지속 알림(fallback)
  console.log("[foregroundService] using expo-notifications fallback");
  await ensureChannel();
  await showPersistentNotification();
}

export async function stopForegroundService(): Promise<void> {
  console.log("[foregroundService] stopForegroundService called", {
    platform: Platform.OS,
  });
  if (Platform.OS !== "android") {
    console.log("[foregroundService] not android, hide fallback");
    return hidePersistentNotification();
  }

  // Expo Go에서는 알림 dismiss를 사용
  if (isRunningInExpoGo()) {
    console.log("[foregroundService] running in Expo Go, hiding fallback");
    return hidePersistentNotification();
  }

  try {
    if (NativeForeground && typeof NativeForeground.stop === "function") {
      console.log("[foregroundService] calling native module stop()");
      await NativeForeground.stop();
      console.log("[foregroundService] native module stop() returned");
      return;
    }
  } catch (e) {}

  await hidePersistentNotification();
}

export default {
  start: startForegroundService,
  stop: stopForegroundService,
};

/*
  === APK / 네이티브 모듈 예제 (주석 참조용) ===

  스탠드얼론 APK(EAS/custom dev client) 빌드시 네이티브 Android ForegroundService 모듈을
  추가할 수 있습니다. 아래는 Android 프로젝트에 추가하여 React Native 모듈로 등록할 수
  있는 최소 예시입니다. AndroidManifest.xml과 Java/Kotlin 구현에 아래 내용을 포함하세요.

  -- AndroidManifest.xml (application 안에 추가) --
  <service android:name="com.yourapp.ForegroundService"
           android:exported="false"
           android:foregroundServiceType="location|dataSync" />

  -- Java 예시 --
  // ForegroundService.java
  package com.yourapp;

  import android.app.Notification;
  import android.app.NotificationChannel;
  import android.app.NotificationManager;
  import android.app.Service;
  import android.content.Intent;
  import android.os.Build;
  import android.os.IBinder;
  import androidx.annotation.Nullable;
  import androidx.core.app.NotificationCompat;

  public class ForegroundService extends Service {
    private static final String CHANNEL_ID = "visionmate";

    @Override
    public void onCreate() {
      super.onCreate();
      createChannel();
      Notification n = new NotificationCompat.Builder(this, CHANNEL_ID)
        .setContentTitle("visionMate 실행중")
        .setContentText("")
        .setSmallIcon(R.drawable.ic_notification)
        .setOngoing(true)
        .build();
      startForeground(1, n);
    }

    private void createChannel() {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        NotificationChannel chan = new NotificationChannel(CHANNEL_ID, "visionMate", NotificationManager.IMPORTANCE_LOW);
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (manager != null) manager.createNotificationChannel(chan);
      }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) { return null; }
  }

  -- React Native 모듈(Java) 예시 --
  // ForegroundServiceModule.java
  package com.yourapp;

  import com.facebook.react.bridge.ReactApplicationContext;
  import com.facebook.react.bridge.ReactContextBaseJavaModule;
  import com.facebook.react.bridge.ReactMethod;

  public class ForegroundServiceModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public ForegroundServiceModule(ReactApplicationContext ctx) {
      super(ctx);
      this.reactContext = ctx;
    }

    @Override
    public String getName() { return "ForegroundService"; }

    @ReactMethod
    public void start() {
      Intent intent = new Intent(reactContext, ForegroundService.class);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactContext.startForegroundService(intent);
      } else {
        reactContext.startService(intent);
      }
    }

    @ReactMethod
    public void stop() {
      Intent intent = new Intent(reactContext, ForegroundService.class);
      reactContext.stopService(intent);
    }
  }

  Java 모듈을 추가한 후 앱을 재빌드하세요 (EAS 또는 로컬 네이티브 빌드).
  위 JS 페이사드는 네이티브 모듈이 존재하면 `NativeModules.ForegroundService.start()`를 호출합니다.

*/
