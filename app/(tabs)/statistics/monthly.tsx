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

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    STATUS: true,
    CODES: false,
    SENSOR: true,
    DEVICE: false,
    PART: false,
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

  // 타이머를 이용한 매달 1일 정오 자동 새로고침 스케줄러
  useEffect(() => {
    // 최초 1회(앱이 켜질 때) 데이터 호출
    fetchStatistics();

    let timeoutId: any;
    let intervalId: any;

    // 다음 달 1일 정오(12:00)까지 남은 밀리초(ms) 계산 함수
    const getMsUntilNextMonthFirstNoon = () => {
      const now = new Date();
      const nextMonthFirstNoon = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
        12,
        0,
        0,
        0,
      );

      return nextMonthFirstNoon.getTime() - now.getTime();
    };

    // 1개월(30일~31일) 단위 주기를 동적으로 제어하기 위한 주기적 스케줄러 실행 함수
    const startMonthlyInterval = () => {
      intervalId = setInterval(
        () => {
          fetchStatistics();
        },
        30 * 24 * 60 * 60 * 1000,
      ); // 대략적인 기본 주기 배치 설정 후 정시성 유지를 위함
    };

    // 스케줄러 설정 구현
    const setupMonthlyScheduler = () => {
      const msUntilNextMonthFirstNoon = getMsUntilNextMonthFirstNoon();

      // 다가오는 다음 달 1일 정오 정각에 맞춰 갱신 요청
      timeoutId = setTimeout(() => {
        fetchStatistics();
        startMonthlyInterval(); // 이후 한 달 주기로 작동
      }, msUntilNextMonthFirstNoon);
    };

    setupMonthlyScheduler();

    // 컴포넌트 언마운트 시 등록된 스케줄러 삭제 (메모리 누수 차단)
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

  // 월간 설비 상태 비율 데이터 변환
  const statusPieData = [
    { value: data.status_distribution.RUN, color: "#2ED573", text: "RUN" },
    { value: data.status_distribution.ERROR, color: "#FF4757", text: "ERR" },
    { value: data.status_distribution.IDLE, color: "#FFA500", text: "IDLE" },
  ];

  // 핵심 에러 코드 분포 데이터 변환
  const errorCodePieData = data.error_code_distribution.map(
    (item: { code: string; percentage: number }) => ({
      value: item.percentage,
      text: item.code,
    }),
  );

  // 월간 평균 센서 변화 데이터 변환
  const sensorTempLine = data.sensor_trend_by_week.map(
    (item: { week: string; temperature: number }) => ({
      value: item.temperature,
      label: item.week,
    }),
  );

  const sensorHumidLine = data.sensor_trend_by_week.map(
    (item: { humidity: number }) => ({
      value: item.humidity,
    }),
  );

  // 장비별 에러 누적 데이터 변환
  const deviceBarData = data.error_accumulation_by_device.map(
    (item: { device_id: string; total_error: number }) => ({
      value: item.total_error,
      label: item.device_id.replace("RASP_PI_", "#"),
    }),
  );

  // 부위별 에러 발생률 데이터 변환
  const partPieData = data.error_rate_by_part.map(
    (item: { part_location: string; percentage: number }) => ({
      value: item.percentage,
      text: item.part_location,
    }),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title={`월간 통계 (${data.target_month})`} showBack={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* 월간 설비 상태 비율 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("STATUS")}
          >
            <Text style={styles.sectionTitle}>월간 설비 상태 분포 비율</Text>
            <Text style={styles.arrow}>{expanded.STATUS ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.STATUS && (
            <View style={styles.chartHolder}>
              <PieChart data={statusPieData} donut radius={80} />
            </View>
          )}
        </View>

        {/* 핵심 에러 코드 분포 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("CODES")}
          >
            <Text style={styles.sectionTitle}>
              핵심 에러 코드별 점유율 분포
            </Text>
            <Text style={styles.arrow}>{expanded.CODES ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.CODES && (
            <View style={styles.chartHolder}>
              <PieChart
                data={errorCodePieData}
                radius={80}
                showText
                textColor="#FFF"
                textSize={10}
              />
            </View>
          )}
        </View>

        {/* 월간 평균 센서 변화 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("SENSOR")}
          >
            <Text style={styles.sectionTitle}>
              주차별 평균 환경 센서 변화 추이
            </Text>
            <Text style={styles.arrow}>{expanded.SENSOR ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.SENSOR && (
            <View style={styles.chartHolder}>
              <LineChart
                data={sensorTempLine}
                data2={sensorHumidLine}
                color1="#FF4757"
                color2="#1E3A8A"
                thickness={3}
              />
            </View>
          )}
        </View>

        {/* 장비별 에러 누적 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("DEVICE")}
          >
            <Text style={styles.sectionTitle}>장비별 에러 누적 수치 순위</Text>
            <Text style={styles.arrow}>{expanded.DEVICE ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.DEVICE && (
            <View style={styles.chartHolder}>
              <BarChart
                data={deviceBarData}
                barWidth={22}
                frontColor={Colors.light.brandDark}
              />
            </View>
          )}
        </View>

        {/* 부위별 에러 발생률 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("PART")}
          >
            <Text style={styles.sectionTitle}>
              부위 정보 기반 에러 발생 빈도 비중
            </Text>
            <Text style={styles.arrow}>{expanded.PART ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {expanded.PART && (
            <View style={styles.chartHolder}>
              <PieChart
                data={partPieData}
                radius={80}
                showText
                textColor="#FFF"
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
});
