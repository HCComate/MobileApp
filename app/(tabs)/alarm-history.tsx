import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import PageHeader from "../../components/PageHeader";
import { Colors } from "../../constants/Colors";
import { SEVERITY_COLOR } from "../../constants/equipmentConstants";
import {
  getAllAlertHistory,
  subscribeAlertChanges,
} from "../../services/alertManager";
import { PageStyles } from "../../styles/PageStyles";
import { ActiveAlert } from "../../types/alert";

// 알람 응답 상태 → 표시 라벨/색상
const RESPONSE_META: Record<string, { label: string; color: string }> = {
  ACCEPTED: { label: "수락됨", color: "#10B981" },
  REJECTED: { label: "거절됨", color: "#EF4444" },
  TIMEOUT: { label: "시간초과", color: "#F59E0B" },
};
const PENDING_META = { label: "대기 중", color: "#94A3B8" };

export default function AlarmHistoryScreen() {
  const theme = useColorScheme() ?? "light";
  const [history, setHistory] = useState<ActiveAlert[]>([]);

  // 인메모리 알람 이력을 읽고, 알람 상태 변경 시마다 갱신한다.
  // (getAllAlertHistory는 원본 배열 참조를 주므로 복사해 리렌더를 보장)
  useEffect(() => {
    const refresh = () => setHistory([...getAllAlertHistory()]);
    refresh();
    return subscribeAlertChanges(refresh);
  }, []);

  const renderItem = ({ item }: { item: ActiveAlert }) => {
    const ev = item.alertEvent;
    const sevColor = SEVERITY_COLOR[ev.severity] || "#94A3B8";
    const resp = item.response
      ? RESPONSE_META[item.response] ?? PENDING_META
      : PENDING_META;

    const ts = (item.createdAt ?? ev.timestamp ?? "")
      .replace("T", " ")
      .split(".")[0];
    const [date = "-", time = "-"] = ts.split(" ");

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: Colors[theme].background,
            borderColor: Colors[theme].border,
          },
        ]}
      >
        <View style={styles.topRow}>
          <View style={[styles.sevBadge, { backgroundColor: sevColor }]}>
            <ThemedText style={styles.sevText}>{ev.severity}</ThemedText>
          </View>
          <ThemedText style={styles.deviceId} numberOfLines={1}>
            {ev.deviceId}
          </ThemedText>
          <View style={[styles.respBadge, { borderColor: resp.color }]}>
            <ThemedText style={[styles.respText, { color: resp.color }]}>
              {resp.label}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.errCode}>{ev.errorCode}</ThemedText>
        <ThemedText style={styles.errMsg}>{ev.errorMsg}</ThemedText>

        <View style={styles.bottomRow}>
          <ThemedText style={styles.metaText}>
            {date} {time}
          </ThemedText>
          {item.response === "ACCEPTED" && item.acceptedBy ? (
            <ThemedText style={styles.metaText}>
              수락자: {item.acceptedBy}
            </ThemedText>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        PageStyles.safeArea,
        { backgroundColor: Colors[theme].background },
      ]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <Header />

      <ThemedView style={PageStyles.container}>
        <PageHeader title="전체 알람 이력" />

        <FlatList
          data={history}
          keyExtractor={(item, index) => `${item.alertEvent.alertId}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={PageStyles.emptyText}>
                알람 이력이 없습니다.
              </ThemedText>
            </View>
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 12, gap: 10 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sevBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sevText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  deviceId: { flex: 1, fontSize: 15, fontWeight: "700" },
  respBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  respText: { fontSize: 11, fontWeight: "700" },
  errCode: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  errMsg: { fontSize: 13, opacity: 0.85 },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: { fontSize: 11, opacity: 0.6 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 100,
  },
});
