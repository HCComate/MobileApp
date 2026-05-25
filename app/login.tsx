// app/login.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import {
  MOCK_USER_LIST,
  setCurrentLoginId,
  updateServerSettings,
} from "../mock/userData";

export default function LoginScreen() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [serverIp, setServerIp] = useState("10.30.5.94");
  const [serverPort, setServerPort] = useState("8080");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedId = id.trim();
    const trimmedPassword = password.trim();
    const trimmedIp = serverIp.trim();
    const trimmedPort = serverPort.trim();

    if (!trimmedId || !trimmedPassword) {
      Alert.alert("알림", "아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (!trimmedIp || !trimmedPort) {
      Alert.alert("알림", "서버 IP와 포트를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const baseUrl = `http://${trimmedIp}:${trimmedPort}`;
      const response = await axios.post(`${baseUrl}/api/auth/login`, {
        userId: trimmedId,
        password: trimmedPassword,
      });

      const loginData = response.data?.data ?? response.data;
const { token, userId, name } = loginData; 

      if (token) {
  await AsyncStorage.setItem("userToken", token);
  updateServerSettings(trimmedIp, trimmedPort, true);
  setCurrentLoginId(userId);
  Alert.alert("로그인 성공", `${name}님, 환영합니다!`);
  router.replace("/(tabs)");
} else {
  Alert.alert("로그인 실패", "서버 응답 형식이 올바르지 않습니다.");
}
    } catch (error: any) {
      console.error("[Login Error]:", error);

      if (error.response) {
        Alert.alert("로그인 실패", "아이디 또는 비밀번호가 올바르지 않습니다.");
      } else {
        console.log("[Login] 서버 연결 실패 → 목업 모드로 전환");
        updateServerSettings(trimmedIp, trimmedPort, false);

        const matchedUser = MOCK_USER_LIST.find(
          (user) => user.loginId === trimmedId,
        );
        if (matchedUser && matchedUser.password === trimmedPassword) {
          setCurrentLoginId(trimmedId);
          Alert.alert(
            "목업 로그인",
            `서버 연결 실패로 목업 모드로 로그인합니다.\n담당자: ${matchedUser.name}`,
          );
          router.replace("/(tabs)");
        } else {
          Alert.alert(
            "로그인 실패",
            "서버 연결에 실패했습니다.\n아이디 또는 비밀번호를 확인해주세요.",
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>비전메이트</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionLabel}>서버 설정</Text>
        <View style={styles.ipRow}>
          <TextInput
            style={[styles.input, { flex: 3, marginBottom: 0 }]}
            placeholder="서버 IP (예: 10.30.5.94)"
            value={serverIp}
            onChangeText={setServerIp}
            autoCapitalize="none"
            keyboardType="numeric"
            editable={!isLoading}
          />
          <Text style={styles.colon}>:</Text>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="포트"
            value={serverPort}
            onChangeText={setServerPort}
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>로그인</Text>
        <TextInput
          style={styles.input}
          placeholder="아이디"
          value={id}
          onChangeText={setId}
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />

        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? "로그인 중..." : "로그인"}
            onPress={handleLogin}
            color={Colors.light.text}
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 100,
    backgroundColor: Colors.light.background,
  },
  logoContainer: { alignItems: "center", marginBottom: 50 },
  logoImage: { width: 140, height: 140, marginBottom: 10 },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.light.text,
    letterSpacing: 1,
  },
  formContainer: { width: "100%" },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  ipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 0,
  },
  colon: { fontSize: 18, fontWeight: "700", color: "#334155" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  buttonContainer: { marginTop: 8 },
});
