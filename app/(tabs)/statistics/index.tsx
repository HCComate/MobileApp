import PageHeader from "@/components/PageHeader";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import Constants from "expo-constants";
import { Href, Stack, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

export default function StatisticsMainScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const currentTime = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const STAT_MENUS = [
    { title: "일일 통계 보기", path: "/statistics/daily" as Href },
    { title: "주간 통계 보기", path: "/statistics/weekly" as Href },
    { title: "월간 통계 보기", path: "/statistics/monthly" as Href },
    { title: "연간 통계 보기", path: "/statistics/yearly" as Href },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <PageHeader title="장비 검사 통계" showBack={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.menuGrid}>
          {STAT_MENUS.map((menu, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuButton,
                {
                  backgroundColor: theme === "dark" ? "#374151" : "#4A4A6A",
                },
              ]}
              onPress={() => router.push(menu.path)}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.arrowText, { opacity: 0 }]}>
                ›
              </ThemedText>

              <ThemedText style={styles.menuText}>{menu.title}</ThemedText>

              <ThemedText style={styles.arrowText}>›</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerInfo}>
          <View
            style={[styles.divider, { backgroundColor: Colors[theme].border }]}
          />

          <ThemedText style={styles.versionText}>
            VisionMate v{appVersion} - Last Updated: {currentTime}
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    paddingTop: 30,
    paddingBottom: 40,
    minHeight: height * 0.8,
  },

  menuGrid: {
    paddingHorizontal: 20,
    gap: 25,
  },

  menuButton: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    flex: 1,
    fontFamily: Fonts.sans,
  },
  arrowText: {
    fontSize: 24,
    color: "rgba(255, 255, 255, 0.4)",
    fontWeight: "300",
    width: 20,
  },
  footerInfo: {
    marginTop: 40,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  divider: {
    width: 40,
    height: 2,
    marginVertical: 15,
  },
  versionText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
    fontFamily: Fonts.sans,
  },
});
