import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { updateServerSettings } from "../mock/userData";
import { setCurrentUserId } from "../services/alertManager";
import { setCurrentLoginId } from "../mock/userData";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const ip = await AsyncStorage.getItem("serverIp");
        const port = await AsyncStorage.getItem("serverPort");

        const userId = await AsyncStorage.getItem("userId");
        if (token && ip && port) {
          const resolvedIp = (Platform.OS === "android" && ip === "localhost") ? "10.0.2.2" : ip;
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
      } catch (e) {
        router.replace("/login");
      }
    };

    const timer = setTimeout(checkAuthAndRedirect, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.subtitleText}>VisionMate</Text>
      </View>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.text} />
        <Text style={styles.loadingText}>Connecting...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    width: 200,
    height: 100,
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 16,
    color: "#888888",
    fontWeight: "500",
    letterSpacing: 1,
  },
  loadingContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
    fontWeight: "500",
  },
});
