import PageHeader from "@/components/PageHeader";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/Colors";
import apiClient from "@/services/apiClient";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 기간별 화면 제목 + 서버 엔드포인트 매핑
const PERIOD_INFO: Record<string, { title: string; endpoint: string }> = {
  daily: { title: "일간 리포트", endpoint: "/api/stats/daily" },
  weekly: { title: "주간 리포트", endpoint: "/api/stats/weekly" },
  monthly: { title: "월간 리포트", endpoint: "/api/stats/monthly" },
  yearly: { title: "연간 리포트", endpoint: "/api/stats/yearly" },
};

export default function ReportingScreen() {
  const { period } = useLocalSearchParams<{ period?: string }>();
  const theme = useColorScheme() ?? "light";
  const info = PERIOD_INFO[period ?? "daily"] ?? PERIOD_INFO.daily;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sentences, setSentences] = useState<string[]>([]);
  const [error, setError] = useState(false);

  const fetchReport = async () => {
    try {
      setError(false);
      // 서버(AdminPC)의 통계 응답에는 reporting_sentences(문장 배열)가 포함되어 있다.
      const res = await apiClient.get(info.endpoint);
      const data = res.data?.data ?? res.data ?? {};
      const list = Array.isArray(data.reporting_sentences)
        ? (data.reporting_sentences as string[])
        : [];
      setSentences(list);
    } catch (e) {
      console.error("[Reporting] 리포트 조회 실패:", e);
      setError(true);
      setSentences([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 화면에 들어올 때마다 최신 리포트 조회
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReport();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period]),
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title={info.title} showBack={true} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReport();
            }}
          />
        }
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors[theme].tint} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <ThemedText style={styles.emptyText}>
              리포트를 불러올 수 없습니다.
            </ThemedText>
            <ThemedText style={styles.emptySub}>
              아래로 당겨 새로고침 해보세요.
            </ThemedText>
          </View>
        ) : sentences.length === 0 ? (
          <View style={styles.center}>
            <ThemedText style={styles.emptyText}>
              표시할 리포트가 없습니다.
            </ThemedText>
          </View>
        ) : (
          sentences.map((s, i) => (
            <ThemedView
              key={i}
              style={[styles.card, { borderColor: Colors[theme].border }]}
            >
              <ThemedText style={styles.cardText}>{s}</ThemedText>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyText: { fontSize: 15, fontWeight: "600" },
  emptySub: { fontSize: 12, opacity: 0.6, marginTop: 8 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardText: { fontSize: 14, lineHeight: 22 },
});
