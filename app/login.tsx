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
  CURRENT_SERVER_URL,
  isServerMode,
  MOCK_USER_LIST,
  setCurrentLoginId,
} from "../mock/userData";

export default function LoginScreen() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedId = id.trim();
    const trimmedPassword = password.trim();

    if (!trimmedId || !trimmedPassword) {
      Alert.alert("알림", "아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    // 서버 모드가 꺼져있을 때는 기존 로컬 목업 로직 작동!
    if (!isServerMode) {
      console.log("[Login] 로컬 목업 데이터로 가짜 로그인 시도");
      const matchedUser = MOCK_USER_LIST.find(
        (user) => user.loginId === trimmedId,
      );

      if (matchedUser && matchedUser.password === trimmedPassword) {
        setCurrentLoginId(trimmedId);
        router.replace("/(tabs)");
      } else {
        Alert.alert("로그인 실패", "아이디 또는 비밀번호가 올바르지 않습니다.");
      }
      return; // 목업 로그인 완료 시 함수 종료
    }

    // 마이페이지에서 서버 연결 성공 시 실제 Spring Boot 통신 작동
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${CURRENT_SERVER_URL}/api/auth/login`,
        {
          userId: trimmedId,
          password: trimmedPassword,
        },
      );

      // LoginResponse 스펙 매칭
      const { token, userId, name } = response.data;

      if (token) {
        setCurrentLoginId(userId);
        Alert.alert("로그인 성공", `${name}님, 환영합니다! (서버 연동 모드)`);
        router.replace("/(tabs)");
      } else {
        Alert.alert("로그인 실패", "서버 응답 형식이 올바르지 않습니다.");
      }
    } catch (error: any) {
      console.error("[Login Error]:", error);
      if (error.response) {
        Alert.alert(
          "로그인 실패",
          "서버에 등록되지 않은 아이디거나 비밀번호가 틀렸습니다.",
        );
      } else {
        Alert.alert(
          "네트워크 오류",
          "서버 연결에 실패했습니다. 마이페이지의 IP 설정을 다시 확인해 주세요.",
        );
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
    color: Colors.light.text,
    letterSpacing: 1,
  },
  formContainer: {
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
