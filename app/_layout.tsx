import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Font from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { updateServerSettings } from "../mock/userData";

SplashScreen.preventAutoHideAsync();

function resolveIp(ip: string): string {
  if (Platform.OS === "android" && (ip === "localhost" || ip === "127.0.0.1")) {
    return "10.30.13.247";
  }
  return ip;
}

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const [appIsReady, setAppIsReady] = useState(false);

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
      if (Platform.OS === "android") {
        try {
          await NavigationBar.setPositionAsync("relative");
          await NavigationBar.setBackgroundColorAsync(
            isDark ? "#1e293b" : "#FFFFFF",
          );
          await NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
        } catch (nbError) {
          console.warn("[Layout] 네비게이션 바 설정 실패:", nbError);
        }
      }

      try {
        await Font.loadAsync(Ionicons.font);

        const rawIp = await AsyncStorage.getItem("serverIp");
        const port = await AsyncStorage.getItem("serverPort");
        const token = await AsyncStorage.getItem("userToken");

        if (rawIp && port && token) {
          const ip = resolveIp(rawIp);
          updateServerSettings(ip, port, true);
          console.log("[Layout] 서버 설정 복원 완료:", `http://${ip}:${port}`);
        } else {
          updateServerSettings("10.30.13.247", "8080", true);
        }
      } catch (e) {
        console.warn("[Layout] 초기화 또는 서버 설정 복원 실패:", e);
        updateServerSettings("10.30.13.247", "8080", true);
      } finally {
        setAppIsReady(true);
      }
    };

    initAppAndRestoreSettings();
  }, [isDark]);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

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
