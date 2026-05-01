import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView from "../../components/CalendarView";
import Header from "../../components/Header";
import InfoBanner from "../../components/InfoBanner";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { Colors } from "../../constants/Colors";
import { generateMonthlySchedule } from "../../mock/schedule";

export default function ScheduleScreen() {
  const now = useMemo(() => new Date(), []);

  const [selectedDate, setSelectedDate] = useState(
    `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`,
  );

  const monthlyData = useMemo(() => {
    return generateMonthlySchedule(now.getFullYear(), now.getMonth() + 1);
  }, [now]);

  const currentWorkers = useMemo(() => {
    const dayData = monthlyData.find((s) => s.date === selectedDate);
    return dayData ? dayData.workers : [];
  }, [selectedDate, monthlyData]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors.light.background }]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <ThemedView style={styles.container}>
        <View style={styles.bannerSection}>
          <InfoBanner
            text={`선택된 날짜에 ${currentWorkers.length}명의 인원이 배정되었습니다.`}
          />
        </View>

        {/* 달력 */}
        <View style={styles.calendarSection}>
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={(date: string) => setSelectedDate(date)}
          />
        </View>

        {/* 근무자 리스트 */}
        <View style={styles.listSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {selectedDate.split("-")[2]}일 근무 확정 인원
          </ThemedText>

          <FlatList
            data={currentWorkers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThemedView style={styles.workerRow}>
                <Image source={{ uri: item.image }} style={styles.avatar} />
                <View style={styles.workerInfo}>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  <ThemedText style={styles.workerId}>
                    사번 {item.id}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.shiftBadge,
                    { backgroundColor: Colors.light.tint },
                  ]}
                >
                  <ThemedText style={styles.shiftText}>주간</ThemedText>
                </View>
              </ThemedView>
            )}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  bannerSection: {
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: -5,
  },
  calendarSection: {
    padding: 15,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  workerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EEE" },
  workerInfo: { flex: 1, marginLeft: 15 },
  workerId: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  shiftBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  shiftText: { fontSize: 11, color: "#FFFFFF", fontWeight: "bold" },
});
