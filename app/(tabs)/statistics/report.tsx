import PageHeader from "@/components/PageHeader";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/Colors";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatisticsReportScreen() {
  const { title, sentences } = useLocalSearchParams<{ title: string; sentences: string }>();
  const theme = useColorScheme() ?? "light";

  let parsedSentences: string[] = [];
  try {
    if (sentences) {
      parsedSentences = JSON.parse(sentences);
    }
  } catch (e) {
    console.error("Failed to parse sentences:", e);
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title={title || "통계 리포트"} showBack={true} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedView style={[styles.card, { borderColor: Colors[theme].border }]}>
          <ThemedText style={styles.reportTitle}>📝 {title || "분석 리포트"}</ThemedText>
          <View style={styles.divider} />
          
          {parsedSentences.length > 0 ? (
            parsedSentences.map((sentence, index) => (
              <View key={index} style={styles.sentenceRow}>
                <ThemedText style={styles.bullet}>•</ThemedText>
                <ThemedText style={styles.sentenceText}>{sentence}</ThemedText>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>리포트 데이터가 없습니다.</ThemedText>
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  card: {
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    marginTop: 10,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 16,
  },
  sentenceRow: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: -2,
    color: "#3B82F6",
  },
  sentenceText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.6,
  }
});
