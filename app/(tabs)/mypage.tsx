import Header from "@/components/Header";
import {
  CURRENT_LOGIN_ID,
  MOCK_USER_LIST,
  updateServerSettings,
} from "@/mock/userData";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPageScreen() {
  const router = useRouter();

  // 25번의 유저 데이터 로직 이식: 현재 로그인된 사용자 정보 로드
  const currentUser =
    MOCK_USER_LIST.find((user) => user.loginId === CURRENT_LOGIN_ID) ||
    MOCK_USER_LIST[0];

  const [isPushEnabled, setIsPushEnabled] = useState(currentUser.isPushEnabled);
  const [serverIp, setServerIp] = useState(currentUser.serverSettings.ip);
  const [serverPort, setServerPort] = useState(currentUser.serverSettings.port);
  const [refreshInterval, setRefreshInterval] = useState(
    currentUser.serverSettings.interval,
  );

  const [connectionStatus, setConnectionStatus] = useState("연결 대기 중");
  const [isConnecting, setIsConnecting] = useState(false);

  // 25번의 서버 연결 로직 이식: 백엔드 헬스체크 및 설정 반영
  const handleConnect = async () => {
    const trimmedIp = serverIp.trim();
    const trimmedPort = serverPort.trim();

    if (!trimmedIp || !trimmedPort) {
      Alert.alert("알림", "서버 IP와 포트 번호를 모두 입력해 주세요.");
      return;
    }

    setIsConnecting(true);
    setConnectionStatus("연결 중...");

    const targetUrl = `http://${trimmedIp}:${trimmedPort}`;

    try {
      const response = await axios.get(`${targetUrl}/api/health`, {
        timeout: 3000,
      });

      if (response.data && response.data.status === "OK") {
        setIsConnecting(false);
        setConnectionStatus("연결 완료");
        updateServerSettings(trimmedIp, trimmedPort, true);
        Alert.alert(
          "연결 성공",
          "Spring Boot 백엔드 서버와 정상적으로 통신이 연결되었습니다.",
        );
      } else {
        throw new Error("올바르지 않은 서버 응답 형식");
      }
    } catch (error) {
      console.error("[Health Check Error]:", error);
      setIsConnecting(false);
      setConnectionStatus("연결 실패");
      updateServerSettings(trimmedIp, trimmedPort, false);
      Alert.alert(
        "연결 실패",
        "서버에 연결할 수 없습니다.\n\n[확인 사항]\n1. IP 주소 일치 여부\n2. 서버 실행 상태\n3. 방화벽 및 CORS 허용 여부",
      );
    }
  };

  const handleSaveSettings = () => {
    Alert.alert("설정 저장", "서버 및 알림 설정이 로컬에 반영되었습니다.");
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

  const handleTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "테스트 알림 🔔",
        body: "알림이 정상적으로 작동하고 있습니다.",
        sound: "default",
      },
      trigger: null,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 사용자 정보 섹션 - 26번 UI 스타일 + 25번 실제 데이터 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account" size={60} color="#3055C1" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {currentUser.name} ({currentUser.id})
            </Text>
            <Text style={styles.userRole}>{currentUser.role}</Text>
            <Text style={styles.expiryDate}>
              만료일: {currentUser.expiryDate}
            </Text>
          </View>
        </View>

        {/* 서버 설정 섹션 */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>서버 설정</Text>
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    connectionStatus === "연결 완료"
                      ? "#3055C1"
                      : connectionStatus === "연결 실패"
                        ? "#E74C3C"
                        : "#E67E22",
                },
              ]}
            >
              {connectionStatus}
            </Text>
          </View>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>서버 IP 주소</Text>
              <TextInput
                style={styles.input}
                value={serverIp}
                onChangeText={setServerIp}
                placeholder="0.0.0.0"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>포트 번호</Text>
              <TextInput
                style={styles.input}
                value={serverPort}
                onChangeText={setServerPort}
                keyboardType="numeric"
                placeholder="8080"
              />
            </View>
            <TouchableOpacity
              style={[styles.testButton, isConnecting && styles.disabledButton]}
              onPress={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator size="small" color="#3055C1" />
              ) : (
                <Text style={styles.testButtonText}>연결 테스트 및 적용</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 알림 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 설정</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>푸시 알림</Text>
                <Text style={styles.settingDesc}>
                  장비 에러 발생 시 알림 수신
                </Text>
              </View>
              <Switch
                value={isPushEnabled}
                onValueChange={setIsPushEnabled}
                trackColor={{ false: "#CBD5E1", true: "#3055C1" }}
              />
            </View>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>갱신 주기 (ms)</Text>
                <Text style={styles.settingDesc}>데이터 폴링 간격 설정</Text>
              </View>
              <TextInput
                style={styles.smallInput}
                value={refreshInterval}
                onChangeText={setRefreshInterval}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestNotification}
            >
              <Text style={styles.testButtonText}>테스트 알림 보내기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 관리 메뉴 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>관리 메뉴</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/management")}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={24}
                color="#3055C1"
              />
              <Text style={styles.menuText}>작업자 관리</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CBD5E1"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="history"
                size={24}
                color="#3055C1"
              />
              <Text style={styles.menuText}>전체 알람 이력</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CBD5E1"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 하단 버튼 그룹 */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveSettings}
          >
            <Text style={styles.saveButtonText}>설정 저장</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>버전 1.0.2 (Build 20260520)</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
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
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#3055C1",
    fontWeight: "600",
    marginBottom: 2,
  },
  expiryDate: {
    fontSize: 12,
    color: "#64748B",
  },
  section: {
    padding: 15,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#1E293B",
  },
  smallInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 8,
    width: 80,
    textAlign: "center",
    fontSize: 15,
    color: "#1E293B",
  },
  testButton: {
    backgroundColor: "#F0F4FF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  testButtonText: {
    color: "#3055C1",
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
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
  settingLabel: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
  },
  settingDesc: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    marginLeft: 15,
    fontWeight: "500",
  },
  buttonGroup: {
    padding: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#3055C1",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3055C1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E74C3C",
  },
  logoutButtonText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: "#94A3B8",
  },
});
