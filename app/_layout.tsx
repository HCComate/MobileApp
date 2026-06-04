import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as NavigationBar from 'expo-navigation-bar'; // 1. 네비게이션 바 임포트 추가
import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { updateServerSettings } from "../mock/userData";

// Android 에뮬레이터에서 localhost → 10.0.2.2 로 자동 변환
function resolveIp(ip: string): string {
  if (Platform.OS === "android" && ip === "localhost") return "10.0.2.2";
  return ip;
}

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark"; // 다크모드 여부 변수화

  const theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: Colors[colorScheme].background,
      text: Colors[colorScheme].text,
    },
  };

  useEffect(() => {
    const initAppAndRestoreSettings = async () => {
      // 2. 안드로이드 하단 네비게이션 바 설정 추가
      if (Platform.OS === 'android') {
        try {
          // 하단바가 앱 콘텐츠를 가리지 않고 아래에 고정되도록 설정
          await NavigationBar.setPositionAsync('relative');
          // 테마(다크/라이트)에 맞춰 하단바 배경색 지정 (Colors 상수에 맞춰 변경 가능)
          await NavigationBar.setBackgroundColorAsync(isDark ? "#1e293b" : "#FFFFFF");
          // 하단바 버튼 아이콘 색상 최적화 (라이트 모드일 땐 아이콘을 어둡게)
          await NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
        } catch (nbError) {
          console.warn("[Layout] 네비게이션 바 설정 실패:", nbError);
        }
      }

      // 기존 서버 설정 복원 로직
      try {
        const rawIp = await AsyncStorage.getItem("serverIp");
        const port = await AsyncStorage.getItem("serverPort");
        const token = await AsyncStorage.getItem("userToken");
        if (rawIp && port && token) {
          const ip = resolveIp(rawIp);
          updateServerSettings(ip, port, true);
          console.log("[Layout] 서버 설정 복원 완료:", `http://${ip}:${port}`);
        }
      } catch (e) {
        console.warn("[Layout] 서버 설정 복원 실패:", e);
      }
    };

    initAppAndRestoreSettings();
  }, [isDark]); // 테마가 바뀔 때도 하단바 색상이 연동되도록 의존성 배열에 isDark 추가

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}