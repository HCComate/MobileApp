import { Colors } from "@/constants/Colors";
import { MENU_GROUPS } from "@/constants/GoTo";
import { PAGE_HELP_INFO } from "@/constants/HelpContent";
import { isServerMode } from "@/mock/userData";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
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
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentHelp = PAGE_HELP_INFO[pathname] || PAGE_HELP_INFO.default;

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

        {/* 서버 모드 표시 */}
        <View style={styles.modeBadge}>
          <View
            style={[
              styles.modeDot,
              { backgroundColor: isServerMode ? "#22C55E" : "#F59E0B" },
            ]}
          />
          <Text style={styles.modeText}>
            {isServerMode ? "서버" : "목업"}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => setIsHelpOpen(true)}>
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
              {MENU_GROUPS.map((group, idx) => (
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

      <Modal
        visible={isHelpOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsHelpOpen(false)}
      >
        <View style={styles.helpOverlay}>
          <View style={styles.helpContent}>
            <View style={styles.helpHeader}>
              <Ionicons
                name="information-circle"
                size={22}
                color={Colors.light.tint}
              />
              <Text style={styles.helpTitle}>{currentHelp.title}</Text>
            </View>
            <Text style={styles.helpDescription}>{currentHelp.desc}</Text>
            <TouchableOpacity
              style={styles.helpCloseButton}
              onPress={() => setIsHelpOpen(false)}
            >
              <Text style={styles.helpCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
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

  // 모드 표시 배지
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  modeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
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
  menuItem: { paddingVertical: 12 },
  menuItemText: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
  },
  helpOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  helpContent: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 10,
  },
  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginLeft: 8,
  },
  helpDescription: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  helpCloseButton: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  helpCloseText: {
    color: "#475569",
    fontWeight: "600",
  },
});
