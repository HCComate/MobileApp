import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView from "../../components/CalendarView";
import Header from "../../components/Header";
import InfoBanner from "../../components/InfoBanner";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { Colors } from "../../constants/Colors";
import { useEventData } from "../../hooks/usePlanData";

export default function PlanScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = colorScheme;

  const initialDateString = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(initialDateString);

  const currentMonth = useMemo(() => {
    return selectedDate.substring(0, 7);
  }, [selectedDate]);

  const { events, loading, refreshing, refresh } = useEventData(currentMonth);

  const markedDates = useMemo(() => {
    const marks: any = {};
    events.forEach((event) => {
      marks[event.date] = {
        marked: true,
        dotColor: "#3055C1",
      };
    });
    return marks;
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => event.date === selectedDate);
  }, [events, selectedDate]);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3055C1" />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <Header />

      <View style={styles.bannerSection}>
        <InfoBanner text="운영 계획 / 주요 일정 관리" />
      </View>

      <View style={styles.calendarSection}>
        <CalendarView
          key={theme}
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
          data={filteredEvents}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={["#3055C1"]}
              tintColor="#3055C1"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.listContainer}>
              <ThemedView
                style={[
                  styles.eventItem,
                  { borderColor: Colors[theme].border },
                ]}
              >
                <View style={styles.eventDot} />
                <View style={styles.eventInfo}>
                  <ThemedText style={styles.eventContent}>
                    {item.content}
                  </ThemedText>
                  <ThemedText style={styles.dateText}>
                    {item.date.replace(/-/g, ".")}
                  </ThemedText>
                </View>
              </ThemedView>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.listContainer}>
              <ThemedText style={styles.emptyText}>
                해당 날짜에 예정된 일정이 없습니다.
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
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingBottom: 20 },
  bannerSection: { paddingHorizontal: 15, marginTop: 15, marginBottom: 5 },
  calendarSection: { paddingHorizontal: 15, paddingBottom: 5 },
  listTitleSection: { paddingHorizontal: 15 },
  listContainer: { paddingHorizontal: 15 },
  sectionTitle: { marginBottom: 15, fontSize: 18 },
  eventItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3055C1",
    marginRight: 14,
    marginTop: 6,
  },
  eventInfo: { flex: 1 },
  eventContent: { fontSize: 15, lineHeight: 22 },
  dateText: { marginTop: 8, fontSize: 12, opacity: 0.6 },
  emptyText: { textAlign: "center", marginTop: 30, opacity: 0.4 },
});
