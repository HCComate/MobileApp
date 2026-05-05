export interface Worker {
  id: string;
  name: string;
  status: string;
  image: string;
}

export const MOCK_WORKERS = [
  {
    id: "2111111",
    name: "한성",
    status: "근무 중",
    image: "https://via.placeholder.com/50",
  },
  {
    id: "2344751",
    name: "홍길동",
    status: "근무 중",
    image: "https://via.placeholder.com/50",
  },
  {
    id: "2744135",
    name: "김철수",
    status: "근무 중",
    image: "https://via.placeholder.com/50",
  },
  {
    id: "2844232",
    name: "박한수",
    status: "퇴근",
    image: "https://via.placeholder.com/50",
  },
  {
    id: "2744773",
    name: "최서울",
    status: "퇴근",
    image: "https://via.placeholder.com/50",
  },
];
