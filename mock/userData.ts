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

export const MOCK_USER_LIST: UserData[] = [
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

export let CURRENT_LOGIN_ID = "hansung1";

export function setCurrentLoginId(id: string) {
  CURRENT_LOGIN_ID = id;
}
