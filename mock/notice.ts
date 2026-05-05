export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  important: boolean;
}

export const MOCK_NOTICES: Notice[] = [
  {
    id: "1",
    title: "설비 점검 안내 (5월 15일)",
    content:
      "5월 15일 오전 10시부터 12시까지 3호기 비전 검사 장비의 정기 점검이 예정되어 있습니다.",
    date: "2026-05-01",
    important: true,
  },
  {
    id: "2",
    title: "안전 보호구 착용 철저 권고",
    content:
      "최근 현장 내 안전사고 방지를 위해 작업 시 안전화 및 보호 장갑 착용을 반드시 준수해 주시기 바랍니다.",
    date: "2026-04-28",
    important: false,
  },
  {
    id: "3",
    title: "Vision Mate 앱 업데이트 안내",
    content:
      "실시간 모니터링 속도 개선을 위한 앱 업데이트가 완료되었습니다. 최신 버전을 확인해 주세요.",
    date: "2026-04-25",
    important: false,
  },
  {
    id: "4",
    title: "주말 비상 연락망 현행화 요청",
    content:
      "비상 상황 발생 시 빠른 대응을 위해 각 팀별 연락망 정보가 변경된 경우 금일 중으로 업데이트 바랍니다.",
    date: "2026-04-22",
    important: true,
  },
  {
    id: "5",
    title: "구내식당 이용 시간 변경 안내",
    content:
      "다음 주 월요일부터 현장 교대 근무 스케줄 조정에 따라 구내식당 이용 시간이 30분 연장됩니다.",
    date: "2026-04-20",
    important: false,
  },
];
