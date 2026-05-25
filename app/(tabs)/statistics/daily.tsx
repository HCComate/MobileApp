import PageHeader from "@/components/PageHeader";
import apiClient from "@/services/apiClient";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts"; // 차트 라이브러리
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

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

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get("/api/statistics"); // 실제 서버 API
      setData(response.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

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

  // --- 차트 데이터 변환 ---
  const okRate = ((data.okCountToday / data.totalToday) * 100).toFixed(1);
  const ngRate = ((data.ngCountToday / data.totalToday) * 100).toFixed(1);

  const pieData = [
    { value: data.okCountToday, color: "#2ED573", text: `${okRate}%` },
    {
      value: data.ngCountToday,
      color: "#FF4757",
      text: `${ngRate}%`,
      focused: true,
    },
  ];

  const barData = Object.entries(data.ngCountByDevice).map(([name, count]) => ({
    value: count,
    label: name.length > 5 ? name.substring(0, 5) : name,
    frontColor: "#1E3A8A",
  }));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title="일간 통계" showBack={true} />
      <ScrollView
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
        {/* 요약 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>검사 요약</Text>
          <View style={styles.row}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>총 검사</Text>
              <Text style={styles.statValue}>{data.totalToday}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>정상(OK)</Text>
              <Text style={[styles.statValue, { color: "#2ED573" }]}>
                {data.okCountToday}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>비정상(NG)</Text>
              <Text style={[styles.statValue, { color: "#FF4757" }]}>
                {data.ngCountToday}
              </Text>
            </View>
          </View>
        </View>

        {/* 정상/비정상 비율 차트 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>검사 결과 비율</Text>
          <View style={styles.chartCenter}>
            <PieChart
              data={pieData}
              donut
              showText
              textColor="#FFF"
              radius={90}
              innerRadius={60}
              textSize={12}
            />
          </View>
        </View>

        {/* 장비별 비정상 건수 차트 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>장비별 비정상(NG) 건수</Text>
          <BarChart
            data={barData}
            barWidth={22}
            noOfSections={3}
            barBorderRadius={4}
            frontColor="#1E3A8A"
            yAxisThickness={0}
            xAxisThickness={0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#FFF",
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { alignItems: "center", flex: 1 },
  statLabel: { fontSize: 12, color: "#888", marginBottom: 5 },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#333" },
  chartCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
});
