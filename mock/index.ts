// ─────────────────────────────────────────────
//  mocks/index.ts
//  통합 export (mock/ 폴더 제거 후 이걸로 통일)
//
//  기존 import 경로 변경 안내:
//  - mock/devices  → mocks (generateMockSummaries 사용)
//  - mock/Logs     → mocks/rawLogs
//  - mock/workers  → mocks/workers
//  - mock/userData → mock/userData (변경 없음)
//  - mock/notice   → mock/notice   (변경 없음)
//  - mock/plan     → mock/plan     (변경 없음)
//  - mock/schedule → mock/schedule (workers import 경로 수정 필요)
// ─────────────────────────────────────────────

export * from "./alertMocks";
export * from "./deviceMocks";
export * from "./Logs";
export * from "./workers";

