import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import Constants from "expo-constants";
import { Href, Stack, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

export default function StatisticsMainScreen() {
  // 라우터 설정
  const router = useRouter();
  // 앱 버전
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  // 현재 날짜와 시간
  const currentTime = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const STAT_MENUS = [
    { title: "일일 통계 보기", path: "/statistics/daily" as Href },
    { title: "주간 통계 보기", path: "/statistics/weekly" as Href },
    { title: "월간 통계 보기", path: "/statistics/monthly" as Href },
    { title: "연간 통계 보기", path: "/statistics/yearly" as Href },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.titleBanner}>
          <Text style={styles.bannerText}>장비 검사 통계</Text>
        </View>

        <View style={styles.menuGrid}>
          {STAT_MENUS.map((menu, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuButton}
              onPress={() => router.push(menu.path)}
              activeOpacity={0.7}
            >
              <Text style={[styles.arrowText, { opacity: 0 }]}>›</Text>
              <Text style={styles.menuText}>{menu.title}</Text>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerInfo}>
          <View style={styles.divider} />
          <Text style={styles.versionText}>
            VisionMate v{appVersion} - Last Updated: {currentTime}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: { flex: 1 },
  contentContainer: {
    paddingBottom: 40,
    minHeight: height * 0.8,
  },
  titleBanner: {
    backgroundColor: Colors.light.brandDark,
    paddingVertical: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: Fonts.sans,
  },
  menuGrid: { paddingHorizontal: 20, gap: 15 },
  menuButton: {
    backgroundColor: "#4A4A6A",
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    backgroundColor: "#DDD",
    marginVertical: 15,
  },
  versionText: {
    fontSize: 12,
    color: "#AAA",
    fontFamily: Fonts.sans,
  },
});
