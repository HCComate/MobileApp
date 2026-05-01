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
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";

const { height } = Dimensions.get("window");

export default function LogMainMenu() {
  const router = useRouter();

  const LOG_MENUS = [
    { title: "전체 로그 보기", path: "/log/all" as Href },
    { title: "이벤트 로그 보기", path: "/log/event" as Href },
    { title: "오류 로그 보기", path: "/log/error" as Href },
    { title: "장비별 로그 보기", path: "/log/device" as Href },
    { title: "로그 식별표", path: "/log/statesheet" as Href },
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
          <Text style={styles.bannerText}>장비 로그 보기</Text>
        </View>

        <View style={styles.menuGrid}>
          {LOG_MENUS.map((menu, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuButton}
              onPress={() => router.push(menu.path)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuText}>{menu.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerInfo}>
          <View style={styles.divider} />
          <Text style={styles.versionText}>
            VisionMate v1.0.4 - Last Updated 17:44
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  container: { flex: 1 },
  contentContainer: {
    paddingBottom: 40,
    minHeight: height * 0.8,
  },
  titleBanner: {
    backgroundColor: "#1D1D5A",
    paddingVertical: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  bannerText: { fontSize: 22, fontWeight: "bold", color: "#FFFFFF" },
  menuGrid: { paddingHorizontal: 20, gap: 15 },
  menuButton: {
    backgroundColor: "#4A4A6A",
    paddingVertical: 22,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuText: { fontSize: 18, fontWeight: "600", color: "#FFFFFF" },

  footerInfo: {
    marginTop: 40,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D1D5A",
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: "#DDD",
    marginVertical: 15,
  },
  versionText: { fontSize: 12, color: "#AAA" },
});
