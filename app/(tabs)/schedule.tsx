import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
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
import { getWorkerImage } from "../../constants/image";
import { useScheduleData } from "../../hooks/useScheduleData";

export default function ScheduleScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const backgroundColor = Colors[colorScheme].background;
  const isDark = colorScheme === "dark";

  const cardBgColor = isDark ? "#1E1E1E" : "#FFF";
  const cardBorderColor = isDark ? "#2C2C2C" : "#F0F0F0";
  const mainTextColor = isDark ? "#FFF" : "#333";
  const subTextColor = isDark ? "#BBB" : "#666";

  const initialDateString = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(initialDateString);
  const { workers, loading, refreshing, refresh } =
    useScheduleData(selectedDate);

  const getRolePriority = (role: string) => {
    switch (role?.toUpperCase()) {
      case "MASTER":
        return 3;
      case "TECHNICIAN":
        return 2;
      case "OPERATOR":
        return 1;
      default:
        return 0;
    }
  };

  const sortedWorkers = useMemo(() => {
    if (!workers) return [];
    return [...workers].sort(
      (a, b) => getRolePriority(b.role) - getRolePriority(a.role),
    );
  }, [workers]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "MASTER":
        return "#E14D4D";
      case "TECHNICIAN":
        return "#3055C1";
      default:
        return "#2E9D62";
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <ThemedView style={styles.container}>
        <View style={styles.bannerSection}>
          <InfoBanner
            text={`선택된 날짜에 ${sortedWorkers.length}명의 인원이 배정되었습니다.`}
          />
        </View>

        <View style={styles.calendarSection}>
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={(date: string) => setSelectedDate(date)}
          />
        </View>

        <View style={styles.listSection}>
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: mainTextColor }]}
          >
            {selectedDate.split("-")[2]}일 근무 확정 인원
          </ThemedText>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3055C1" />
            </View>
          ) : (
            <FlatList
              data={sortedWorkers}
              keyExtractor={(item) => (item.emp_id || item.id).toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refresh}
                  colors={["#3055C1"]}
                  tintColor="#3055C1"
                />
              }
              renderItem={({ item }) => {
                const imageSource = getWorkerImage(item.username);

                return (
                  <View
                    style={[
                      styles.workerRow,
                      {
                        backgroundColor: cardBgColor,
                        borderColor: cardBorderColor,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.avatarPlaceholder,
                        {
                          backgroundColor: isDark ? "#333" : "#F0F2F5",
                          overflow: "hidden",
                        },
                      ]}
                    >
                      {imageSource ? (
                        <Image
                          source={imageSource}
                          style={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <ThemedText
                          style={[styles.avatarText, { color: mainTextColor }]}
                        >
                          {item.nickname.substring(0, 1)}
                        </ThemedText>
                      )}
                    </View>
                    <View style={styles.workerInfo}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={{ color: mainTextColor }}
                      >
                        {item.nickname}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.shiftBadge,
                        { backgroundColor: getRoleBadgeColor(item.role) },
                      ]}
                    >
                      <ThemedText style={styles.shiftText}>
                        {item.role}
                      </ThemedText>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <ThemedText
                    style={[styles.emptyText, { color: subTextColor }]}
                  >
                    해당 날짜에 확정된 배정 인원이 없습니다.
                  </ThemedText>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
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
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "bold" },
  workerInfo: { flex: 1, marginLeft: 15 },
  shiftBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  shiftText: { fontSize: 10, color: "#FFFFFF", fontWeight: "bold" },
  emptyContainer: { paddingTop: 40, alignItems: "center" },
  emptyText: { fontSize: 14, opacity: 0.5 },
});
