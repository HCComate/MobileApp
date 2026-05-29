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
    }
  } catch (e) {
    console.warn("[apiClient] 토큰 로드 실패:", e);
  }

  return config;
});

// 401 응답 시 토큰 삭제 (자동 로그아웃)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("[apiClient] 401 → 토큰 만료, 로그아웃 처리");
      await AsyncStorage.removeItem("userToken");
    }
    return Promise.reject(error);
  },
);

export default apiClient;
