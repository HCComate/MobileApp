import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";
import { mapToDeviceDetail } from "./dtoMapper";
import { deviceStore } from "../store/deviceStore";

const STATS_TTL_MS = 60 * 60 * 1000; // 1시간

export type StatsPeriod = "daily" | "weekly" | "monthly" | "yearly";

function makeDateParam(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function makePeriodKey(period: StatsPeriod): string {
  const d = new Date();
  const ymd = makeDateParam();
  const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const y = String(d.getFullYear());
  const suffixMap: Record<StatsPeriod, string> = {
    daily: ymd,
    weekly: ymd,
    monthly: ym,
    yearly: y,
  };
  return `@stats_${period}_${suffixMap[period]}`;
}

function makePeriodUrl(period: StatsPeriod): string {
  const d = new Date();
  const ymd = makeDateParam();
  const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const y = String(d.getFullYear());
  const urlMap: Record<StatsPeriod, string> = {
    daily: `/api/stats/daily?date=${ymd}`,
    weekly: `/api/stats/weekly?date=${ymd}`,
    monthly: `/api/stats/monthly?month=${ym}`,
    yearly: `/api/stats/yearly?year=${y}`,
  };
  return urlMap[period];
}

export async function getCachedStats(period: StatsPeriod): Promise<any | null> {
  try {
    const raw = await AsyncStorage.getItem(makePeriodKey(period));
    if (!raw) return null;
    const { data, fetchedAt } = JSON.parse(raw);
    if (Date.now() - fetchedAt > STATS_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

export async function setCachedStats(period: StatsPeriod, data: any): Promise<void> {
  try {
    await AsyncStorage.setItem(
      makePeriodKey(period),
      JSON.stringify({ data, fetchedAt: Date.now() }),
    );
  } catch {}
}

async function prefetchDeviceDetails(deviceIds: string[]): Promise<void> {
  await Promise.allSettled(
    deviceIds.map(async (id) => {
      try {
        const res = await apiClient.get(`/api/devices/${id}/detail`);
        const actual = res.data?.success ? res.data.data : res.data;
        if (actual) deviceStore.setDetail(mapToDeviceDetail(actual));
      } catch {}
    }),
  );
}

async function prefetchAllStats(): Promise<void> {
  const periods: StatsPeriod[] = ["daily", "weekly", "monthly", "yearly"];
  await Promise.allSettled(
    periods.map(async (period) => {
      try {
        const res = await apiClient.get(makePeriodUrl(period));
        await setCachedStats(period, res.data);
      } catch {}
    }),
  );
}

export async function runBackgroundPrefetch(deviceIds: string[]): Promise<void> {
  console.log(`[Prefetch] 시작: 장비 ${deviceIds.length}개 + 통계 4종`);
  await Promise.allSettled([
    prefetchDeviceDetails(deviceIds),
    prefetchAllStats(),
  ]);
  console.log("[Prefetch] 완료");
}
