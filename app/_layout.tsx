import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
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
  const colorScheme = useColorScheme();

  useEffect(() => {
    const restoreServerSettings = async () => {
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
    restoreServerSettings();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
