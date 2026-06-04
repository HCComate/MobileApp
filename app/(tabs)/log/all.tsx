import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Stack } from "expo-router";
import React from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { useLogData } from "../../../hooks/updateData"; // useLogData 훅 임포트
import { RawLog } from "../../../mock/Logs"; // 타입 임포트

// RESOLVED(오류 수정 완료) 로그는 친화적 라벨로 변환해 표시한다.
// 서버 msg는 "Recovery by {username}" 형식.
function formatLogMsg(info?: { code?: string; msg?: string }) {
  if (info?.code === "RESOLVED") {
    const by = (info.msg ?? "").replace(/recovery by/i, "").trim();
    return by ? `오류 수정 완료 (${by})` : "오류 수정 완료";
  }
  return info?.msg ?? "No Message";
}

export default function AllLogScreen() {
  const logs = useLogData(); // 서버로부터 실시간 로그 데이터 가져오기
  const theme = useColorScheme() ?? "light";

  const getStatusStyle = (item: RawLog) => {
    const info = item.body.status_info?.[0];
    const code = info?.code;
    const msg = (info?.msg ?? "").toLowerCase();
    const severity = info?.severity;

    // 문제 해결(오류 수정 완료 포함)은 파란색
    if (
      code === "RESOLVED" ||
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
      severity === "CRITICAL" ||
      severity === "HIGH"
    ) {
      return { backgroundColor: "#FF4D4D", textColor: "#FFFFFF" };
    }
    // 경고는 노란색
    if (severity === "MEDIUM") {
      return { backgroundColor: "#F1C40F", textColor: "#000000" };
    }
    // 일반적인 경우는 라이트/다크 모드에 따른 배경색
    return {
      backgroundColor: theme === "dark" ? "#1F2937" : "#F2F4F7",
      textColor: Colors[theme].text,
    };
  };

  const renderLogItem = ({ item }: { item: RawLog }) => {
    const style = getStatusStyle(item);
    const info = item.body.status_info?.[0];

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
            {formatLogMsg(info)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <Header />
      <ThemedView style={styles.container}>
        <View
          style={[
            styles.pageHeader,
            { backgroundColor: theme === "dark" ? "#111827" : "#1D1D5A" },
          ]}
        >
          <ThemedText style={styles.headerTitle}>전체 로그 보기</ThemedText>
        </View>
        <View
          style={[
            styles.columnHeader,
            { backgroundColor: theme === "dark" ? "#374151" : "#4A4A6A" },
          ]}
        >
          <Text style={[styles.columnText, { flex: 0.8 }]}>장비</Text>
          <Text style={[styles.columnText, { flex: 1.2 }]}>일시</Text>
          <Text style={[styles.columnText, { flex: 2 }]}>로그 내용</Text>
        </View>
        <FlatList
          data={logs}
          keyExtractor={(item) =>
            `${item.header.device_id}__${item.body.sequence}__${item.body.timestamp}`
          }
          renderItem={renderLogItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText>수신된 로그가 없습니다.</ThemedText>
            </View>
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  pageHeader: {
    paddingVertical: 15,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  columnHeader: {
    flexDirection: "row",
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
});
