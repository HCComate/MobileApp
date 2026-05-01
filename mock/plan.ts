export interface FactoryPlan {
  id: string;
  title: string;
  author: string;
  date: string;
  type: "meeting" | "deadline";
  priority: "high" | "medium" | "low";
}

export const MOCK_PLANS: FactoryPlan[] = [
  {
    id: "p1",
    title: "프로젝트 마감일 D-3",
    author: "작성자1",
    date: "2026-05-04",
    type: "deadline",
    priority: "high",
  },
  {
    id: "p2",
    title: "생산 B팀 긴급 미팅",
    author: "작성자2",
    date: "2026-05-01",
    type: "meeting",
    priority: "medium",
  },
  {
    id: "p3",
    title: "공정 최적화 전략 회의",
    author: "관리자",
    date: "2026-05-01",
    type: "meeting",
    priority: "low",
  },
  {
    id: "p4",
    title: "상반기 결산 마감일",
    author: "관리자",
    date: "2026-06-30",
    type: "deadline",
    priority: "high",
  },
  {
    id: "p5",
    title: "비전 센서 보정 회의",
    author: "기술팀",
    date: "2026-05-10",
    type: "meeting",
    priority: "medium",
  },
];
