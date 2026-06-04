import PageHeader from "@/components/PageHeader";
import ReportingButton from "@/components/ReportingButton";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import apiClient from "@/services/apiClient";
import { getCachedStats, setCachedStats } from "@/services/prefetchService";
import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";

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
  reporting_sentences?: string[];
}

export default function YearlyStatisticsScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<YearlyStatsResponse | null>(null);
  const theme = useColorScheme() ?? "light";

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    RISK: true,
    QUARTER: true,
    STATUS: false,
    TREND: false,
    VISION: false,
    STABILITY: false,
  });

  const fetchStatistics = async () => {
    try {
      const cached = await getCachedStats("yearly");
      if (cached) {
        setData(cached);
        setLoading(false);
      }

      const currentYear = new Date().getFullYear().toString();
      const res = await apiClient.get(`/api/stats/yearly?year=${currentYear}`);
      setData(res.data);
      await setCachedStats("yearly", res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </ThemedView>
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <PageHeader title={`연간 통계 (${data.target_year}년)`} showBack={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* 심각도 기반 리스크 점수 */}
        <ThemedView
          style={[styles.cardSection, { borderColor: Colors[theme].border }]}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("RISK")}
          >
            <ThemedText style={styles.sectionTitle}>
              심각도 기반 리스크 종합 점수
            </ThemedText>
            <ThemedText style={styles.arrow}>
              {expanded.RISK ? "▲" : "▼"}
            </ThemedText>
          </TouchableOpacity>
          {expanded.RISK && (
            <View style={styles.riskCardContent}>
              <ThemedText style={styles.riskValue}>
                {data.risk_score.toLocaleString()} 점
              </ThemedText>
            </View>
          )}
        </ThemedView>

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
          <ThemedView
            style={[styles.section, { borderColor: Colors[theme].border }]}
            key={index}
          >
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(item.key)}
            >
              <ThemedText style={styles.sectionTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.arrow}>
                {expanded[item.key] ? "▲" : "▼"}
              </ThemedText>
            </TouchableOpacity>
            {expanded[item.key] && (
              <View style={styles.chartHolder}>
                {item.type === "bar" && (
                  <BarChart
                    data={item.data}
                    barWidth={35}
                    frontColor={Colors[theme].tint}
                    xAxisLabelTextStyle={{ color: Colors[theme].text }}
                    yAxisTextStyle={{ color: Colors[theme].text }}
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
                  <LineChart
                    data={item.data}
                    thickness={3}
                    color={Colors[theme].tint}
                    dataPointsColor={Colors[theme].text}
                    yAxisTextStyle={{ color: Colors[theme].text }}
                    xAxisLabelTextStyle={{ color: Colors[theme].text }}
                  />
                )}
              </View>
            )}
          </ThemedView>
        ))}
        <ReportingButton period="yearly" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardSection: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  section: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 13, fontWeight: "700" },
  arrow: { fontSize: 12 },
  riskCardContent: { alignItems: "center", marginTop: 10 },
  riskValue: { fontSize: 24, fontWeight: "bold" },
  chartHolder: { alignItems: "center", marginTop: 15 },
  reportBtn: {
    marginVertical: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  reportBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
