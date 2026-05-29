export interface WorkerSchedule {
  id: number;
  username: string;
  nickname: string;
  emp_id: string;
  role: string;
}

export interface ScheduleMap {
  [date: string]: WorkerSchedule[];
}

export const MOCK_SCHEDULES: ScheduleMap = {
  "2026-05-26": [
    {
      id: 1,
      username: "operator_01",
      nickname: "홍길동",
      emp_id: "EMP_001",
      role: "OPERATOR",
    },
    {
      id: 2,
      username: "operator_02",
      nickname: "김철수",
      emp_id: "EMP_002",
      role: "OPERATOR",
    },
    {
      id: 3,
      username: "technician_01",
      nickname: "이영희",
      emp_id: "EMP_003",
      role: "TECHNICIAN",
    },
  ],

  "2026-05-27": [
    {
      id: 4,
      username: "operator_03",
      nickname: "박민수",
      emp_id: "EMP_004",
      role: "OPERATOR",
    },
    {
      id: 5,
      username: "operator_04",
      nickname: "최지은",
      emp_id: "EMP_005",
      role: "OPERATOR",
    },
    {
      id: 6,
      username: "technician_02",
      nickname: "정우성",
      emp_id: "EMP_006",
      role: "TECHNICIAN",
    },
  ],

  "2026-05-28": [
    {
      id: 7,
      username: "operator_05",
      nickname: "한지민",
      emp_id: "EMP_007",
      role: "OPERATOR",
    },
    {
      id: 8,
      username: "operator_06",
      nickname: "유재석",
      emp_id: "EMP_008",
      role: "OPERATOR",
    },
    {
      id: 9,
      username: "master_01",
      nickname: "관리자",
      emp_id: "EMP_009",
      role: "MASTER",
    },
  ],

  "2026-05-29": [
    {
      id: 10,
      username: "operator_07",
      nickname: "강호동",
      emp_id: "EMP_010",
      role: "OPERATOR",
    },
    {
      id: 11,
      username: "technician_03",
      nickname: "신동엽",
      emp_id: "EMP_011",
      role: "TECHNICIAN",
    },
    {
      id: 12,
      username: "operator_08",
      nickname: "송지효",
      emp_id: "EMP_012",
      role: "OPERATOR",
    },
  ],

  "2026-05-30": [
    {
      id: 13,
      username: "operator_09",
      nickname: "차은우",
      emp_id: "EMP_013",
      role: "OPERATOR",
    },
    {
      id: 14,
      username: "operator_10",
      nickname: "안유진",
      emp_id: "EMP_014",
      role: "OPERATOR",
    },
    {
      id: 15,
      username: "technician_04",
      nickname: "장원영",
      emp_id: "EMP_015",
      role: "TECHNICIAN",
    },
  ],
};
