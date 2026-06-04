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

const PERIOD_INFO: Record<string, { title: string; endpoint: string }> = {
  daily: { title: "일간 분석 리포트", endpoint: "/api/stats/daily" },
  weekly: { title: "주간 분석 리포트", endpoint: "/api/stats/weekly" },
  monthly: { title: "월간 분석 리포트", endpoint: "/api/stats/monthly" },
  yearly: { title: "연간 분석 리포트", endpoint: "/api/stats/yearly" },
};

export default function ReportingScreen() {
  const { period } = useLocalSearchParams<{ period?: string }>();
  const theme = useColorScheme() ?? "light";
  const info = PERIOD_INFO[period ?? "daily"] ?? PERIOD_INFO.daily;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sentences, setSentences] = useState<string[]>([]);
  const [error, setError] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setError(false);
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
  }, [info.endpoint]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReport();
    }, [fetchReport]),
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={Colors[theme].tint}
            colors={[Colors[theme].tint]}
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
            <ThemedText style={styles.errorIcon}>⚠️</ThemedText>
            <ThemedText style={styles.emptyText}>
              리포트를 불러올 수 없습니다.
            </ThemedText>
            <ThemedText style={styles.emptySub}>
              네트워크 상태를 확인하고 아래로 당겨서 새로고침 해주세요.
            </ThemedText>
          </View>
        ) : sentences.length === 0 ? (
          <View style={styles.center}>
            <ThemedText style={styles.errorIcon}>📋</ThemedText>
            <ThemedText style={styles.emptyText}>
              분석된 리포트 데이터가 없습니다.
            </ThemedText>
            <ThemedText style={styles.emptySub}>
              정각 주기로 새로운 로그 분석이 생성됩니다.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.reportContainer}>
            <ThemedText style={styles.metaText}>
              • AI 기반 공정 모니터링 자동 요약 요약본입니다.
            </ThemedText>
            {sentences.map((s, i) => (
              <ThemedView
                key={i}
                style={[
                  styles.card,
                  {
                    borderColor: Colors[theme].border,
                    backgroundColor: theme === "dark" ? "#1E1E1E" : "#F9FAFB",
                  },
                ]}
              >
                <View style={styles.bulletRow}>
                  <ThemedText
                    style={[styles.bullet, { color: Colors[theme].tint }]}
                  >
                    •
                  </ThemedText>
                  <ThemedText style={styles.cardText}>{s}</ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 60, flexGrow: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  errorIcon: { fontSize: 40, marginBottom: 16, textAlign: "center" },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    opacity: 0.5,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },

  reportContainer: { width: "100%" },
  metaText: { fontSize: 12, opacity: 0.5, marginBottom: 16, paddingLeft: 4 },

  card: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 16,
    lineHeight: 22,
    marginRight: 8,
    fontWeight: "bold",
  },
  cardText: {
    flex: 1,
    fontSize: 14.5,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
});
