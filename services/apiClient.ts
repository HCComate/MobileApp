// services/apiClient.ts

import { CURRENT_LOGIN_ID, MOCK_USER_LIST } from "@/mock/userData";
import axios from "axios";

/**
 * 현재 로그인한 사용자의 설정에서 서버 URL을 동적으로 가져옵니다.
 */
const getBaseUrl = () => {
  const user =
    MOCK_USER_LIST.find((u) => u.loginId === CURRENT_LOGIN_ID) ||
    MOCK_USER_LIST[0];
  return `http://${user.serverSettings.ip}:${user.serverSettings.port}`;
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 요청 인터셉터: 매 요청마다 최신 서버 URL을 반영합니다.
 * 사용자가 마이페이지에서 서버 주소를 바꿔도 앱 재시작 없이 즉시 적용됩니다.
 */
apiClient.interceptors.request.use((config) => {
  const latestBaseUrl = getBaseUrl();
  config.baseURL = latestBaseUrl;
  return config;
});

export default apiClient;
