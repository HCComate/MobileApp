import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AlertModal from "../../components/AlertModal";
import {
  startForegroundService,
  stopForegroundService,
} from "../../services/foregroundService";
import { startLogListener, stopLogListener } from "../../services/logListener";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? "light";
  const isDark = theme === "dark";

  useEffect(() => {
    // 1. 알림 핸들러 설정
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const initService = async () => {
      try {
        // 2. 권한 요청 (안드로이드 13+ 필수)
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.warn("[TabLayout] 알림 권한이 거부되었습니다.");
          return;
        }

        // 3. 포그라운드 서비스 시작 (상시 알림 포함)
        console.log("[TabLayout] Starting services...");
        await startForegroundService();
        console.log("[TabLayout] startForegroundService succeeded");

        // 4. 로그 리스너 시작
        startLogListener();
      } catch (e) {
        console.warn("[TabLayout] Initialization failed", e);
      }
    };
    initService();
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("[notification] response received:", response);
        // response.actionIdentifier 또는 response.notification.request.content.data로
        // 네비게이션 여부를 판단하거나 무시하도록 처리할 수 있습니다. 개발 모드에서는
        // 알림 탭 시 앱이 포그라운드로 복귀하면서 다시 로드되는 경우가 있으니 추가 재로딩
        // 로직은 여기서 피하도록 설계하세요.
      });

    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          "[notification] received (display/foreground):",
          notification,
        );
      },
    );
    return () => {
      stopForegroundService().catch(() => {});
      responseListener.remove();
      receivedListener.remove();
      stopLogListener();
    };
  }, []);

  return (
    <>
      {/* <LastErrorBanner /> */}
      <Tabs
        screenOptions={{
          // 라이트 모드 시 기존 색상(tint) 유지, 다크 모드 시 흰색으로 고정
          tabBarActiveTintColor: isDark ? "#FFFFFF" : Colors.light.tint,
          tabBarInactiveTintColor: isDark ? "#FFFFFF" : Colors.light.tint,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? "#1e293b" : "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#334155" : "#F0F0F0",
            height: 60 + (insets.bottom > 0 ? insets.bottom : 15),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "홈",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="equipment/index"
          options={{
            title: "모니터링",
            tabBarIcon: ({ color }) => (
              <Ionicons name="stats-chart" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="log/index"
          options={{
            title: "로그",
            tabBarIcon: ({ color }) => (
              <Ionicons name="list" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mypage"
          options={{
            title: "마이페이지",
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-outline" size={26} color={color} />
            ),
          }}
        />
        {[
          "plan",
          "notice",
          "schedule",
          "log/all",
          "log/event",
          "log/error",
          "log/device",
          "log/statesheet",
          "log/detail",
          "equipment/[deviceId]",
          "statistics/index",
          "statistics/daily",
          "statistics/weekly",
          "statistics/monthly",
          "statistics/yearly",
        ].map((name) => (
          <Tabs.Screen key={name} name={name} options={{ href: null }} />
        ))}
      </Tabs>
      <AlertModal />
    </>
  );
}
