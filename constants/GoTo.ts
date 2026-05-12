export interface MenuItem {
  id: string;
  label: string;
  path: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    title: "MONITORING",
    items: [{ id: "equip-main", label: "장비 목록", path: "/equipment" }],
  },
  {
    title: "LOGS",
    items: [
      { id: "log-all", label: "전체 로그", path: "/log/all" },
      { id: "log-event", label: "이벤트 로그", path: "/log/event" },
      { id: "log-error", label: "에러 로그", path: "/log/error" },
      { id: "log-device", label: "장비별 로그", path: "/log/device" },
      { id: "statesheet", label: "로그 식별표", path: "/log/statesheet" },
    ],
  },
  {
    title: "STATISTICS",
    items: [
      { id: "stat-daily", label: "일일 통계", path: "/statistics/daily" },
      { id: "stat-weekly", label: "주간 통계", path: "/statistics/weekly" },
      { id: "stat-monthly", label: "월간 통계", path: "/statistics/monthly" },
      { id: "stat-yearly", label: "연간 통계", path: "/statistics/yearly" },
    ],
  },
  {
    title: "NOTICE",
    items: [
      { id: "schedule", label: "근무표", path: "/schedule" },
      { id: "plan", label: "전체 일정", path: "/plan" },
      { id: "notice", label: "공지사항", path: "/notice" },
    ],
  },
  {
    title: "SETTING",
    items: [
      { id: "mypage", label: "마이페이지", path: "/mypage" },
      { id: "manage", label: "작업자 관리", path: "/management" },
    ],
  },
];
