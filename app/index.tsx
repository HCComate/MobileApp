import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { setCurrentLoginId, updateServerSettings } from "../mock/userData";
import { setCurrentUserId } from "../services/alertManager";

export default function SplashScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const ip = await AsyncStorage.getItem("serverIp");
        const port = await AsyncStorage.getItem("serverPort");

        const userId = await AsyncStorage.getItem("userId");
        if (token && ip && port) {
          const resolvedIp =
            Platform.OS === "android" && ip === "localhost" ? "10.0.2.2" : ip;
          updateServerSettings(resolvedIp, port, true);
          if (userId) {
            setCurrentUserId(userId);
            setCurrentLoginId(userId);
            console.log("[Splash] 사용자 복원:", userId);
          }
          console.log("[Splash] 저장된 세션 복원 → 메인으로 이동");
          router.replace("/(tabs)");
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    };

    const timer = setTimeout(checkAuthAndRedirect, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}
    >
      <ThemedView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <ThemedText style={styles.subtitleText}>VisionMate</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[theme].text} />
          <ThemedText style={styles.loadingText}>Connecting...</ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  logoImage: {
    width: 280,
    height: 140,
    marginBottom: 20,
  },
  subtitleText: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  loadingContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    opacity: 0.7,
    fontWeight: "500",
  },
});
