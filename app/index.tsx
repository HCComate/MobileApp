import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace({ pathname: "/login" });
    }, 5000);
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
