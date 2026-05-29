import PageHeader from "@/components/PageHeader";
import { Colors } from "@/constants/Colors";
import apiClient from "@/services/apiClient";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
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

  // 타이머를 이용한 매년 1월 1일 정오 자동 새로고침 스케줄러
  useEffect(() => {
    // 최초 1회(앱이 켜질 때) 데이터 호출
    fetchStatistics();

    let timeoutId: any;
    let intervalId: any;

    // 다음해 1월 1일 정오(12:00)까지 남은 밀리초(ms) 계산 함수
    const getMsUntilNextYearFirstNoon = () => {
      const now = new Date();
      const nextYearFirstNoon = new Date(
        now.getFullYear() + 1,
        0,
        1,
        12,
        0,
        0,
        0,
      );

      return nextYearFirstNoon.getTime() - now.getTime();
    };

    // 1년 주기를 이어가기 위한 연속 스케줄러 실행 함수
    const startYearlyInterval = () => {
      intervalId = setInterval(
        () => {
          fetchStatistics();
        },
        365 * 24 * 60 * 60 * 1000,
      ); // 1년 단위 배치 갱신 설정
    };

    // 연간 스케줄러 감시 장치 구현
    const setupYearlyScheduler = () => {
      const msUntilNextYearFirstNoon = getMsUntilNextYearFirstNoon();

      // 다가오는 새해 1월 1일 정오 정각에 맞춰 데이터 리프레시 요청
      timeoutId = setTimeout(() => {
        fetchStatistics();
        startYearlyInterval(); // 첫 새해 도달 이후부터는 매년 주기 작동
      }, msUntilNextYearFirstNoon);
    };

    setupYearlyScheduler();

    // 컴포넌트 언마운트 시 메모리 누수 방지를 위한 타이머 해제
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

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
            <Text style={styles.arrowWhite}>{expanded.RISK ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.RISK && (
            <View style={styles.riskCardContent}>
              <Text style={styles.riskValue}>
                {data.risk_score.toLocaleString()} 점
              </Text>
            </View>
          )}
        </View>

        {/* 분기별 에러 발생 추이 */}
        <View style={styles.section}>
          {/* 💡 오타 수정: on think 대신 onPress 속성으로 원복 완료 */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("QUARTER")}
          >
            <Text style={styles.sectionTitle}>
              분기 기준 에러 발생 추이 비교
            </Text>
            <Text style={styles.arrow}>{expanded.QUARTER ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.QUARTER && (
            <View style={styles.chartHolder}>
              <BarChart
                data={quarterData}
                barWidth={35}
                frontColor={Colors.light.brandDark}
              />
            </View>
          )}
        </View>

        {/* 연간 상태 분포 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("STATUS")}
          >
            <Text style={styles.sectionTitle}>
              연간 장비 종합 가동 상태 분포
            </Text>
            <Text style={styles.arrow}>{expanded.STATUS ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.STATUS && (
            <View style={styles.chartHolder}>
              <PieChart data={statusPieData} donut radius={80} />
            </View>
          )}
        </View>

        {/* 장기 에러 발생 트렌드 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("TREND")}
          >
            <Text style={styles.sectionTitle}>
              월별 장기 에러 발생 트렌드 변화
            </Text>
            <Text style={styles.arrow}>{expanded.TREND ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.TREND && (
            <View style={styles.chartHolder}>
              <LineChart
                data={longTermErrorData}
                color="#FF4757"
                thickness={3}
              />
            </View>
          )}
        </View>

        {/* 연간 비전 NG 추이 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("VISION")}
          >
            <Text style={styles.sectionTitle}>
              월별 비전 검사 불량(NG) 비율 변화 추이
            </Text>
            <Text style={styles.arrow}>{expanded.VISION ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.VISION && (
            <View style={styles.chartHolder}>
              <LineChart data={visionNgData} color="#FFA500" thickness={3} />
            </View>
          )}
        </View>

        {/* 연간 센서 안정성 분석 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("STABILITY")}
          >
            <Text style={styles.sectionTitle}>
              연간 센서 안정성 데이터 분석
            </Text>
            <Text style={styles.arrow}>{expanded.STABILITY ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.STABILITY && (
            <View style={styles.chartHolder}>
              <LineChart
                data={sensorStabilityData}
                color="#2ED573"
                thickness={3}
              />
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
  cardSection: {
    backgroundColor: "#1E3A8A",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeaderTitle: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  riskCardContent: { alignItems: "center", marginTop: 15 },
  riskValue: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
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
  arrowWhite: { fontSize: 12, color: "#FFF", opacity: 0.7 },
  chartHolder: { alignItems: "center", marginTop: 15 },
});
