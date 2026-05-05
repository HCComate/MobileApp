# Changes merged from `sihyung` into `seokjun`

This file summarizes what was added, modified, and removed when bringing in work from the
날짜: 2026-05-05

## 개요
- 목적: 장비 통계 및 상세 화면 추가, 목업 데이터·타입·간단한 스토어 도입
- 기준 비교: `origin/sihyung` → `HEAD (seokjun)`

## 추가된 항목
- `app/(tabs)/equipment/[deviceId].tsx` — 장비 상세 화면(Seq, 센서값, 비전 결과, 상태 목록 등)
- `app/(tabs)/equipment/index.tsx` — 장비 통계(목록/그리드) 화면

- `app/(tabs)/explore.tsx` — 탐색 화면
- `constants/equipmentConstants.ts` — 장비 관련 색상·레이블·상태 매핑(`EQ_COLORS`, `STATUS_COLOR`, `STATUS_LABEL` 등)
- `constants/theme.ts` — 테마 헬퍼 파일
- `mock/deviceMocks.ts` 및 `mocks/deviceMocks.ts` — 목업 데이터 생성기(요약/상세)
- `store/deviceStore.ts` — 목록과 상세 간 데이터 전달용 간단한 인메모리 스토어
- `types/equipment.ts` — `DeviceSummary`, `DeviceDetail`, `VisionResultData`, `StatusInfo` 등 타입 정의
## 수정된 항목
- `app.json`, `app/(tabs)/_layout.tsx`, `app/_layout.tsx`, `app/(tabs)/index.tsx` — 라우팅/레이아웃 관련 변경
- `hooks/use-theme-color.ts` — 테마 연동 관련 수정

- `package.json`, `package-lock.json` — 의존성/메타데이터 업데이트
- `constants/Colors.ts` — 색상 정의 변경/복원 (참고: `seokjun`에서 복원 커밋 진행)

## 삭제된 항목
- 여러 `app/(tabs)/log/*` 페이지 삭제(로그 하위 페이지들)
- 탭 페이지 일부 삭제 또는 재구성: `monitoring.tsx`, `mypage.tsx`, `notice.tsx`, `plan.tsx`, `schedule.tsx`, `statistics.tsx`

- 일부 컴포넌트 제거/이동: `components/CalendarView.tsx`, `DeviceIcon.tsx`, `Header.tsx`, `InfoBanner.tsx`, `MenuButtons.tsx`
- 여러 `mock/*` 파일 삭제(단순화/통합)

## 주의사항 및 권장 사항
- 현재 저장소에는 두 개의 목업 파일/폴더(`mock/deviceMocks.ts`, `mocks/deviceMocks.ts`)가 존재합니다. 애플리케이션은 현재 `mocks/deviceMocks.ts`를 import 하고 있습니다.
- 목업 시나리오의 단일화가 필요하면 파일을 통합하고 import 경로를 정리하세요.

- 상세 페이지의 필드가 런타임에 갱신되지 않는 경우 다음을 확인하세요:
  1. `deviceStore`에 저장된 키와 라우트의 `deviceId`가 일치하는지
  2. 상세 데이터가 네비게이션 이전에 스토어에 기록되는지
  3. 상세 화면이 스토어 업데이트를 구독하지 않고 초기값만 사용하고 있지 않은지
- `constants/Colors.ts`는 로컬에서 복원되어 `origin/seokjun`에 커밋(커밋 ID: `03435be`, 메시지: `chore: restore constants/Colors.ts`)되었습니다.

## Git / 브랜치 정보
- 기록 시점의 현재 브랜치: `seokjun` (HEAD)
- 비교를 위해 원격 `origin/sihyung`을 가져왔음

- 수행된 푸시: `constants/Colors.ts` 복원 커밋을 `origin/seokjun`으로 푸시함 (커밋 `03435be`)

---
원하시면 이 변경 로그를 다른 경로로 저장하거나(PR 생성 등) 추가로 `mock`/`mocks` 통합 작업을 진행해 드리겠습니다.

# Changes merged from `sihyung` into `seokjun`

This file summarizes what was added, modified, and removed when bringing in work from the
`sihyung` branch into the current `seokjun` branch.

Date: 2026-05-05

## Overview

- Purpose: Add equipment statistics and detail screens, mock data, types, and a simple store.
- Branches: compared `origin/sihyung` -> `HEAD (seokjun)` at time of collection.

## Added

- `app/(tabs)/equipment/[deviceId].tsx` — Device detail screen (sequence, sensor values, vision result, status list).
- `app/(tabs)/equipment/index.tsx` — Equipment statistics (list/grid) screen.
- `app/(tabs)/explore.tsx` — Explore screen.
- `constants/equipmentConstants.ts` — Equipment-specific colors, labels, status maps (`EQ_COLORS`, `STATUS_COLOR`, `STATUS_LABEL`, etc.).
- `constants/theme.ts` — Theme helper file.
- `mock/deviceMocks.ts` and `mocks/deviceMocks.ts` — Mock data generators (summaries and detailed device data).
- `store/deviceStore.ts` — Lightweight in-memory store to pass summary/detail between list and detail screens.
- `types/equipment.ts` — Type definitions for `DeviceSummary`, `DeviceDetail`, `VisionResultData`, `StatusInfo`, etc.

## Modified

- `app.json`, `app/(tabs)/_layout.tsx`, `app/_layout.tsx`, `app/(tabs)/index.tsx` — routing/layout adjustments.
- `hooks/use-theme-color.ts` — theme hookup changes.
- `package.json` and `package-lock.json` — dependency/metadata updates.
- `constants/Colors.ts` — color definitions were changed/updated; note: `constants/Colors.ts` was restored on `seokjun`.

## Deleted / Removed

- Several `app/(tabs)/log/*` pages were removed (log subpages).
- Multiple tab pages removed or restructured: `monitoring.tsx`, `mypage.tsx`, `notice.tsx`, `plan.tsx`, `schedule.tsx`, `statistics.tsx`.
- Several components removed/moved: `components/CalendarView.tsx`, `DeviceIcon.tsx`, `Header.tsx`, `InfoBanner.tsx`, `MenuButtons.tsx`.
- Several `mock/*` files were removed (simplified/merged into new mock files).

## Notes & Recommendations

- The repository now contains two mock directories/files: `mock/deviceMocks.ts` and `mocks/deviceMocks.ts` — the application code currently imports from `mocks/deviceMocks.ts`.
- If you want a single source of truth for mock scenarios, consolidate the files and update imports accordingly.
- If device detail fields do not update at runtime, check for:
  1. `deviceStore` key mismatch vs route `deviceId`,
  2. detail not being written to the store before navigation,
  3. detail screen only reading initial value and not reacting to store updates.
- `constants/Colors.ts` was restored locally and pushed to `origin/seokjun` with commit `03435be` (message: `chore: restore constants/Colors.ts`).

## Git / Branch info

- Current branch when recorded: `seokjun` (HEAD)
- Fetched remote branch `origin/sihyung` for comparison.
- Push performed: restored `constants/Colors.ts` and pushed to `origin/seokjun` (commit `03435be`).

---

If you want, I can commit this changelog into a different path or open a PR including these notes. Tell me where to place it or if you'd like a PR created.
