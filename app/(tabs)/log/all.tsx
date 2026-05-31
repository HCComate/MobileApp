import { Stack } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { useLogData } from "../../../hooks/updateData"; // useLogData 훅 임포트
import { RawLog } from "../../../mock/Logs"; // 타입 임포트

export default function AllLogScreen() {
  const logs = useLogData(); // 서버로부터 실시간 로그 데이터 가져오기

  const getStatusStyle = (item: RawLog) => {
    const info = item.body.status_info[0] || { msg: "", severity: "LOW" };
    const msg = info.msg.toLowerCase();

    // 문제 해결은 파란색
    if (
      msg.includes("recovery") ||
      msg.includes("success") ||
      msg.includes("reconnected")
    ) {
      return { backgroundColor: "#3055C1", textColor: "#FFFFFF" };
    }
    // 오류는 빨간색
    if (
      item.body.machine_status === "ERROR" ||
      item.body.machine_status === "LOCKED" ||
      info.severity === "CRITICAL" ||
      info.severity === "HIGH"
    ) {
      return { backgroundColor: "#FF4D4D", textColor: "#FFFFFF" };
    }
    // 경고는 노란색
    if (info.severity === "MEDIUM") {
      return { backgroundColor: "#F1C40F", textColor: "#000000" };
    }
    // 일반적인 경우는 흰색
    return { backgroundColor: "#F2F4F7", textColor: "#333333" };
  };

  const renderLogItem = ({ item }: { item: RawLog }) => {
    const style = getStatusStyle(item);
    const info = item.body.status_info[0] || { msg: "No Message" };

    return (
      <View style={[styles.logRow, { backgroundColor: style.backgroundColor }]}>
        <View style={styles.deviceCell}>
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
          {/* 타임스탬프가 있는 경우에만 분할 처리 */}
          <Text style={[styles.timeText, { color: style.textColor }]}>
            {item.body.timestamp?.split(" ")[0] || ""}
          </Text>
          <Text style={[styles.timeText, { color: style.textColor }]}>
            {item.body.timestamp?.split(" ")[1] || ""}
          </Text>
        </View>
        <View style={styles.msgCell}>
          <Text
            style={[styles.cellText, { color: style.textColor }]}
            numberOfLines={1}
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
          <Text style={styles.headerTitle}>전체 로그 보기 (실시간)</Text>
        </View>
        <View style={styles.columnHeader}>
          <Text style={[styles.columnText, { flex: 0.8 }]}>장비</Text>
          <Text style={[styles.columnText, { flex: 1.2 }]}>일시</Text>
          <Text style={[styles.columnText, { flex: 2 }]}>로그 내용</Text>
        </View>
        <FlatList
          data={logs}
          keyExtractor={(item, index) => item.body.sequence.toString() + index}
          renderItem={renderLogItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>수신된 로그가 없습니다.</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    alignItems: "center",
  },
  deviceCell: { flex: 0.8, alignItems: "center" },
  timeCell: { flex: 1.2, alignItems: "center" },
  msgCell: { flex: 2, paddingLeft: 10 },
  cellText: { fontSize: 14 },
  timeText: { fontSize: 11 },
  emptyContainer: { flex: 1, alignItems: "center", marginTop: 50 },
  emptyText: { color: "#999", fontSize: 14 },
});
