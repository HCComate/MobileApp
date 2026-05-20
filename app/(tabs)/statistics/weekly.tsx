import PageHeader from "@/components/PageHeader";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { InspectionStatsData } from "@/mock/inspectionStatsMock";
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
import { BarChart, PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchInspectionStats } from "../../../services/statisticsApi";

export default function WeeklyStatisticsScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [inspectionData, setInspectionData] =
    useState<InspectionStatsData | null>(null);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    SUMMARY: true,
    DEVICE: false,
    ANALYSIS: false,
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchInspectionStats("weekly");
      setInspectionData(data);
      setLoading(false);
    };

    loadData();
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  if (loading || !inspectionData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.brandDark} />
        <Text style={styles.loadingText}>주간 검사 통계 가동 중...</Text>
      </View>
    );
  }

  const total = inspectionData.totalToday;
  const okRate =
    total > 0
      ? ((inspectionData.okCountToday / total) * 100).toFixed(2)
      : "0.00";
  const ngRate =
    total > 0
      ? ((inspectionData.ngCountToday / total) * 100).toFixed(2)
      : "0.00";

  const visionPieChartData = [
    {
      value: inspectionData.okCountToday,
      color: "#2ED573",
      text: `${parseFloat(okRate).toFixed(1)}%`,
      textStyle: { fontWeight: "bold" },
    },
    {
      value: inspectionData.ngCountToday,
      color: "#FF4757",
      text: `${parseFloat(ngRate).toFixed(1)}%`,
      focused: true,
      textStyle: { fontWeight: "bold" },
    },
  ];

  const deviceBarChartData = Object.entries(inspectionData.ngCountByDevice).map(
    ([deviceId, count]) => ({
      value: count,
      label: deviceId.replace("RASP_PI_", "#"),
      frontColor: Colors.light.brandDark,
    }),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title="주간 검사 통계" showBack={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.summaryGrid}>
          <View
            style={[
              styles.summaryCard,
              { borderLeftColor: Colors.light.brandDark },
            ]}
          >
            <Text style={styles.cardLabel}>주간 총 검사수</Text>
            <Text style={styles.cardValue}>
              {inspectionData.totalToday.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: "#2ED573" }]}>
            <Text style={styles.cardLabel}>정상(OK)</Text>
            <Text style={[styles.cardValue, { color: "#2ED573" }]}>
              {inspectionData.okCountToday.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: "#FF4757" }]}>
            <Text style={styles.cardLabel}>불량(NG)</Text>
            <Text style={[styles.cardValue, { color: "#FF4757" }]}>
              {inspectionData.ngCountToday.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("SUMMARY")}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>주간 종합 판정 비율</Text>
            <Text style={styles.arrowIcon}>
              {expandedSections.SUMMARY ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {expandedSections.SUMMARY && (
            <View style={styles.chartHolder}>
              <PieChart
                data={visionPieChartData}
                donut
                showText
                textColor="#FFFFFF"
                radius={95}
                innerRadius={60}
                textSize={12}
                labelsPosition="onBorder"
                focusOnPress
              />
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#2ED573" }]}
                  />
                  <Text style={styles.legendText}>
                    OK ({inspectionData.okCountToday}건)
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#FF4757" }]}
                  />
                  <Text style={styles.legendText}>
                    NG ({inspectionData.ngCountToday}건)
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("DEVICE")}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>
              설비별 주간 불량 누적 리포트
            </Text>
            <Text style={styles.arrowIcon}>
              {expandedSections.DEVICE ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {expandedSections.DEVICE && (
            <View style={styles.barChartHolder}>
              <BarChart
                data={deviceBarChartData}
                barWidth={18}
                spacing={14}
                initialSpacing={12}
                endSpacing={12}
                noOfSections={4}
                barBorderRadius={2}
                yAxisThickness={1}
                xAxisThickness={1}
                yAxisColor="#E1E4E8"
                xAxisColor="#E1E4E8"
                xAxisLabelTextStyle={styles.chartLabelText}
                yAxisTextStyle={styles.chartLabelText}
                isAnimated
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("ANALYSIS")}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>주간 종합 가동 분석 지표</Text>
            <Text style={styles.arrowIcon}>
              {expandedSections.ANALYSIS ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {expandedSections.ANALYSIS && (
            <View style={styles.infoReportCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>주간 누적 검사수</Text>
                <Text style={styles.infoValue}>
                  {inspectionData.totalToday.toLocaleString()} 개
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>정상 판정수</Text>
                <Text style={[styles.infoValue, { color: "#2ED573" }]}>
                  {inspectionData.okCountToday.toLocaleString()} 개
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>불량 판정수</Text>
                <Text style={[styles.infoValue, { color: "#FF4757" }]}>
                  {inspectionData.ngCountToday.toLocaleString()} 개
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>주간 총 가동 로그</Text>
                <Text style={styles.infoValue}>
                  {inspectionData.last24hCount.toLocaleString()} 개
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>주간 평균 불량률</Text>
                <Text style={[styles.infoValue, { color: "#FF4757" }]}>
                  {ngRate}%
                </Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>주간 최종 수율 지표</Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: Colors.light.brandDark, fontWeight: "700" },
                  ]}
                >
                  {okRate}% 달성
                </Text>
              </View>
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
  content: { padding: 16, paddingTop: 12, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: "#747D8C",
    fontFamily: Fonts.sans,
  },
  summaryGrid: { flexDirection: "row", gap: 8, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cardLabel: {
    fontSize: 11,
    color: "#747D8C",
    marginBottom: 4,
    fontFamily: Fonts.sans,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2F3542",
    fontFamily: Fonts.sans,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2F3542",
    fontFamily: Fonts.sans,
  },
  arrowIcon: { fontSize: 12, color: "#A4B0BE", fontWeight: "600" },
  chartHolder: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  barChartHolder: { marginTop: 20, paddingBottom: 5 },
  legendContainer: { flexDirection: "row", gap: 20, marginTop: 20 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: "#57606F", fontWeight: "500" },
  chartLabelText: {
    color: "#57606F",
    fontSize: 9,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  infoReportCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E1E4E8",
  },
  infoLabel: {
    fontSize: 13,
    color: "#4A4A6A",
    fontWeight: "500",
    fontFamily: Fonts.sans,
  },
  infoValue: {
    fontSize: 14,
    color: "#1C1C1E",
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
});
