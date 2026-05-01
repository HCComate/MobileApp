import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { MOCK_RAW_LOGS } from "../../../mock/logs";

export default function DeviceDetailLogScreen() {
  // 네비게이션으로 전달받은 deviceId 추출
  const { deviceId, deviceName } = useLocalSearchParams<{
    deviceId: string;
    deviceName: string;
  }>();

  // 해당 장비의 로그만 필터링
  const filteredLogs = useMemo(() => {
    return MOCK_RAW_LOGS.filter((log) => log.header.device_id === deviceId);
  }, [deviceId]);

  const getStatusStyle = (item: (typeof MOCK_RAW_LOGS)[0]) => {
    const info = item.body.status_info[0];
    const msg = info.msg.toLowerCase();
    if (msg.includes("recovery") || msg.includes("success")) {
      return { backgroundColor: "#3055C1", textColor: "#FFFFFF" };
    }
    if (item.body.machine_status === "ERROR") {
      return { backgroundColor: "#FF4D4D", textColor: "#FFFFFF" };
    }
    if (info.severity === "MEDIUM") {
      return { backgroundColor: "#F1C40F", textColor: "#000000" };
    }
    return { backgroundColor: "#F2F4F7", textColor: "#333333" };
  };

  const renderLogItem = ({ item }: { item: (typeof MOCK_RAW_LOGS)[0] }) => {
    const style = getStatusStyle(item);
    return (
      <View style={[styles.logRow, { backgroundColor: style.backgroundColor }]}>
        <View style={styles.timeCell}>
          <Text style={[styles.timeText, { color: style.textColor }]}>
            {item.body.timestamp.split(" ")[0]}
          </Text>
          <Text style={[styles.timeText, { color: style.textColor }]}>
            {item.body.timestamp.split(" ")[1]}
          </Text>
        </View>
        <View style={styles.msgCell}>
          <Text style={[styles.cellText, { color: style.textColor }]}>
            {item.body.status_info[0].msg}
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
          {/* 전달받은 장비 이름을 타이틀에 동적으로 표시 */}
          <Text style={styles.headerTitle}>
            {deviceName || deviceId} 로그 리스트
          </Text>
        </View>

        <View style={styles.columnHeader}>
          <Text style={[styles.columnText, { flex: 1 }]}>발생 일시</Text>
          <Text style={[styles.columnText, { flex: 2 }]}>상세 내용</Text>
        </View>

        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.body.sequence.toString()}
          renderItem={renderLogItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>해당 장비의 기록이 없습니다.</Text>
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
  columnText: { color: "#FFF", fontWeight: "bold", textAlign: "center" },
  logRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  timeCell: { flex: 1, alignItems: "center" },
  msgCell: { flex: 2, paddingLeft: 15, justifyContent: "center" },
  cellText: { fontSize: 14, fontWeight: "500" },
  timeText: { fontSize: 11 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#999" },
});
