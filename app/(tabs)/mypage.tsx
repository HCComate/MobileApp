import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  CURRENT_LOGIN_ID,
  MOCK_USER_LIST,
  updateServerSettings,
} from "@/mock/userData";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
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

export default function MyPage() {
  const router = useRouter();

  const currentUser =
    MOCK_USER_LIST.find((user) => user.loginId === CURRENT_LOGIN_ID) ||
    MOCK_USER_LIST[0];

  const [isPushEnabled, setIsPushEnabled] = useState(currentUser.isPushEnabled);
  const [serverIp, setServerIp] = useState(currentUser.serverSettings.ip);
  const [port, setPort] = useState(currentUser.serverSettings.port);
  const [refreshInterval, setRefreshInterval] = useState(
    currentUser.serverSettings.interval,
  );

  const [userData] = useState({
    name: currentUser.name,
    id: currentUser.id,
    role: currentUser.role,
    expiryDate: currentUser.expiryDate,
  });

  const [connectionStatus, setConnectionStatus] = useState("연결 대기 중");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    const trimmedIp = serverIp.trim();
    const trimmedPort = port.trim();

    if (!trimmedIp || !trimmedPort) {
      Alert.alert("알림", "서버 IP와 포트 번호를 모두 입력해 주세요.");
      return;
    }

    setIsConnecting(true);
    setConnectionStatus("연결 중...");

    const targetUrl = `http://${trimmedIp}:${trimmedPort}`;

    try {
      // 스프링 부트 HealthController (/api/health) 호출 검증 (타임아웃 3초 세팅)
      const response = await axios.get(`${targetUrl}/api/health`, {
        timeout: 3000,
      });

      if (response.data && response.data.status === "OK") {
        setIsConnecting(false);
        setConnectionStatus("연결 완료");

        // 전역 모드 스위치를 true(실제 서버 모드)로 활성화
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

      // 연결 실패 시 mock 데이터 로직이 계속 유지되도록 안정 장치 처리
      updateServerSettings(trimmedIp, trimmedPort, false);
      Alert.alert(
        "연결 실패",
        "서버에 연결할 수 없습니다.\n\n[확인 사항]\n1. IP 주소 일치 여부\n2. 서버 실행 상태\n3. 방화벽 및 CORS 허용 여부",
      );
    }
  };

  const handleLogout = () => {
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      <Header />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 및 권한</Text>
          <View style={styles.accountBox}>
            <View>
              <Text style={styles.welcomeText}>안녕하세요,</Text>
              <Text style={styles.userName}>
                {userData.name}({userData.id}){" "}
                <Text style={styles.nim}>님!</Text>
              </Text>
              <Text style={styles.label}>권한</Text>
              <Text style={styles.value}>{userData.role}</Text>
              <Text style={styles.label}>만료일</Text>
              <Text style={styles.value}>{userData.expiryDate}</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>로그아웃</Text>
              <Ionicons name="exit-outline" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.itemTitle}>푸시 알림</Text>
            <Switch
              value={isPushEnabled}
              onValueChange={setIsPushEnabled}
              trackColor={{
                false: "#CBD5E1",
                true: "#3055C1",
              }}
            />
          </View>
          <Text style={styles.descriptionText}>
            해당 기능을 끄면 긴급 알람을 받을 수 없으므로 유의하십시오.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>네트워크</Text>
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

          <Text style={styles.inputLabel}>서버 IP</Text>
          <TextInput
            style={styles.input}
            value={serverIp}
            onChangeText={setServerIp}
            placeholder="192.168.0.1"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none" // 대문자 자동전환 방지
          />

          <Text style={styles.inputLabel}>포트 번호</Text>
          <TextInput
            style={styles.input}
            value={port}
            onChangeText={setPort}
            keyboardType="numeric"
            placeholder="8080"
            placeholderTextColor="#94A3B8"
          />
          <Text style={styles.inputLabel}>갱신 주기</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, styles.intervalInput]}
              value={refreshInterval}
              onChangeText={setRefreshInterval}
              keyboardType="numeric"
              placeholder="1000"
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.unitText}>ms</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.connectButton,
              isConnecting && styles.disabledButton,
            ]}
            onPress={handleConnect}
            activeOpacity={0.7}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.connectButtonText}>서버 연결 시도</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>운영</Text>
          <TouchableOpacity
            style={styles.rowBetween}
            onPress={() => router.push("/management")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>작업자 관리</Text>
              <Text style={styles.descriptionText}>
                소속 작업자의 권한 및 근태를 관리할 수 있습니다.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.background,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  accountBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 15,
    color: "#64748B",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3055C1",
    marginTop: 2,
    marginBottom: 10,
  },
  nim: {
    color: Colors.light.text,
    fontWeight: "400",
  },
  label: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: Colors.light.text,
    marginTop: 2,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A57373",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: "#FFF",
    marginRight: 5,
    fontSize: 13,
    fontWeight: "600",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  descriptionText: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 6,
    lineHeight: 18,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },
  inputLabel: {
    fontSize: 14,
    color: "#3055C1",
    marginTop: 18,
    marginBottom: 8,
    fontWeight: "700",
  },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#CBD5E1",
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: "transparent",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  intervalInput: {
    flex: 1,
  },
  unitText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: "600",
    marginLeft: 10,
    marginTop: 8,
  },
  connectButton: {
    backgroundColor: "#3055C1",
    marginTop: 36,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3055C1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
});
