import PageHeader from "@/components/PageHeader";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import apiClient from "@/services/apiClient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  reporting_sentences?: string[];
}

export default function DailyStatisticsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DailyStatsResponse | null>(null);
  const theme = useColorScheme() ?? "light";

  // 개별 섹션 접고 펴기 상태 관리
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    SUMMARY: true,
    SENSOR: true,
    TREND: true,
    SEVERITY: true,
    DEVICE: true,
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

  // 페이지에 다시 들어올 때마다(Focus 될 때마다) 데이터를 다시 불러오도록 설정
  useFocusEffect(
    useCallback(() => {
      fetchStatistics();
    }, []),
  );

  // 타이머를 이용한 매 정각 자동 새로고침 스케줄러
  useEffect(() => {
    let intervalId: any;

    const getMsUntilNextHour = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      return nextHour.getTime() - now.getTime();
    };

    const setupHourlyScheduler = () => {
      const msUntilNextHour = getMsUntilNextHour();

      return setTimeout(() => {
        fetchStatistics();

        intervalId = setInterval(
          () => {
            fetchStatistics();
          },
          60 * 60 * 1000,
        );
      }, msUntilNextHour);
    };

    const timeoutId = setupHourlyScheduler();

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
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </ThemedView>
    );
  if (!data)
    return (
      <ThemedView style={styles.center}>
        <ThemedText>데이터를 불러올 수 없습니다.</ThemedText>
      </ThemedView>
    );

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

  const deviceLogBarData = data.log_count_by_device.map((item) => ({
    value: item.count,
    label: item.device_id.replace("RASP_PI_", "#").replace("CONT_PI_", "#"),
    frontColor: "#1E3A8A",
  }));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      edges={["top"]}
    >
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
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection("SUMMARY")}
        ></TouchableOpacity>

        {expanded.SUMMARY && (
          <View style={styles.cardRow}>
            <ThemedView
              style={[styles.miniCard, { borderColor: Colors[theme].border }]}
            >
              <ThemedText style={styles.statLabel}>
                일일 에러 발생 빈도
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: "#FF4757" }]}>
                {data.daily_error_count}건
              </ThemedText>
            </ThemedView>
            <ThemedView
              style={[styles.miniCard, { borderColor: Colors[theme].border }]}
            >
              <ThemedText style={styles.statLabel}>
                일일 비전 NG 비율
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: "#FFA500" }]}>
                {data.daily_vision_ng_rate}%
              </ThemedText>
            </ThemedView>
          </View>
        )}

        <ThemedView
          style={[styles.section, { borderColor: Colors[theme].border }]}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("SENSOR")}
          >
            <ThemedText style={styles.sectionTitle}>평균 센서 상태</ThemedText>
            <ThemedText style={styles.arrow}>
              {expanded.SENSOR ? "▲" : "▼"}
            </ThemedText>
          </TouchableOpacity>
          {expanded.SENSOR && (
            <View style={styles.sensorGrid}>
              <ThemedText style={styles.sensorText}>
                🌡️ 평균 온도: {data.average_sensor.temperature} °C
              </ThemedText>
              <ThemedText style={styles.sensorText}>
                💧 평균 습도: {data.average_sensor.humidity} %
              </ThemedText>
              <ThemedText style={styles.sensorText}>
                🫨 평균 진동(X/Y): {data.average_sensor.vibration_x} /{" "}
                {data.average_sensor.vibration_y} G
              </ThemedText>
              <ThemedText style={styles.sensorText}>
                💡 평균 조도: {data.average_sensor.illumination} Lx
              </ThemedText>
            </View>
          )}
        </ThemedView>

        <ThemedView
          style={[styles.section, { borderColor: Colors[theme].border }]}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("TREND")}
          >
            <ThemedText style={styles.sectionTitle}>
              시간대별 가동 상태 변화 추이
            </ThemedText>
            <ThemedText style={styles.arrow}>
              {expanded.TREND ? "▲" : "▼"}
            </ThemedText>
          </TouchableOpacity>
          {expanded.TREND && (
            <View style={styles.chartHolder}>
              <LineChart
                data={lineRun}
                data2={lineErr}
                data3={lineIdle}
                width={SCREEN_WIDTH - 100}
                color1="#2ED573"
                color2="#FF4757"
                color3="#FFA500"
                thickness={3}
                noOfSections={4}
                yAxisLabelSuffix="%"
                color={Colors[theme].text}
              />
            </View>
          )}
        </ThemedView>

        <ThemedView
          style={[styles.section, { borderColor: Colors[theme].border }]}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("SEVERITY")}
          >
            <ThemedText style={styles.sectionTitle}>
              에러 심각도 분포 분석
            </ThemedText>
            <ThemedText style={styles.arrow}>
              {expanded.SEVERITY ? "▲" : "▼"}
            </ThemedText>
          </TouchableOpacity>
          {expanded.SEVERITY && (
            <View style={styles.chartCenter}>
              <PieChart
                data={severityPieData}
                donut
                showText={true}
                textColor="#FFF"
                radius={70}
                innerRadius={40}
                textSize={9}
                labelsPosition="mid"
                showTextBackground={false}
              />
            </View>
          )}
        </ThemedView>

        <ThemedView
          style={[styles.section, { borderColor: Colors[theme].border }]}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("DEVICE")}
          >
            <ThemedText style={styles.sectionTitle}>
              장비별 로그 발생량 비교
            </ThemedText>
            <ThemedText style={styles.arrow}>
              {expanded.DEVICE ? "▲" : "▼"}
            </ThemedText>
          </TouchableOpacity>
          {expanded.DEVICE && (
            <View style={styles.chartHolder}>
              <BarChart
                data={deviceLogBarData}
                width={SCREEN_WIDTH - 100}
                barWidth={24}
                noOfSections={4}
                barBorderRadius={4}
                xAxisLabelTextStyle={{ color: Colors[theme].text }}
                yAxisTextStyle={{ color: Colors[theme].text }}
              />
            </View>
          )}
        </ThemedView>

        {/* 리포트 보기 버튼 */}
        <TouchableOpacity
          style={[styles.reportBtn, { backgroundColor: Colors[theme].tint }]}
          onPress={() => {
            router.push({
              pathname: "/statistics/report",
              params: {
                title: `일간 리포트 (${data.target_date})`,
                sentences: JSON.stringify(data.reporting_sentences || []),
              },
            });
          }}
        >
          <ThemedText style={styles.reportBtnText}>📝 인공지능 분석 리포트 보기</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardRow: { flexDirection: "row", paddingHorizontal: 8, marginBottom: 12 },
  miniCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  section: {
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700" },
  arrow: { fontSize: 12 },
  statLabel: { fontSize: 11, marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: "bold" },
  sensorGrid: { gap: 8, marginTop: 15, paddingHorizontal: 8 },
  sensorText: { fontSize: 13, fontWeight: "500" },
  chartHolder: { marginTop: 15, alignItems: "center" },
  chartCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  reportBtn: {
    marginHorizontal: 16,
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
