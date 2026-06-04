// app/login.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Button,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { Colors } from "../constants/Colors";
import {
  MOCK_USER_LIST,
  setCurrentLoginId,
  updateServerSettings,
} from "../mock/userData";
import { setCurrentUserId } from "../services/alertManager";

export default function LoginScreen() {
  const router = useRouter();

  const theme = useColorScheme() ?? "light";
  const isDark = theme === "dark";

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  // Android 에뮬레이터에서 호스트 PC는 10.0.2.2, iOS/Web은 localhost
  const [serverIp, setServerIp] = useState(
    Platform.OS === "android" ? "10.0.2.2" : "localhost",
  );
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
        username: trimmedId,
        password: trimmedPassword,
      });

      const loginData = response.data?.data ?? response.data;
      const token = loginData.token;
      const userId = loginData.user?.username ?? trimmedId;
      const name = loginData.user?.username || trimmedId;

      if (token) {
        await AsyncStorage.setItem("userToken", token);
        console.log(
          "[Login] ✓ 토큰 저장 완료:",
          token.substring(0, 30) + "...",
        );

        await AsyncStorage.setItem("serverIp", trimmedIp);
        await AsyncStorage.setItem("serverPort", trimmedPort);
        await AsyncStorage.setItem("userId", userId);
        console.log("[Login] ✓ 서버 설정 저장:", `${trimmedIp}:${trimmedPort}`);

        updateServerSettings(trimmedIp, trimmedPort, true);
        setCurrentLoginId(userId);
        setCurrentUserId(userId);
        Alert.alert("로그인 성공", `${name}님, 환영합니다!`);
        router.replace("/(tabs)");
      } else {
        console.error("[Login] ❌ 토큰 없음 - 서버 응답:", loginData);
        Alert.alert("로그인 실패", "서버 응답 형식이 올바르지 않습니다.");
      }
    } catch (error: any) {
      console.error("[Login Error]:", error);

      if (error.response) {
        if (error.response.status === 409) {
          Alert.alert(
            "로그인 실패",
            "이미 다른 기기에서 로그인 중인 아이디입니다.\n기존 기기에서 로그아웃 후 다시 시도해주세요.",
          );
        } else {
          Alert.alert(
            "로그인 실패",
            "아이디 또는 비밀번호가 올바르지 않습니다.",
          );
        }
      } else {
        console.log("[Login] 서버 연결 실패 → 목업 모드로 전환");
        updateServerSettings(trimmedIp, trimmedPort, false);

        const matchedUser = MOCK_USER_LIST.find(
          (user) => user.loginId === trimmedId,
        );

        if (matchedUser && matchedUser.password === trimmedPassword) {
          setCurrentLoginId(trimmedId);
          setCurrentUserId(matchedUser.id);
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
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: Colors[theme].text }]}>
          비전메이트
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text
          style={[
            styles.sectionLabel,
            { color: isDark ? "#94A3B8" : "#64748B" },
          ]}
        >
          서버 설정
        </Text>

        <View style={styles.ipRow}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 3,
                marginBottom: 0,
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor: isDark ? "#475569" : "#CCCCCC",
                color: Colors[theme].text,
              },
            ]}
            placeholder="서버 IP (예: localhost)"
            placeholderTextColor={isDark ? "#94A3B8" : "#9CA3AF"}
            value={serverIp}
            onChangeText={setServerIp}
            autoCapitalize="none"
            keyboardType="numeric"
            editable={!isLoading}
          />

          <Text
            style={[styles.colon, { color: isDark ? "#CBD5E1" : "#334155" }]}
          >
            :
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                marginBottom: 0,
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor: isDark ? "#475569" : "#CCCCCC",
                color: Colors[theme].text,
              },
            ]}
            placeholder="포트"
            placeholderTextColor={isDark ? "#94A3B8" : "#9CA3AF"}
            value={serverPort}
            onChangeText={setServerPort}
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>

        <Text
          style={[
            styles.sectionLabel,
            {
              marginTop: 20,
              color: isDark ? "#94A3B8" : "#64748B",
            },
          ]}
        >
          로그인
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderColor: isDark ? "#475569" : "#CCCCCC",
              color: Colors[theme].text,
            },
          ]}
          placeholder="아이디"
          placeholderTextColor={isDark ? "#94A3B8" : "#9CA3AF"}
          value={id}
          onChangeText={setId}
          autoCapitalize="none"
          editable={!isLoading}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderColor: isDark ? "#475569" : "#CCCCCC",
              color: Colors[theme].text,
            },
          ]}
          placeholder="비밀번호"
          placeholderTextColor={isDark ? "#94A3B8" : "#9CA3AF"}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />

        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? "로그인 중..." : "로그인"}
            onPress={handleLogin}
            color={Colors[theme].text}
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
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  formContainer: {
    width: "100%",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  ipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 0,
  },
  colon: {
    fontSize: 18,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
