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
  useColorScheme,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const currentHelp = PAGE_HELP_INFO[pathname] || PAGE_HELP_INFO.default;

  const navigateTo = (path: string) => {
    setIsMenuOpen(false);
    router.push(path as any);
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
        <Ionicons name="menu" size={28} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={[styles.logoImage, { borderColor: colors.border }]}
          resizeMode="contain"
        />
        <Text style={[styles.logoText, { color: colors.text }]}>
          VisionMate
        </Text>

        <View style={[styles.modeBadge, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.modeDot,
              { backgroundColor: isServerMode ? "#22C55E" : "#F59E0B" },
            ]}
          />
          <Text style={[styles.modeText, { color: colors.text }]}>
            {isServerMode ? "서버" : "목업"}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => setIsHelpOpen(true)}>
        <Ionicons name="help-circle-outline" size={26} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.drawerContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[
                styles.drawerHeader,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                MENU
              </Text>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.menuScrollView}
              showsVerticalScrollIndicator={false}
            >
              {MENU_GROUPS.map((group, idx) => (
                <View key={idx} style={styles.groupContainer}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  <View
                    style={[
                      styles.itemWrapper,
                      { borderLeftColor: colors.border },
                    ]}
                  >
                    {group.items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => navigateTo(item.path)}
                      >
                        <Text
                          style={[styles.menuItemText, { color: colors.text }]}
                        >
                          {item.label}
                        </Text>
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
          <View
            style={[styles.helpContent, { backgroundColor: colors.background }]}
          >
            <View style={styles.helpHeader}>
              <Ionicons
                name="information-circle"
                size={22}
                color={colors.tint}
              />
              <Text style={[styles.helpTitle, { color: colors.text }]}>
                {currentHelp.title}
              </Text>
            </View>
            <Text style={[styles.helpDescription, { color: colors.text }]}>
              {currentHelp.desc}
            </Text>
            <TouchableOpacity
              style={[
                styles.helpCloseButton,
                { backgroundColor: colors.border },
              ]}
              onPress={() => setIsHelpOpen(false)}
            >
              <Text style={[styles.helpCloseText, { color: colors.text }]}>
                닫기
              </Text>
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
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logoImage: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoText: {
    marginLeft: 6,
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  modeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  modeText: { fontSize: 10, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flexDirection: "row",
  },
  drawerContainer: {
    width: SCREEN_WIDTH * 0.65,
    height: "100%",
    paddingTop: 50,
  },
  outsideClose: { flex: 1 },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  menuTitle: { fontSize: 14, fontWeight: "800", letterSpacing: 2 },
  menuScrollView: { flex: 1, paddingHorizontal: 24 },
  groupContainer: { marginTop: 32 },
  groupTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 16,
    letterSpacing: 1.5,
  },
  itemWrapper: { borderLeftWidth: 1.5, paddingLeft: 16 },
  menuItem: { paddingVertical: 12 },
  menuItemText: { fontSize: 16, fontWeight: "500" },
  helpOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  helpContent: {
    width: "85%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  helpHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  helpTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  helpDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  helpCloseButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  helpCloseText: { fontWeight: "600" },
});
