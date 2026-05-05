import { Stack } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { MOCK_RAW_LOGS } from "../../../mock/logs";

export default function EventLogScreen() {
  // 정상인 로그 아닌 것만 필터링
  const eventLogs = MOCK_RAW_LOGS.filter(
    (item) =>
      item.body.status_info[0].code !== "NORMAL" &&
      item.body.status_info[0].code !== "SV-VS-PR-00",
  );

  const getStatusStyle = (item: (typeof MOCK_RAW_LOGS)[0]) => {
    const info = item.body.status_info[0];
    const msg = info.msg.toLowerCase();

    if (
      msg.includes("recovery") ||
      msg.includes("success") ||
      msg.includes("reconnected")
    ) {
      return { backgroundColor: "#3055C1", textColor: "#FFFFFF" };
    }
    if (
      item.body.machine_status === "ERROR" ||
      info.severity === "CRITICAL" ||
      info.severity === "HIGH"
    ) {
      return { backgroundColor: "#FF4D4D", textColor: "#FFFFFF" };
    }
    return { backgroundColor: "#F1C40F", textColor: "#000000" };
  };

  const renderLogItem = ({ item }: { item: (typeof MOCK_RAW_LOGS)[0] }) => {
    const style = getStatusStyle(item);
    const info = item.body.status_info[0];

    return (
      <View style={[styles.logRow, { backgroundColor: style.backgroundColor }]}>
        <View style={styles.deviceCell}>
          {/* 장비 ID 데이터 바인딩 */}
          <Text
            style={[
              styles.cellText,
              { color: style.textColor, fontWeight: "bold" },
            ]}
          >
            {item.header.device_id}
          </Text>
        </View>
        <View style={styles.timeCell}>
          <Text style={[styles.timeText, { color: style.textColor }]}>
            {item.body.timestamp.split(" ")[0]}
          </Text>
          <Text style={[styles.timeText, { color: style.textColor }]}>
            {item.body.timestamp.split(" ")[1]}
          </Text>
        </View>
        <View style={styles.msgCell}>
          {/* 상태 메시지 데이터 바인딩 */}
          <Text
            style={[
              styles.cellText,
              { color: style.textColor, fontWeight: "600" },
            ]}
          >
            {info.msg}
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
          <Text style={styles.headerTitle}>이벤트 로그 보기</Text>
        </View>
        <View style={styles.columnHeader}>
          <Text style={[styles.columnText, { flex: 0.8 }]}>장비</Text>
          <Text style={[styles.columnText, { flex: 1.2 }]}>일시</Text>
          <Text style={[styles.columnText, { flex: 2 }]}>기기 상태 내역</Text>
        </View>
        <FlatList
          data={eventLogs}
          keyExtractor={(item) => item.body.sequence.toString()}
          renderItem={renderLogItem}
          showsVerticalScrollIndicator={false}
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  deviceCell: { flex: 0.8, alignItems: "center" },
  timeCell: { flex: 1.2, alignItems: "center" },
  msgCell: { flex: 2, paddingLeft: 10 },
  cellText: { fontSize: 14 },
  timeText: { fontSize: 11 },
});
