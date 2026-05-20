import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import apiClient from "@/services/apiClient";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- 설정 변경 ---
const USE_API = false; // true: 실제 서버 API 연동, false: Mock 데이터 사용
// ----------------

interface StatisticsResponse {
  totalToday: number;
  okCountToday: number;
  ngCountToday: number;
  last24hCount: number;
  ngCountByDevice: { [key: string]: number };
  countBySeverity: { [key: string]: number };
}

export default function DailyStatisticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<StatisticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setError(null);

      if (USE_API) {
        // 실제 서버 연동 모드
        const response =
          await apiClient.get<StatisticsResponse>("/api/statistics");
        setData(response.data);
      } else {
        // Mock 데이터 모드
        const mockData: StatisticsResponse = {
          totalToday: 150,
          okCountToday: 142,
          ngCountToday: 8,
          last24hCount: 165,
          ngCountByDevice: {
            "Line-A-01": 3,
            "Line-B-04": 2,
            "Line-C-02": 2,
            "Line-A-05": 1,
          },
          countBySeverity: {
            CRITICAL: 2,
            WARNING: 5,
            INFO: 1,
          },
        };
        await new Promise((resolve) => setTimeout(resolve, 800));
        setData(mockData);
      }
    } catch (err) {
      console.error("[Statistics] 데이터 호출 실패:", err);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatistics();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.brandDark} />
        <Text style={styles.loadingText}>통계 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ title: "일일 통계", headerShown: false }} />
      <Header />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.brandDark}
          />
        }
      >
        <View style={styles.sectionTitleBox}>
          <View>
            <Text style={styles.sectionTitle}>오늘의 검사 요약</Text>
            {!USE_API && <Text style={styles.mockBadge}>MOCK DATA MODE</Text>}
          </View>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString("ko-KR")}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* 요약 카드 그리드 */}
            <View style={styles.statsGrid}>
              <StatCard
                title="총 검사"
                value={data?.totalToday}
                color="#4A90E2"
              />
              <StatCard
                title="최근 24시간"
                value={data?.last24hCount}
                color="#7ED321"
              />
              <StatCard
                title="정상 (OK)"
                value={data?.okCountToday}
                color="#50E3C2"
              />
              <StatCard
                title="비정상 (NG)"
                value={data?.ngCountToday}
                color="#D0021B"
              />
            </View>

            {/* 장비별 NG 현황 */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>장비별 비정상(NG) 발생 건수</Text>
              {data && Object.keys(data.ngCountByDevice).length > 0 ? (
                Object.entries(data.ngCountByDevice)
                  .sort(([, a], [, b]) => b - a)
                  .map(([device, count], index) => (
                    <View key={device} style={styles.listItem}>
                      <View style={styles.deviceInfoRow}>
                        <Text style={styles.deviceText}>
                          {index + 1}. {device}
                        </Text>
                        <Text style={styles.countText}>{count}건</Text>
                      </View>
                      <View style={styles.barBackground}>
                        <View
                          style={[
                            styles.bar,
                            {
                              width: `${Math.min((count / (data.ngCountToday || 1)) * 100, 100)}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))
              ) : (
                <Text style={styles.emptyText}>
                  발생한 비정상 내역이 없습니다.
                </Text>
              )}
            </View>

            {/* 심각도별 분포 */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>알람 심각도 분포</Text>
              <View style={styles.severityGrid}>
                {data && Object.keys(data.countBySeverity).length > 0 ? (
                  Object.entries(data.countBySeverity).map(
                    ([severity, count]) => (
                      <View key={severity} style={styles.severityItem}>
                        <View
                          style={[
                            styles.severityDot,
                            { backgroundColor: getSeverityColor(severity) },
                          ]}
                        />
                        <View>
                          <Text style={styles.severityLabel}>{severity}</Text>
                          <Text style={styles.severityValue}>{count}건</Text>
                        </View>
                      </View>
                    ),
                  )
                ) : (
                  <Text style={styles.emptyText}>분석된 알람이 없습니다.</Text>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// 하위 컴포넌트: 통계 카드
function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value?: number;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>
        {value?.toLocaleString() ?? "0"}
      </Text>
    </View>
  );
}

// 헬퍼 함수: 심각도별 색상 반환
function getSeverityColor(severity: string) {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return "#D0021B";
    case "WARNING":
      return "#F5A623";
    case "INFO":
      return "#4A90E2";
    default:
      return "#9B9B9B";
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  sectionTitleBox: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
    fontFamily: Fonts.sans,
  },
  mockBadge: {
    fontSize: 10,
    color: "#FF9500",
    fontWeight: "bold",
    marginTop: 4,
  },
  dateText: { fontSize: 14, color: "#888", fontFamily: Fonts.sans },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: "#FFF",
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderLeftWidth: 5,
  },
  statTitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    fontFamily: Fonts.sans,
  },
  statValue: { fontSize: 24, fontWeight: "bold", fontFamily: Fonts.sans },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    fontFamily: Fonts.sans,
  },
  listItem: { marginBottom: 18 },
  deviceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  deviceText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
    fontFamily: Fonts.sans,
  },
  countText: {
    fontSize: 14,
    color: "#D0021B",
    fontWeight: "bold",
    fontFamily: Fonts.sans,
  },
  barBackground: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  bar: { height: "100%", backgroundColor: "#D0021B", borderRadius: 4 },
  severityGrid: { flexDirection: "row", flexWrap: "wrap" },
  severityItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  severityDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  severityLabel: { fontSize: 12, color: "#777", fontFamily: Fonts.sans },
  severityValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    fontFamily: Fonts.sans,
  },
  emptyText: {
    textAlign: "center",
    color: "#AAA",
    paddingVertical: 20,
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  errorBox: {
    padding: 20,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFDADA",
  },
  errorText: { color: "#D0021B", fontSize: 14, fontFamily: Fonts.sans },
});
