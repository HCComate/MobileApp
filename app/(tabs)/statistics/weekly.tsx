import { ERROR_MASTER_DATA } from "@/assets/data/statesheet";
import PageHeader from "@/components/PageHeader";
import { Colors } from "@/constants/Colors";
import apiClient from "@/services/apiClient";
import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 80;

interface WeeklyStatsResponse {
  target_week: string;
  error_trend_by_day: { day: string; error_count: number }[];
  error_ranking_by_device: { device_id: string; error_count: number }[];
  sensor_anomaly_by_day: { day: string; anomaly_count: number }[];
  top5_error_codes: { code: string; count: number }[];
  status_distribution: { RUN: number; ERROR: number; IDLE: number };
}

export default function WeeklyStatisticsScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WeeklyStatsResponse | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    STATUS: true,
    TREND: true,
    DEVICE: false,
    ANOMALY: false,
    TOP5: false,
  });

  const fetchStatistics = () => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    apiClient
      .get(`/api/stats/weekly?date=${formattedDate}`)
      .then((res) => setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  // 화면에 포커스될 때마다 fetchStatistics 실행
  useFocusEffect(
    useCallback(() => {
      fetchStatistics();
    }, []),
  );

  const toggleSection = (section: string) => {
    setExpanded((p) => ({ ...p, [section]: !p[section] }));
  };

  if (loading || !data)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.brandDark} />
      </View>
    );

  // 요일별 에러 발생 추이 데이터 변환
  const weeklyErrorLineData = data.error_trend_by_day.map((item) => ({
    value: item.error_count,
    label: item.day,
  }));
  // 장비별 에러 발생 순위 데이터 변환
  const deviceErrorBarData = data.error_ranking_by_device.map((item) => ({
    value: item.error_count,
    label: item.device_id.replace("RASP_PI_", "#"),
  }));
  // 환경 데이터 이상치 데이터 변환
  const anomalyBarData = data.sensor_anomaly_by_day.map((item) => ({
    value: item.anomaly_count,
    label: item.day,
    frontColor: "#FF4757",
  }));
  // 장비 상태 분포 데이터 변환
  const statusPieData = [
    { value: data.status_distribution.RUN, color: "#2ED573", text: "RUN" },
    { value: data.status_distribution.ERROR, color: "#FF4757", text: "ERR" },
    { value: data.status_distribution.IDLE, color: "#FFA500", text: "IDLE" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title={`주간 통계 (${data.target_week})`} showBack={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* 장비 상태 분포 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("STATUS")}
          >
            <Text style={styles.sectionTitle}>주간 종합 장비 상태 분포</Text>
            <Text style={styles.arrow}>{expanded.STATUS ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.STATUS && (
            <View style={styles.chartHolder}>
              <PieChart
                data={statusPieData}
                donut
                showText
                textColor="#FFF"
                radius={70}
                innerRadius={40}
              />
            </View>
          )}
        </View>

        {/* 요일별 에러 발생 추이 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("TREND")}
          >
            <Text style={styles.sectionTitle}>요일별 에러 발생 추이</Text>
            <Text style={styles.arrow}>{expanded.TREND ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.TREND && (
            <View style={styles.chartHolder}>
              <LineChart
                data={weeklyErrorLineData}
                width={CHART_WIDTH}
                color={Colors.light.brandDark}
                thickness={3}
              />
            </View>
          )}
        </View>

        {/* 장비별 에러 발생 순위 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("DEVICE")}
          >
            <Text style={styles.sectionTitle}>장비별 에러 발생 누적 순위</Text>
            <Text style={styles.arrow}>{expanded.DEVICE ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.DEVICE && (
            <View style={styles.chartHolder}>
              <BarChart
                data={deviceErrorBarData}
                width={CHART_WIDTH}
                barWidth={20}
                frontColor={Colors.light.brandDark}
              />
            </View>
          )}
        </View>

        {/* 환경 데이터 이상치 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("ANOMALY")}
          >
            <Text style={styles.sectionTitle}>
              환경 데이터 임계치 초과 횟수 요일 집계
            </Text>
            <Text style={styles.arrow}>{expanded.ANOMALY ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.ANOMALY && (
            <View style={styles.chartHolder}>
              <BarChart
                data={anomalyBarData}
                width={CHART_WIDTH}
                barWidth={20}
              />
            </View>
          )}
        </View>

        {/* 에러 코드 TOP5 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("TOP5")}
          >
            <Text style={styles.sectionTitle}>에러 코드 발생 빈도 TOP 5</Text>
            <Text style={styles.arrow}>{expanded.TOP5 ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.TOP5 && (
            <View style={styles.infoReportCard}>
              {data.top5_error_codes.map((item, idx) => {
                const errorInfo = ERROR_MASTER_DATA.find(
                  (e) => e.코드 === item.code,
                );
                return (
                  <View key={idx} style={styles.infoRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoLabel}>{item.code}</Text>
                      <Text style={styles.subInfoLabel}>
                        {errorInfo ? errorInfo.오류명 : "알 수 없는 에러"}
                      </Text>
                    </View>
                    <Text style={styles.infoValue}>{item.count}건</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  container: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#2F3542" },
  arrow: { fontSize: 12, color: "#A4B0BE" },
  chartHolder: { alignItems: "center", marginTop: 15 },
  infoReportCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E1E4E8",
  },
  infoLabel: { fontSize: 13, fontWeight: "700", color: "#2F3542" },
  subInfoLabel: { fontSize: 12, color: "#666", marginTop: 2 },
  infoValue: { fontSize: 13, fontWeight: "600" },
});
