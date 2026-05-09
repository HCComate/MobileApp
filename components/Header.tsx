import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const menuGroups = [
    {
      title: "MONITORING",
      items: [{ id: "equip-main", label: "장비 목록", path: "/equipment" }],
    },
    {
      title: "LOGS",
      items: [
        { id: "log-all", label: "전체 로그", path: "/log/all" },
        { id: "log-event", label: "이벤트 로그", path: "/log/event" },
        { id: "log-error", label: "에러 로그", path: "/log/error" },
        { id: "log-device", label: "장비별 로그", path: "/log/device" },
        { id: "statesheet", label: "로그 식별표", path: "/log/statesheet" },
      ],
    },
    {
      title: "STATISTICS",
      items: [
        { id: "stat-daily", label: "일일 통계", path: "/statistics/daily" },
        { id: "stat-weekly", label: "주간 통계", path: "/statistics/weekly" },
        { id: "stat-monthly", label: "월간 통계", path: "/statistics/monthly" },
        { id: "stat-yearly", label: "연간 통계", path: "/statistics/yearly" },
      ],
    },
    {
      title: "NOTICE",
      items: [
        { id: "schedule", label: "근무표", path: "/schedule" },
        { id: "plan", label: "전체 일정", path: "/plan" },
        { id: "notice", label: "공지사항", path: "/notice" },
      ],
    },
    {
      title: "SETTING",
      items: [
        { id: "mypage", label: "마이페이지", path: "/mypage" },
        { id: "manage", label: "작업자 관리", path: "/management" },
      ],
    },
  ];

  const navigateTo = (path: string) => {
    setIsMenuOpen(false);
    router.push(path as any);
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
        <Ionicons name="menu" size={28} color={Colors.light.text} />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>VisionMate</Text>
      </View>

      <TouchableOpacity>
        <Ionicons
          name="help-circle-outline"
          size={26}
          color={Colors.light.text}
        />
      </TouchableOpacity>

      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.menuTitle}>MENU</Text>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.menuScrollView}
              showsVerticalScrollIndicator={false}
            >
              {menuGroups.map((group, idx) => (
                <View key={idx} style={styles.groupContainer}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  <View style={styles.itemWrapper}>
                    {group.items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => navigateTo(item.path)}
                      >
                        <Text style={styles.menuItemText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
              <View style={{ height: 60 }} />
            </ScrollView>
          </View>
          <Pressable
            style={styles.outsideClose}
            onPress={() => setIsMenuOpen(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logoImage: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EBF2FA",
  },
  logoText: {
    marginLeft: 6,
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flexDirection: "row",
  },
  drawerContainer: {
    width: SCREEN_WIDTH * 0.65,
    backgroundColor: "#FFFFFF",
    height: "100%",
    paddingTop: 50,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  outsideClose: { flex: 1 },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 2,
  },

  menuScrollView: { flex: 1, paddingHorizontal: 24 },
  groupContainer: { marginTop: 32 },
  groupTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 16,
    letterSpacing: 1.5,
  },
  itemWrapper: {
    borderLeftWidth: 1.5,
    borderLeftColor: "#f1f5f9",
    paddingLeft: 16,
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
  },
});
