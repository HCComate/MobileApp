import PageHeader from "@/components/PageHeader";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import apiClient from "@/services/apiClient";
import { Stack, useFocusEffect } from "expo-router";
import ReportingButton from "@/components/ReportingButton";
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

interface MonthlyStatsResponse {
  target_month: string;
  status_distribution: { RUN: number; ERROR: number; IDLE: number };
  error_code_distribution: {
    code: string;
    count: number;
    percentage: number;
  }[];
  sensor_trend_by_week: {
    week: string;
    temperature: number;
    humidity: number;
    vibration_x: number;
  }[];
  error_accumulation_by_device: { device_id: string; total_error: number }[];
  error_rate_by_part: { part_location: string; percentage: number }[];
}

export default function MonthlyStatisticsScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<MonthlyStatsResponse | null>(null);
  const theme = useColorScheme() ?? "light";
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    STATUS: true,
    CODES: true,
    SENSOR: true,
    DEVICE: true,
    PART: true,
  });

  const fetchStatistics = () => {
    const today = new Date();
    const formattedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    apiClient
      .get(`/api/stats/monthly?month=${formattedMonth}`)
      .then((res) => setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  // 페이지에 다시 들어올 때마다 데이터 새로고침
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

  // 데이터 변환
  const statusPieData = [
    { value: data.status_distribution.RUN, color: "#2ED573", text: "RUN" },
    { value: data.status_distribution.ERROR, color: "#FF4757", text: "ERR" },
    { value: data.status_distribution.IDLE, color: "#FFA500", text: "IDLE" },
  ];
  const errorCodeBarData = data.error_code_distribution.map((item) => ({
    value: item.percentage,
    label: item.code,
    frontColor: "#1E3A8A",
  }));
  const sensorTempLine = data.sensor_trend_by_week.map((item) => ({
    value: item.temperature,
    label: item.week,
  }));
  const sensorHumidLine = data.sensor_trend_by_week.map((item) => ({
    value: item.humidity,
  }));
  const deviceBarData = data.error_accumulation_by_device.map((item) => ({
    value: item.total_error,
    label: item.device_id.replace("RASP_PI_", "#"),
  }));
  const partBarData = data.error_rate_by_part.map((item) => ({
    value: item.percentage,
    label: item.part_location,
  }));

  const labelStyle = {
    fontSize: 9,
    textAlign: "center" as const,
    width: 50,
    color: Colors[theme].text,
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <PageHeader title={`월간 통계 (${data.target_month})`} showBack={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* 설비 상태 */}
        <ThemedView
          style={[styles.section, { borderColor: Colors[theme].border }]}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("STATUS")}
          >
            <ThemedText style={styles.sectionTitle}>
              월간 설비 상태 분포
            </ThemedText>
            <ThemedText style={styles.arrow}>
              {expanded.STATUS ? "▲" : "▼"}
            </ThemedText>
          </TouchableOpacity>
          {expanded.STATUS && (
            <View style={styles.chartHolder}>
              <PieChart
                data={statusPieData}
                donut
                radius={70}
                showText
                textColor="white"
                textSize={12}
              />
            </View>
          )}
        </ThemedView>

        {/* 핵심 에러 코드 점유율 */}
        <ThemedView
          style={[styles.section, { borderColor: Colors[theme].border }]}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("CODES")}
          >
            <ThemedText style={styles.sectionTitle}>
              핵심 에러 코드 점유율
            </ThemedText>
            <ThemedText style={styles.arrow}>
              {expanded.CODES ? "▲" : "▼"}
            </ThemedText>
          </TouchableOpacity>
          {expanded.CODES && (
            <ScrollView horizontal style={styles.horizontalScroll}>
              <BarChart
                data={errorCodeBarData}
                barWidth={40}
                width={errorCodeBarData.length * 60}
                height={160}
                xAxisLabelTextStyle={labelStyle}
              />
            </ScrollView>
          )}
        </ThemedView>

        {/* 센서 추이 */}
        <ThemedView
          style={[styles.section, { borderColor: Colors[theme].border }]}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("SENSOR")}
          >
            <ThemedText style={styles.sectionTitle}>
              주차별 환경 센서 변화
            </ThemedText>
            <ThemedText style={styles.arrow}>
              {expanded.SENSOR ? "▲" : "▼"}
            </ThemedText>
          </TouchableOpacity>
          {expanded.SENSOR && (
            <ScrollView horizontal style={styles.horizontalScroll}>
              <LineChart
                data={sensorTempLine}
                data2={sensorHumidLine}
                width={sensorTempLine.length * 70}
                height={160}
                color1="#FF4757"
                color2="#1E3A8A"
                thickness={3}
                xAxisLabelTextStyle={labelStyle}
              />
            </ScrollView>
          )}
        </ThemedView>

        {/* 장비별 에러 누적 */}
        <ThemedView
          style={[styles.section, { borderColor: Colors[theme].border }]}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("DEVICE")}
          >
            <ThemedText style={styles.sectionTitle}>
              장비별 에러 누적 순위
            </ThemedText>
            <ThemedText style={styles.arrow}>
              {expanded.DEVICE ? "▲" : "▼"}
            </ThemedText>
          </TouchableOpacity>
          {expanded.DEVICE && (
            <ScrollView horizontal style={styles.horizontalScroll}>
              <BarChart
                data={deviceBarData}
                barWidth={40}
                width={deviceBarData.length * 60}
                height={160}
                frontColor={Colors[theme].tint}
                xAxisLabelTextStyle={labelStyle}
              />
            </ScrollView>
          )}
        </ThemedView>

        {/* 부위별 에러 발생률 */}
        <ThemedView
          style={[styles.section, { borderColor: Colors[theme].border }]}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("PART")}
          >
            <ThemedText style={styles.sectionTitle}>
              부위별 에러 발생 빈도
            </ThemedText>
            <ThemedText style={styles.arrow}>
              {expanded.PART ? "▲" : "▼"}
            </ThemedText>
          </TouchableOpacity>
          {expanded.PART && (
            <ScrollView horizontal style={styles.horizontalScroll}>
              <BarChart
                data={partBarData}
                barWidth={40}
                width={partBarData.length * 60}
                height={160}
                frontColor="#8B0000"
                xAxisLabelTextStyle={labelStyle}
              />
            </ScrollView>
          )}
        </ThemedView>
        <ReportingButton period="monthly" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 13, fontWeight: "700" },
  arrow: { fontSize: 12 },
  chartHolder: { alignItems: "center", marginTop: 10 },
  horizontalScroll: { marginTop: 10, paddingBottom: 20 },
});
