import Header from "@/components/Header";
import { MOCK_USER_DATA } from "@/mock/userData";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

  const [isPushEnabled, setIsPushEnabled] = useState(
    MOCK_USER_DATA.isPushEnabled,
  );
  const [serverIp, setServerIp] = useState(MOCK_USER_DATA.serverSettings.ip);
  const [port, setPort] = useState(MOCK_USER_DATA.serverSettings.port);
  const [refreshInterval, setRefreshInterval] = useState(
    MOCK_USER_DATA.serverSettings.interval,
  );

  const [userData] = useState({
    name: MOCK_USER_DATA.name,
    id: MOCK_USER_DATA.id,
    role: MOCK_USER_DATA.role,
    expiryDate: MOCK_USER_DATA.expiryDate,
  });

  const [connectionStatus, setConnectionStatus] = useState("연결 대기 중");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setConnectionStatus("연결 중...");

    setTimeout(() => {
      setIsConnecting(false);
      setConnectionStatus("연결 완료");
    }, 1500);
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
              <Text style={styles.value}>{userData.expiryDate}.</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton}>
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
              trackColor={{ false: "#767577", true: "#3055C1" }}
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
                    connectionStatus === "연결 완료" ? "#3055C1" : "#E67E22",
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
          />

          <Text style={styles.inputLabel}>포트 번호</Text>
          <TextInput
            style={styles.input}
            value={port}
            onChangeText={setPort}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>갱신 주기</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={refreshInterval}
              onChangeText={setRefreshInterval}
              keyboardType="numeric"
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
            <View>
              <Text style={styles.itemTitle}>작업자 관리</Text>
              <Text style={styles.descriptionText}>
                소속 작업자의 권한 및 근태를 관리할 수 있습니다.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 25 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1D1D5A",
    marginBottom: 15,
  },
  accountBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  welcomeText: { fontSize: 16, color: "#11181C" },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3055C1",
    marginVertical: 4,
  },
  nim: { color: "#11181C", fontWeight: "normal" },
  label: { fontSize: 13, color: "#999999", marginTop: 8 },
  value: { fontSize: 15, color: "#11181C", marginTop: 2 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A57373",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: { color: "#FFF", marginRight: 5, fontSize: 13 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#11181C" },
  descriptionText: {
    fontSize: 13,
    color: "#999999",
    marginTop: 6,
    lineHeight: 18,
  },
  statusText: { fontSize: 14, fontWeight: "bold" },
  inputLabel: {
    fontSize: 14,
    color: "#3055C1",
    marginTop: 15,
    marginBottom: 8,
    fontWeight: "700",
  },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#333",
    paddingVertical: 10,
    fontSize: 16,
    color: "#11181C",
    marginBottom: 5,
  },
  inputWrapper: { flexDirection: "row", alignItems: "center" },
  unitText: {
    fontSize: 16,
    color: "#11181C",
    fontWeight: "bold",
    marginLeft: 10,
  },
  connectButton: {
    backgroundColor: "#3055C1",
    marginTop: 35,
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1D1D5A",
  },
  disabledButton: { backgroundColor: "#A0A0A0" },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
});
