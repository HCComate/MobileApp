import { CURRENT_SERVER_URL } from "@/mock/userData";
import axios from "axios";

const api = axios.create({
  baseURL: CURRENT_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 매 요청마다 최신 서버 URL 반영
api.interceptors.request.use((config) => {
  config.baseURL = CURRENT_SERVER_URL;
  return config;
});

export default api;
