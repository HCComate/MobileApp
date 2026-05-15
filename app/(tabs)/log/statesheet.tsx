import { Stack } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ERROR_MASTER_DATA } from "../../../assets/data/statesheet";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";

export default function StateSheetScreen() {
  const getSeverityStyle = (severity: string) => {
    const s = severity.toUpperCase();
    if (s.includes("CRITICAL")) return { bg: "#FF4D4D", text: "#FFF" };
    if (s.includes("HIGH")) return { bg: "#FFB347", text: "#FFF" };
    return { bg: "#F1C40F", text: "#000" };
  };

  const renderRow = ({ item }: { item: (typeof ERROR_MASTER_DATA)[0] }) => {
    const style = getSeverityStyle(item.심각도);
    return (
      <View style={styles.tableRow}>
        <View style={[styles.cell, { flex: 1.2 }]}>
          <Text style={styles.codeText}>{item.코드}</Text>
        </View>
        <View style={[styles.cell, { flex: 2 }]}>
          <Text style={styles.nameText}>{item.오류명}</Text>
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <View style={[styles.severityBadge, { backgroundColor: style.bg }]}>
            <Text style={[styles.severityText, { color: style.text }]}>
              {item.심각도}
            </Text>
          </View>
        </View>
        <View style={[styles.cell, { flex: 2.5 }]}>
          <Text style={styles.solutionText}>{item["대응 방법"]}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>통합 핵심 오류코드 식별표</Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.columnLabel, { flex: 1.2 }]}>코드</Text>
          <Text style={[styles.columnLabel, { flex: 2 }]}>오류명</Text>
          <Text style={[styles.columnLabel, { flex: 1 }]}>심각도</Text>
          <Text style={[styles.columnLabel, { flex: 2.5 }]}>대응 방법</Text>
        </View>
        <FlatList
          data={ERROR_MASTER_DATA}
          keyExtractor={(item) => item.코드}
          renderItem={renderRow}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  container: { flex: 1 },
  pageHeader: {
    backgroundColor: "#1D1D5A",
    paddingVertical: 15,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4A4A6A",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  columnLabel: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingVertical: 12,
    paddingHorizontal: 5,
    alignItems: "center",
  },
  cell: { justifyContent: "center", paddingHorizontal: 2 },
  codeText: { fontSize: 11, fontWeight: "700", color: "#333" },
  nameText: { fontSize: 12, color: "#333" },
  severityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  severityText: { fontSize: 9, fontWeight: "bold" },
  solutionText: { fontSize: 11, color: "#666" },
});
