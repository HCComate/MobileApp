import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ERROR_MASTER_DATA,
  NORMAL_MASTER_DATA,
} from "../../../assets/data/statesheet";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";

export default function StateSheetScreen() {
  const [mode, setMode] = useState<"ERROR" | "NORMAL">("ERROR");

  const currentData = useMemo(() => {
    return mode === "ERROR" ? ERROR_MASTER_DATA : NORMAL_MASTER_DATA;
  }, [mode]);

  const getSeverityStyle = (value: string) => {
    const s = value.toUpperCase();

    if (s.includes("CRITICAL")) return { bg: "#FF4D4D", text: "#FFF" };
    if (s.includes("HIGH")) return { bg: "#FFB347", text: "#FFF" };
    if (s.includes("MEDIUM")) return { bg: "#F1C40F", text: "#000" };
    if (s.includes("NORMAL")) return { bg: "#2ECC71", text: "#FFF" };
    return { bg: "#BDC3C7", text: "#000" };
  };

  const renderRow = ({
    item,
  }: {
    item: (typeof ERROR_MASTER_DATA)[0] | (typeof NORMAL_MASTER_DATA)[0];
  }) => {
    const status =
      mode === "ERROR"
        ? (item as (typeof ERROR_MASTER_DATA)[0]).심각도
        : (item as (typeof NORMAL_MASTER_DATA)[0]).상태;

    const style = getSeverityStyle(status);

    return (
      <View style={styles.tableRow}>
        <View style={[styles.cell, { flex: 1.2 }]}>
          <Text style={styles.codeText}>{item.코드}</Text>
        </View>
        <View style={[styles.cell, { flex: 2 }]}>
          <Text style={styles.nameText}>
            {mode === "ERROR"
              ? (item as (typeof ERROR_MASTER_DATA)[0]).오류명
              : (item as (typeof NORMAL_MASTER_DATA)[0]).정상명}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <View style={[styles.severityBadge, { backgroundColor: style.bg }]}>
            <Text style={[styles.severityText, { color: style.text }]}>
              {status}
            </Text>
          </View>
        </View>
        <View style={[styles.cell, { flex: 2.5 }]}>
          <Text style={styles.solutionText}>
            {mode === "ERROR"
              ? (item as (typeof ERROR_MASTER_DATA)[0])["대응 방법"]
              : (item as (typeof NORMAL_MASTER_DATA)[0]).설명}
          </Text>
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
          <Text style={styles.headerTitle}>통합 상태 코드 식별표</Text>

          <View style={styles.tabContainer}>
            <Pressable
              style={[
                styles.tabButton,
                mode === "ERROR" && styles.activeErrorTab,
              ]}
              onPress={() => setMode("ERROR")}
            >
              <Text style={styles.tabText}>오류 코드</Text>
            </Pressable>

            <Pressable
              style={[
                styles.tabButton,
                mode === "NORMAL" && styles.activeNormalTab,
              ]}
              onPress={() => setMode("NORMAL")}
            >
              <Text style={styles.tabText}>정상 코드</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.columnLabel, { flex: 1.2 }]}>코드</Text>

          <Text style={[styles.columnLabel, { flex: 2 }]}>
            {mode === "ERROR" ? "오류명" : "정상명"}
          </Text>

          <Text style={[styles.columnLabel, { flex: 1 }]}>
            {mode === "ERROR" ? "심각도" : "상태"}
          </Text>

          <Text style={[styles.columnLabel, { flex: 2.5 }]}>
            {mode === "ERROR" ? "대응 방법" : "설명"}
          </Text>
        </View>
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.코드}
          renderItem={renderRow}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
  },
  pageHeader: {
    backgroundColor: "#1D1D5A",
    paddingVertical: 15,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#5E5E8F",
  },
  activeErrorTab: {
    backgroundColor: "#E74C3C",
  },
  activeNormalTab: {
    backgroundColor: "#27AE60",
  },
  tabText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
  },
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

  cell: {
    justifyContent: "center",
    paddingHorizontal: 2,
  },

  codeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#333",
  },

  nameText: {
    fontSize: 12,
    color: "#333",
  },

  severityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
    alignItems: "center",
  },

  severityText: {
    fontSize: 9,
    fontWeight: "bold",
  },

  solutionText: {
    fontSize: 11,
    color: "#666",
  },
});
