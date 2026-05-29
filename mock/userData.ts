export type UserRole = "MASTER" | "TECHNICIAN" | "OPERATOR";

export interface UserData {
  loginId: string;
  password: string;
  name: string;
  id: string;
  role: string;
  expiryDate: string;
  isPushEnabled: boolean;
  serverSettings: {
    ip: string;
    port: string;
    interval: string;
  };
}
/*
export const MOCK_USER_LIST: UserData[] = [
  // 실제 서버(DataInitializer) 테스트 계정 싱크를 위해 추가
  {
    loginId: "admin",
    password: "1234",
    name: "관리자",
    id: "ADMIN_M",
    role: "MASTER",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "172.30.1.36", port: "8080", interval: "3000" },
  },
  {
    loginId: "user01",
    password: "1234",
    name: "김가현",
    id: "USER_01",
    role: "TECHNICIAN",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "172.30.1.36", port: "8080", interval: "3000" },
  },
  {
    loginId: "hansung1",
    password: "1234",
    name: "한성",
    id: "2111111",
    role: "TECHNICIAN",
    expiryDate: "2026.07.16",
    isPushEnabled: true,
    serverSettings: { ip: "192.168.0.1", port: "8080", interval: "3000" },
  },
  {
    loginId: "hansung2",
    password: "1234",
    name: "홍길동",
    id: "2344751",
    role: "TECHNICIAN",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "192.168.0.1", port: "8080", interval: "3000" },
  },
  {
    loginId: "hansung3",
    password: "1234",
    name: "김철수",
    id: "2744135",
    role: "OPERATOR",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "192.168.0.1", port: "8080", interval: "3000" },
  },
  {
    loginId: "hansung4",
    password: "1234",
    name: "박한수",
    id: "2844232",
    role: "OPERATOR",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "192.168.0.1", port: "8080", interval: "3000" },
  },
  {
    loginId: "hansung5",
    password: "1234",
    name: "최서울",
    id: "2744773",
    role: "OPERATOR",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "192.168.0.1", port: "8080", interval: "3000" },
  },
];
*/

export const MOCK_USER_LIST: UserData[] = [
  // 실제 서버(DataInitializer) 테스트 계정 싱크를 위해 추가
  {
    loginId: "admin",
    password: "1234",
    name: "관리자",
    id: "ADMIN_M",
    role: "MASTER",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "localhost", port: "5000", interval: "3000" },
  },
  {
    loginId: "user01",
    password: "1234",
    name: "김가현",
    id: "USER_01",
    role: "TECHNICIAN",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "localhost", port: "5000", interval: "3000" },
  },
  {
    loginId: "hansung1",
    password: "1234",
    name: "한성",
    id: "2111111",
    role: "TECHNICIAN",
    expiryDate: "2026.07.16",
    isPushEnabled: true,
    serverSettings: { ip: "10.30.5.94", port: "8080", interval: "3000" },
  },
  {
    loginId: "hansung2",
    password: "1234",
    name: "홍길동",
    id: "2344751",
    role: "TECHNICIAN",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "localhost", port: "5000", interval: "3000" },
  },
  {
    loginId: "hansung3",
    password: "1234",
    name: "김철수",
    id: "2744135",
    role: "OPERATOR",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "localhost", port: "5000", interval: "3000" },
  },
  {
    loginId: "hansung4",
    password: "1234",
    name: "박한수",
    id: "2844232",
    role: "OPERATOR",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "localhost", port: "5000", interval: "3000" },
  },
  {
    loginId: "hansung5",
    password: "1234",
    name: "최서울",
    id: "2744773",
    role: "OPERATOR",
    expiryDate: "2026.12.31",
    isPushEnabled: true,
    serverSettings: { ip: "localhost", port: "5000", interval: "3000" },
  },
];

export let CURRENT_LOGIN_ID = "hansung1";

export function setCurrentLoginId(id: string) {
  CURRENT_LOGIN_ID = id;
}

// 현재 앱의 통신 모드 상태 관리 (기본값은 false = mock 모드)
export let isServerMode = true;
export let CURRENT_SERVER_URL = "http://localhost:5000";
export const updateServerSettings = (
  ip: string,
  port: string,
  success: boolean,
) => {
  isServerMode = success;
  if (success) {
    CURRENT_SERVER_URL = `http://${ip.trim()}:${port.trim()}`;
    console.log("[Network] 실제 서버 모드 활성화:", CURRENT_SERVER_URL);
  } else {
    console.log("[Network] 목업(가짜 데이터) 모드 유지");
  }
};
