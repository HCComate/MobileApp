import { Stack } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { MOCK_RAW_LOGS } from "../../../mock/logs";

export default function ErrorLogScreen() {
  // 오직 machine_status가 ERROR인 데이터만 필터링
  const errorLogs = MOCK_RAW_LOGS.filter(
    (item) => item.body.machine_status === "ERROR",
  );

  const renderLogItem = ({ item }: { item: (typeof MOCK_RAW_LOGS)[0] }) => {
    const info = item.body.status_info[0];

    return (
      <View style={styles.logRow}>
        <View style={styles.deviceCell}>
          {/* 실제 데이터의 장비 ID 바인딩 */}
          <Text style={styles.whiteTextBold}>{item.header.device_id}</Text>
        </View>
        <View style={styles.timeCell}>
          <Text style={styles.whiteTextSmall}>
            {item.body.timestamp.split(" ")[0]}
          </Text>
          <Text style={styles.whiteTextSmall}>
            {item.body.timestamp.split(" ")[1]}
          </Text>
        </View>
        <View style={styles.msgCell}>
          {/* 실제 데이터의 에러 메시지 바인딩 */}
          <Text style={styles.whiteTextMedium}>{info.msg}</Text>
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
          <Text style={styles.headerTitle}>오류 로그 보기</Text>
        </View>

        <View style={styles.columnHeader}>
          <Text style={[styles.columnText, { flex: 0.8 }]}>장비</Text>
          <Text style={[styles.columnText, { flex: 1.2 }]}>일시</Text>
          <Text style={[styles.columnText, { flex: 2 }]}>기기 오류 발생</Text>
        </View>

        <FlatList
          data={errorLogs}
          keyExtractor={(item) => item.body.sequence.toString()}
          renderItem={renderLogItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                현재 감지된 시스템 오류가 없습니다.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  pageHeader: {
    backgroundColor: "#1D1D5A",
    paddingVertical: 15,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  columnHeader: {
    flexDirection: "row",
    backgroundColor: "#4A4A6A",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  columnText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
  logRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#FF4D4D",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
  },
  deviceCell: { flex: 0.8, alignItems: "center" },
  timeCell: { flex: 1.2, alignItems: "center" },
  msgCell: { flex: 2, paddingLeft: 10 },
  whiteTextBold: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  whiteTextMedium: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  whiteTextSmall: { color: "#FFFFFF", fontSize: 11 },
  emptyContainer: { flex: 1, alignItems: "center", marginTop: 100 },
  emptyText: { color: "#999", fontSize: 16 },
});
