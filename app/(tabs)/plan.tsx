import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView from "../../components/CalendarView";
import Header from "../../components/Header";
import InfoBanner from "../../components/InfoBanner";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { Colors } from "../../constants/Colors";
import { MOCK_PLANS } from "../../mock/plan";

export default function PlanScreen() {
  const now = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(
    `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`,
  );

  const markedDates = useMemo(() => {
    const marks: any = {};
    MOCK_PLANS.forEach((plan) => {
      if (!marks[plan.date]) {
        marks[plan.date] = { dots: [] };
      }

      const dotColor =
        plan.priority === "high"
          ? "#FF4D4F"
          : plan.priority === "medium"
            ? "#FFC107"
            : "#4CAF50";

      const dotKey = `${plan.id}_dot`;
      if (!marks[plan.date].dots.find((d: any) => d.key === dotKey)) {
        marks[plan.date].dots.push({ key: dotKey, color: dotColor });
      }
    });
    return marks;
  }, []);

  const filteredPlans = useMemo(() => {
    return MOCK_PLANS.filter((plan) => plan.date === selectedDate);
  }, [selectedDate]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors.light.background }]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <View style={styles.bannerSection}>
        <InfoBanner text="운영 계획 / 주요 일정 관리" />
      </View>

      <View style={styles.calendarSection}>
        <CalendarView
          selectedDate={selectedDate}
          markedDates={markedDates}
          onDateSelect={(date: string) => setSelectedDate(date)}
        />
      </View>

      <ThemedView style={styles.container}>
        <View style={styles.listTitleSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {selectedDate.split("-")[1]}월 {selectedDate.split("-")[2]}일 일정
          </ThemedText>
        </View>

        <FlatList
          data={filteredPlans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listContainer}>
              <View
                style={[
                  styles.planItem,
                  {
                    borderLeftColor:
                      item.priority === "high"
                        ? "#FF4D4F"
                        : item.priority === "medium"
                          ? "#FFC107"
                          : "#4CAF50",
                    borderLeftWidth: 5,
                  },
                ]}
              >
                <View style={styles.planInfo}>
                  <ThemedText type="subtitle" style={styles.planTitle}>
                    {item.title}
                  </ThemedText>
                  <View style={styles.planSubInfo}>
                    <ThemedText style={styles.authorText}>
                      {item.author}
                    </ThemedText>
                    <ThemedText style={styles.dateText}>
                      {item.date.replace(/-/g, ".")}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.listContainer}>
              <ThemedText style={styles.emptyText}>
                해당 날짜에 예정된 계획이 없습니다.
              </ThemedText>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  listContent: { paddingBottom: 20 },
  bannerSection: { paddingHorizontal: 15, marginTop: 15, marginBottom: 5 },
  calendarSection: { paddingHorizontal: 15, paddingBottom: 5 },
  listTitleSection: { paddingHorizontal: 15 },
  listContainer: { paddingHorizontal: 15 },
  sectionTitle: { marginBottom: 15, fontSize: 18 },
  planItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  planInfo: { flex: 1 },
  planTitle: { fontSize: 17, color: "#333" },
  planSubInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingRight: 15,
  },
  authorText: { fontSize: 13, color: "#666" },
  dateText: { fontSize: 13, color: "#999" },
  emptyText: { textAlign: "center", marginTop: 30, opacity: 0.4 },
});
