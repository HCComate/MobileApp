import Header from "@/components/Header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/Colors";
import { getWorkerImage } from "@/constants/image";
import { CURRENT_LOGIN_ID, MOCK_USER_LIST } from "@/mock/userData";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPageScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";

  const currentUser =
    MOCK_USER_LIST.find((user) => user.loginId === CURRENT_LOGIN_ID) ||
    MOCK_USER_LIST[0];

  const [isPushEnabled, setIsPushEnabled] = useState(currentUser.isPushEnabled);

  const [serverIp, setServerIp] = useState("");
  const [serverPort, setServerPort] = useState("");

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const currentTime = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const savedIp = await AsyncStorage.getItem("serverIp");
      const savedPort = await AsyncStorage.getItem("serverPort");
      setServerIp(savedIp || currentUser.serverSettings.ip);
      setServerPort(savedPort || currentUser.serverSettings.port);
    };
    loadSettings();
  }, [currentUser.serverSettings.ip, currentUser.serverSettings.port]);

  const handleSaveSettings = () => {
    Alert.alert("설정 저장", "알림 설정이 로컬에 반영되었습니다.");
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: () => {
          console.log("Logout pressed");
          router.replace("/login");
        },
      },
    ]);
  };

  const imageSource = getWorkerImage(currentUser.loginId);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      edges={["top", "right", "left"]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.profileSection}>
          <View style={[styles.avatarContainer, { overflow: "hidden" }]}>
            {imageSource ? (
              <Image source={imageSource} style={{ width: 80, height: 80 }} />
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={60}
                color="#3055C1"
                onPress={() => {}}
              />
            )}
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.userName}>
              {currentUser.name} ({currentUser.id})
            </ThemedText>
            <ThemedText style={styles.userRole}>{currentUser.role}</ThemedText>
            <ThemedText style={styles.expiryDate}>
              만료일: {currentUser.expiryDate}
            </ThemedText>
          </View>
        </ThemedView>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>서버 설정</ThemedText>
          <ThemedView
            style={[styles.card, { borderColor: Colors[theme].border }]}
          >
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>서버 IP 주소</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[theme].background,
                    color: Colors[theme].text,
                  },
                ]}
                value={serverIp}
                editable={false}
              />
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>포트 번호</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[theme].background,
                    color: Colors[theme].text,
                  },
                ]}
                value={serverPort}
                editable={false}
              />
            </View>
          </ThemedView>
        </View>
{/*
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>알림 설정</ThemedText>
          <ThemedView
            style={[styles.card, { borderColor: Colors[theme].border }]}
          >
            // 푸시 알림 토글 — 추후 구현 예정
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.settingLabel}>푸시 알림</ThemedText>
                <ThemedText style={styles.settingDesc}>
                  장비 에러 발생 시 알림 수신
                </ThemedText>
              </View>
              <Switch
                value={isPushEnabled}
                onValueChange={setIsPushEnabled}
                trackColor={{ false: "#CBD5E1", true: "#3055C1" }}
              />
            </View>
            
          </ThemedView>
        </View>
*/}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>메뉴</ThemedText>
          <ThemedView
            style={[styles.card, { borderColor: Colors[theme].border }]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/management")}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={24}
                color="#3055C1"
              />
              <ThemedText style={styles.menuText}>작업자 관리</ThemedText>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CBD5E1"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/alarm-history" as Href)}
            >
              <MaterialCommunityIcons
                name="history"
                size={24}
                color="#3055C1"
              />
              <ThemedText style={styles.menuText}>전체 알람 이력</ThemedText>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CBD5E1"
              />
            </TouchableOpacity>
          </ThemedView>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveSettings}
          >
            <ThemedText style={styles.saveButtonText}>설정 저장</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutButtonText}>로그아웃</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.versionText}>
            VisionMate v{appVersion} - Last Updated: {currentTime}
          </ThemedText>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  profileInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  userRole: {
    fontSize: 14,
    color: "#3055C1",
    fontWeight: "600",
    marginBottom: 2,
  },
  expiryDate: { fontSize: 12, color: "#64748B" },
  section: { padding: 15 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  card: { borderRadius: 12, padding: 15, borderWidth: 1 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: "#64748B", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 10,
  },
  settingLabel: { fontSize: 16, fontWeight: "600" },
  settingDesc: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuText: { flex: 1, fontSize: 16, marginLeft: 15, fontWeight: "500" },
  buttonGroup: { padding: 20, gap: 12 },
  saveButton: {
    backgroundColor: "#3055C1",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  logoutButton: {
    backgroundColor: "transparent",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E74C3C",
  },
  logoutButtonText: { color: "#E74C3C", fontSize: 16, fontWeight: "bold" },
  footer: { padding: 20, alignItems: "center", marginBottom: 10 },
  versionText: { fontSize: 12, color: "#94A3B8" },
});
