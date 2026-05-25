import PageHeader from "@/components/PageHeader";
import apiClient from "@/services/apiClient";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

interface DailyStatsResponse {
  target_date: string;
  status_trend_by_hour: {
    hour: string;
    RUN: number;
    ERROR: number;
    IDLE: number;
  }[];
  average_sensor: {
    temperature: number;
    humidity: number;
    vibration_x: number;
    vibration_y: number;
    illumination: number;
  };
  daily_error_count: number;
  daily_vision_ng_rate: number;
  severity_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  log_count_by_device: { device_id: string; count: number }[];
}

export default function DailyStatisticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DailyStatsResponse | null>(null);

  // 개별 섹션 접고 펴기 상태 관리
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    SUMMARY: true,
    SENSOR: true,
    TREND: true,
    SEVERITY: false,
    DEVICE: false,
  });

  const fetchStatistics = async () => {
    try {
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const response = await apiClient.get(
        `/api/stats/daily?date=${formattedDate}`,
      );
      setData(response.data);
    } catch (error) {
      console.error("Daily fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 타이머를 이용한 매 정각 자동 새로고침 스케줄러
  useEffect(() => {
    // 최초 1회 데이터 호출
    fetchStatistics();

    // React Native 환경에 맞게 any 타입으로 변수 선언 (형식 할당 에러 해결)
    let intervalId: any;

    // 다음 정각까지 남은 밀리초 계산 함수
    const getMsUntilNextHour = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0); // 다음 시간 00분 00초 000밀리초 설정
      return nextHour.getTime() - now.getTime();
    };

    // 정각 주기를 제어하는 스케줄러 설정
    const setupHourlyScheduler = () => {
      const msUntilNextHour = getMsUntilNextHour();

      // 다가오는 첫 정각에 맞춰 실행되는 타이머
      return setTimeout(() => {
        fetchStatistics(); // 첫 정각에 데이터 갱신

        // 첫 정각에 도달한 이후부터는 정확히 1시간마다 주기적으로 호출
        intervalId = setInterval(
          () => {
            fetchStatistics();
          },
          60 * 60 * 1000,
        );
      }, msUntilNextHour);
    };

    const timeoutId = setupHourlyScheduler();

    // 컴포넌트 언마운트 시 타이머 해제 (메모리 누수 방지)
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const toggleSection = (section: string) => {
    setExpanded((p) => ({ ...p, [section]: !p[section] }));
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  if (!data)
    return (
      <View style={styles.center}>
        <Text>데이터를 불러올 수 없습니다.</Text>
      </View>
    );

  // 시간대별 상태 변화 추이 데이터 변환
  const lineRun = data.status_trend_by_hour.map((item) => ({
    value: item.RUN,
    label: item.hour,
  }));
  const lineErr = data.status_trend_by_hour.map((item) => ({
    value: item.ERROR,
  }));
  const lineIdle = data.status_trend_by_hour.map((item) => ({
    value: item.IDLE,
  }));

  // 심각도 분포 데이터 변환
  const severityPieData = [
    { value: data.severity_distribution.LOW, color: "#2ED573", text: "LOW" },
    { value: data.severity_distribution.MEDIUM, color: "#FFA500", text: "MED" },
    { value: data.severity_distribution.HIGH, color: "#FF4757", text: "HIGH" },
    {
      value: data.severity_distribution.CRITICAL,
      color: "#8B0000",
      text: "CRIT",
    },
  ];

  // 장비별 로그 발생량 데이터 변환
  const deviceLogBarData = data.log_count_by_device.map((item) => ({
    value: item.count,
    label: item.device_id.replace("RASP_PI_", "#").replace("CONT_PI_", "#"),
    frontColor: "#1E3A8A",
  }));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title={`일간 통계 (${data.target_date})`} showBack={true} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchStatistics();
            }}
          />
        }
      >
        {/* 일일 에러 발생 빈도 및 일일 비전 NG 비율 요약 카드 */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection("SUMMARY")}
        >
          <Text style={styles.sectionTitle}>일일 주요 핵심 지표 요약</Text>
          <Text style={styles.arrow}>{expanded.SUMMARY ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {expanded.SUMMARY && (
          <View style={styles.cardRow}>
            <View style={styles.miniCard}>
              <Text style={styles.statLabel}>일일 에러 발생 빈도</Text>
              <Text style={[styles.statValue, { color: "#FF4757" }]}>
                {data.daily_error_count}건
              </Text>
            </View>
            <View style={styles.miniCard}>
              <Text style={styles.statLabel}>일일 비전 NG 비율</Text>
              <Text style={[styles.statValue, { color: "#FFA500" }]}>
                {data.daily_vision_ng_rate}%
              </Text>
            </View>
          </View>
        )}

        {/* 평균 센서 상태 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("SENSOR")}
          >
            <Text style={styles.sectionTitle}>평균 센서 상태</Text>
            <Text style={styles.arrow}>{expanded.SENSOR ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.SENSOR && (
            <View style={styles.sensorGrid}>
              <Text style={styles.sensorText}>
                🌡️ 평균 온도: {data.average_sensor.temperature} °C
              </Text>
              <Text style={styles.sensorText}>
                💧 평균 습도: {data.average_sensor.humidity} %
              </Text>
              <Text style={styles.sensorText}>
                🫨 평균 진동(X/Y): {data.average_sensor.vibration_x} /{" "}
                {data.average_sensor.vibration_y} G
              </Text>
              <Text style={styles.sensorText}>
                💡 평균 조도: {data.average_sensor.illumination} Lx
              </Text>
            </View>
          )}
        </View>

        {/* 시간대별 상태 변화 추이 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("TREND")}
          >
            <Text style={styles.sectionTitle}>
              시간대별 가동 상태 변화 추이
            </Text>
            <Text style={styles.arrow}>{expanded.TREND ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.TREND && (
            <View style={styles.chartHolder}>
              <LineChart
                data={lineRun}
                data2={lineErr}
                data3={lineIdle}
                color1="#2ED573"
                color2="#FF4757"
                color3="#FFA500"
                thickness={3}
                noOfSections={4}
                yAxisLabelSuffix="%"
              />
            </View>
          )}
        </View>

        {/* 심각도 분포 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("SEVERITY")}
          >
            <Text style={styles.sectionTitle}>에러 심각도 분포 분석</Text>
            <Text style={styles.arrow}>{expanded.SEVERITY ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.SEVERITY && (
            <View style={styles.chartCenter}>
              <PieChart
                data={severityPieData}
                donut
                showText
                textColor="#FFF"
                radius={85}
                innerRadius={55}
              />
            </View>
          )}
        </View>

        {/* 장비별 로그 발생량 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("DEVICE")}
          >
            <Text style={styles.sectionTitle}>장비별 로그 발생량 비교</Text>
            <Text style={styles.arrow}>{expanded.DEVICE ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.DEVICE && (
            <View style={styles.chartHolder}>
              <BarChart
                data={deviceLogBarData}
                barWidth={24}
                noOfSections={4}
                barBorderRadius={4}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollView: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardRow: { flexDirection: "row", paddingHorizontal: 8, marginBottom: 12 },
  miniCard: {
    flex: 1,
    backgroundColor: "#FFF",
    margin: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#2F3542" },
  arrow: { fontSize: 12, color: "#A4B0BE" },
  statLabel: { fontSize: 11, color: "#888", marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: "bold" },
  sensorGrid: { gap: 8, marginTop: 15 },
  sensorText: { fontSize: 13, color: "#4A4A6A", fontWeight: "500" },
  chartHolder: { marginTop: 15, alignItems: "center" },
  chartCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
});
