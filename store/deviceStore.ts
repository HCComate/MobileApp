// ─────────────────────────────────────────────
//  store/deviceStore.ts
//  장비 목록 → 상세 화면 데이터 전달용 간단 저장소
//  (WebSocket 연동 전까지 목록에서 선택한 데이터를 보관)
// ─────────────────────────────────────────────

import { DeviceDetail, DeviceSummary } from "../types/equipment";

// 요약/상세를 분리하여 보관 (deviceId 키 사용)
const summaryMap = new Map<string, DeviceSummary>();
const detailMap = new Map<string, DeviceDetail>();

const idOf = (o: any) => o?.deviceId ?? o?.device_id ?? o?.id;

const normalize = (s: string | undefined) => (s ?? "").toString().trim();

const findKeyFlexible = (map: Map<string, any>, key?: string) => {
  if (!key) return undefined;
  const raw = normalize(key);
  if (map.has(raw)) return raw;
  // case-insensitive exact match
  const lower = raw.toLowerCase();
  for (const k of map.keys()) if (k.toLowerCase() === lower) return k;
  // suffix/prefix match (handles encoded/trimmed variants)
  for (const k of map.keys()) {
    const nk = k.toLowerCase();
    if (
      nk.endsWith(lower) ||
      nk.startsWith(lower) ||
      lower.endsWith(nk) ||
      lower.startsWith(nk)
    )
      return k;
  }
  return undefined;
};

export const deviceStore = {
  // 목록 전체 저장 (요약)
  setAll: (devices: DeviceSummary[]) => {
    summaryMap.clear();
    devices.forEach((d) => summaryMap.set(idOf(d), d));
    notifySubscribers();
  },

  // 상세 목록 일괄 저장
  setAllDetails: (details: DeviceDetail[]) => {
    detailMap.clear();
    details.forEach((d) => detailMap.set(idOf(d), d));
    notifySubscribers();
  },

  // 단일 요약 업데이트
  update: (device: DeviceSummary) => {
    summaryMap.set(idOf(device), device);
    notifySubscribers();
  },

  // 단일 상세 저장/업데이트
  setDetail: (detail: DeviceDetail) => {
    detailMap.set(idOf(detail), detail);
    notifySubscribers();
  },

  // 요약 조회
  get: (deviceId: string): DeviceSummary | undefined => {
    const k = findKeyFlexible(summaryMap, deviceId) ?? deviceId;
    const found = summaryMap.get(k);
    if (!found) {
      console.debug(
        `[deviceStore] summary not found for '${deviceId}' (resolved key: '${k}')`,
      );
    }
    return found;
  },

  // 상세 조회
  getDetail: (deviceId: string): DeviceDetail | undefined => {
    const k = findKeyFlexible(detailMap, deviceId) ?? deviceId;
    const found = detailMap.get(k);
    if (!found) {
      console.debug(
        `[deviceStore] detail not found for '${deviceId}' (resolved key: '${k}')`,
      );
    }
    return found;
  },
};

// ---- simple pub/sub so components can react to store changes ----
const subscribers = new Set<() => void>();
const notifySubscribers = () => {
  for (const s of Array.from(subscribers)) {
    try { s(); } catch (e) { console.error('[deviceStore] subscriber error', e); }
  }
};

export const subscribeToDeviceStore = (cb: () => void) => {
  subscribers.add(cb);
  return () => { subscribers.delete(cb); };
};
