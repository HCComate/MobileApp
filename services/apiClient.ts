// services/apiClient.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { CURRENT_SERVER_URL } from "@/mock/userData";
import axios from "axios";

const apiClient = axios.create({
  baseURL: CURRENT_SERVER_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// 매 요청마다 최신 서버 URL + 토큰 자동 첨부
apiClient.interceptors.request.use(async (config) => {
  // 1. 최신 서버 URL 반영
  config.baseURL = CURRENT_SERVER_URL;

  // 2. 저장된 토큰 자동 첨부
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[apiClient] ✓ 토큰 첨부: ${config.url} (${token.substring(0, 20)}...)`);
    } else {
      console.warn(`[apiClient] ⚠️ 토큰 없음: ${config.url} (토큰이 저장되지 않았습니다)`);
    }
  } catch (e) {
    console.error("[apiClient] 토큰 로드 실패:", e);
  }

  return config;
});

// 401 응답 시 토큰 삭제 (자동 로그아웃)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error("[apiClient] 🔴 401 Unauthorized → 토큰 만료, 로그아웃 처리");
      await AsyncStorage.removeItem("userToken");
    }
    return Promise.reject(error);
  },
);

export default apiClient;
