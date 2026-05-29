import { MOCK_DEVICES } from "./devices";

export interface InspectionStatsData {
  totalToday: number;
  okCountToday: number;
  ngCountToday: number;
  last24hCount: number;
  ngCountByDevice: Record<string, number>;
  countBySeverity: Record<string, number>;
}

export type InspectionPeriod = "daily" | "weekly" | "monthly" | "yearly";

export const createMockInspectionStats = (
  period: InspectionPeriod,
): InspectionStatsData => {
  const timeWeight =
    period === "daily"
      ? 1
      : period === "weekly"
        ? 7
        : period === "monthly"
          ? 30
          : 365;

  const totalToday = Math.floor((Math.random() * 2000 + 5000) * timeWeight);
  const okCountToday = Math.floor(totalToday * (0.97 + Math.random() * 0.02));
  const ngCountToday = totalToday - okCountToday;
  const last24hCount = Math.floor(totalToday * 0.85);

  const ngCountByDevice: Record<string, number> = {};
  let remainingNg = ngCountToday;

  const targetDevices = MOCK_DEVICES;
  const deviceCount = targetDevices.length;

  targetDevices.forEach((device: { id: string }, index: number) => {
    if (index === deviceCount - 1) {
      ngCountByDevice[device.id] = remainingNg;
    } else {
      const distributedNg = Math.floor(
        Math.random() * (remainingNg / (deviceCount - index + 2)),
      );
      ngCountByDevice[device.id] = distributedNg;
      remainingNg -= distributedNg;
    }
  });

  const countBySeverity: Record<string, number> = {
    CRITICAL: Math.floor(Math.random() * 2 * timeWeight),
    HIGH: Math.floor((Math.random() * 8 + 4) * timeWeight),
    MEDIUM: Math.floor((Math.random() * 25 + 15) * timeWeight),
    LOW: Math.floor((Math.random() * 80 + 40) * timeWeight),
  };

  return {
    totalToday,
    okCountToday,
    ngCountToday,
    last24hCount,
    ngCountByDevice,
    countBySeverity,
  };
};
