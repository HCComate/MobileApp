// 작업자 CRUD는 여기서
export const WORKER_LIST = [
  { id: "2111111", name: "한성", role: "TECHNICIAN" },
  { id: "2344751", name: "홍길동", role: "TECHNICIAN" },
  { id: "2744135", name: "김철수", role: "OPERATOR" },
  { id: "2844232", name: "박한수", role: "OPERATOR" },
  { id: "2744773", name: "최서울", role: "OPERATOR" },
] as const;

export type UserRole = "MASTER" | "TECHNICIAN" | "OPERATOR";
