import PageHeader from "@/components/PageHeader";
import { Colors } from "@/constants/Colors";
import apiClient from "@/services/apiClient";
import { Stack, useFocusEffect } from "expo-router"; // useFocusEffect 추가
import React, { useCallback, useState } from "react"; // useCallback 추가
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

interface YearlyStatsResponse {
  target_year: string;
  error_trend_by_quarter: { quarter: string; error_count: number }[];
  status_distribution: { RUN: number; ERROR: number; IDLE: number };
  risk_score: number;
  long_term_error_trend: { month: string; error_count: number }[];
  vision_ng_trend_by_month: { month: string; ng_rate: number }[];
  sensor_stability_by_month: {
    month: string;
    avg_temperature: number;
    avg_humidity: number;
    avg_vibration: number;
  }[];
}

export default function YearlyStatisticsScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<YearlyStatsResponse | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    RISK: true,
    QUARTER: true,
    STATUS: false,
    TREND: false,
    VISION: false,
    STABILITY: false,
  });

  const fetchStatistics = () => {
    const currentYear = new Date().getFullYear().toString();
    apiClient
      .get(`/api/stats/yearly?year=${currentYear}`)
      .then((res) => setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  // 페이지에 다시 들어올 때마다(Focus 될 때마다) 데이터를 다시 불러오도록 useFocusEffect 사용
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

  // 분기별 에러 발생 추이 데이터 변환
  const quarterData = data.error_trend_by_quarter.map((item) => ({
    value: item.error_count,
    label: item.quarter,
  }));
  // 연간 상태 분포 데이터 변환
  const statusPieData = [
    { value: data.status_distribution.RUN, color: "#2ED573", text: "RUN" },
    { value: data.status_distribution.ERROR, color: "#FF4757", text: "ERR" },
    { value: data.status_distribution.IDLE, color: "#FFA500", text: "IDLE" },
  ];
  // 장기 에러 발생 트렌드 데이터 변환
  const longTermErrorData = data.long_term_error_trend.map((item) => ({
    value: item.error_count,
    label: item.month,
  }));
  // 연간 비전 NG 추이 데이터 변환
  const visionNgData = data.vision_ng_trend_by_month.map((item) => ({
    value: item.ng_rate,
    label: item.month,
  }));
  // 연간 센서 안정성 분석 데이터 변환
  const sensorStabilityData = data.sensor_stability_by_month.map((item) => ({
    value: item.avg_temperature,
    label: item.month,
  }));

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title={`연간 통계 (${data.target_year}년)`} showBack={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* 심각도 기반 리스크 점수 */}
        <View style={styles.cardSection}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("RISK")}
          >
            <Text style={styles.cardHeaderTitle}>
              심각도 기반 리스크 종합 점수
            </Text>
            <Text style={styles.arrow}>{expanded.RISK ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.RISK && (
            <View style={styles.riskCardContent}>
              <Text style={styles.riskValue}>
                {data.risk_score.toLocaleString()} 점
              </Text>
            </View>
          )}
        </View>

        {/* 차트 섹션들 */}
        {[
          {
            title: "분기 기준 에러 발생 추이 비교",
            key: "QUARTER",
            data: quarterData,
            type: "bar",
          },
          {
            title: "연간 장비 종합 가동 상태 분포",
            key: "STATUS",
            data: statusPieData,
            type: "pie",
          },
          {
            title: "월별 장기 에러 발생 트렌드 변화",
            key: "TREND",
            data: longTermErrorData,
            type: "line",
          },
          {
            title: "월별 비전 검사 불량(NG) 비율 변화 추이",
            key: "VISION",
            data: visionNgData,
            type: "line",
          },
          {
            title: "연간 센서 안정성 데이터 분석",
            key: "STABILITY",
            data: sensorStabilityData,
            type: "line",
          },
        ].map((item, index) => (
          <View style={styles.section} key={index}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(item.key)}
            >
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <Text style={styles.arrow}>{expanded[item.key] ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            {expanded[item.key] && (
              <View style={styles.chartHolder}>
                {item.type === "bar" && (
                  <BarChart
                    data={item.data}
                    barWidth={35}
                    frontColor={Colors.light.brandDark}
                  />
                )}
                {item.type === "pie" && (
                  <PieChart
                    data={item.data}
                    donut
                    radius={80}
                    showText={true}
                    textColor="white"
                    labelsPosition="mid"
                    showTextBackground={false}
                  />
                )}
                {item.type === "line" && (
                  <LineChart data={item.data} thickness={3} />
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  container: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: "#E1E4E8",
  },
  cardHeaderTitle: { fontSize: 13, fontWeight: "700", color: "#2F3542" },
  riskCardContent: { alignItems: "center", marginTop: 10 },
  riskValue: { color: "#2F3542", fontSize: 24, fontWeight: "bold" },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: "#E1E4E8",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#2F3542" },
  arrow: { fontSize: 12, color: "#A4B0BE" },
  chartHolder: { alignItems: "center", marginTop: 15 },
});
