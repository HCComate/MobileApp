import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace({ pathname: "/login" });
    }, 5000);
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
