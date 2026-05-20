import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import React, { useState } from "react";
import {
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
  const [serverIp, setServerIp] = useState("192.168.0.100");
  const [serverPort, setServerPort] = useState("8080");
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [alertInterval, setAlertInterval] = useState("10");

  const handleSaveSettings = () => {
    Alert.alert("설정 저장", "서버 설정이 저장되었습니다.");
  };

  const handleTestConnection = () => {
    Alert.alert("연결 테스트", "서버와 연결되었습니다.");
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "확인", onPress: () => console.log("Logout pressed") },
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 사용자 정보 섹션 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account" size={60} color="#666" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>관리자 (Admin)</Text>
            <Text style={styles.userRole}>최고 관리자</Text>
          </View>
        </View>

        {/* 서버 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>서버 설정</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>서버 IP 주소</Text>
              <TextInput
                style={styles.input}
                value={serverIp}
                onChangeText={setServerIp}
                placeholder="0.0.0.0"
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
              style={styles.testButton}
              onPress={handleTestConnection}
            >
              <Text style={styles.testButtonText}>연결 테스트</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 알림 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 설정</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>푸시 알림</Text>
                <Text style={styles.settingDesc}>
                  장비 에러 발생 시 알림 수신
                </Text>
              </View>
              <Switch
                value={isPushEnabled}
                onValueChange={setIsPushEnabled}
                trackColor={{ false: "#767577", true: "#007AFF" }}
              />
            </View>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>알림 간격 (초)</Text>
                <Text style={styles.settingDesc}>중복 알림 방지 시간 설정</Text>
              </View>
              <TextInput
                style={styles.smallInput}
                value={alertInterval}
                onChangeText={setAlertInterval}
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
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="account-group"
                size={24}
                color="#333"
              />
              <Text style={styles.menuText}>작업자 관리</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CCC"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="history" size={24} color="#333" />
              <Text style={styles.menuText}>전체 알람 이력</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CCC"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="cog" size={24} color="#333" />
              <Text style={styles.menuText}>앱 설정</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#CCC"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 버튼 그룹 */}
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
          <Text style={styles.versionText}>버전 1.0.0 (Build 20240320)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
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
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F0F0",
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
    color: "#333",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginLeft: 5,
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
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 5,
    width: 60,
    textAlign: "center",
    fontSize: 16,
  },
  testButton: {
    backgroundColor: "#F0F7FF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  testButtonText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  settingDesc: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  buttonGroup: {
    padding: 20,
    gap: 10,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  logoutButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: "#CCC",
  },
});
