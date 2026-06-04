import { MachineStatus, Severity } from "../types/equipment";
import { Colors } from "./Colors";

export const STATUS_COLOR: Record<MachineStatus, string> = {
  RUN: "#22C55E",
  IDLE: "#64748B",
  ERROR: "#EF4444",
  STOP: "#F59E0B",
  STANDBY: "#3B82F6",
  LOCKED: "#7C3AED",
};

export const STATUS_LABEL: Record<MachineStatus, string> = {
  RUN: "가동 중",
  IDLE: "대기",
  ERROR: "오류 발생",
  STOP: "정지",
  STANDBY: "준비 중",
  LOCKED: "장비 잠금",
};

export const SEVERITY_COLOR: Record<Severity, string> = {
  LOW: "#22C55E",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#7C3AED",
};

export default {
  STATUS_COLOR,
  STATUS_LABEL,
  SEVERITY_COLOR,
};

// UI 테마 색상 집합 (컴포넌트에서 사용)
export const EQ_COLORS = {
  // 기본 배경/텍스트
  pageBg: Colors.light.background,
  // header는 브랜드 색상과 유사하므로 Colors에서 재사용
  headerBg: Colors.light.brandDark,
  // white는 Colors에서 재사용
  white: Colors.dark.tint,
  // textPrimary는 Colors.light.text와 유사하여 재사용
  textPrimary: Colors.light.text,
  textSecondary: "#64748B",
  // textMuted는 Colors.dark.icon과 유사하여 재사용
  textMuted: Colors.dark.icon,

  // 액션/토글
  actionBarBg: "#1E3A8A",
  // 버튼 기본 색상은 Colors의 탭 아이콘 색과 유사
  actionBtnBg: Colors.light.tabIconDefault,
  toggleActiveBg: "#60A5FA",

  // 카드/경계
  // cardBg는 Colors.light.background와 유사하여 재사용
  cardBg: Colors.light.background,
  cardNGBg: "#FFF5F5",
  // 카운트 바 배경 (목록 상단 요약 바)
  countBarBg: Colors.light.background,
  // border/divider는 Colors.light.border로 통일
  borderMuted: Colors.light.border,
  divider: Colors.light.border,

  // 상태 색
  // 상태 색은 STATUS_COLOR를 재사용
  okGreen: STATUS_COLOR.RUN,
  ngRed: STATUS_COLOR.ERROR,

  // 이미지/배너
  // 이미지 배경은 다크 모드 배경색 사용
  imageBg: Colors.dark.background,
  defectBannerBg: "#FEF2F2",
};
