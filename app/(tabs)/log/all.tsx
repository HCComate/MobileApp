import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageHeader from "../../../components/PageHeader";
import { SEVERITY_COLOR } from "../../../constants/equipmentConstants";
import { useLogData } from "../../../hooks/updateData";
import { RawLog } from "../../../mock/Logs";

export default function AllLogsScreen() {
  const router = useRouter();
  const logs = useLogData();

  // 1. 최신순 정렬 로직 (body.timestamp 기준)
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const timeA = new Date(a.body?.timestamp || 0).getTime();
      const timeB = new Date(b.body?.timestamp || 0).getTime();
      return timeB - timeA; // 내림차순 (최신이 위로)
    });
  }, [logs]);

  // 2. 로그 아이템 렌더링 (Error 스타일 적용)
  const renderLogItem = ({ item }: { item: RawLog }) => {
    // 첫 번째 상태 정보 추출
    const mainStatus = item.body?.status_info?.[0];
    const severity = mainStatus?.severity || "LOW";
    const statusColor = SEVERITY_COLOR[severity] || "#94A3B8";
    const isError = item.body?.machine_status === "ERROR";

    // 타임스탬프에서 시간만 추출 (HH:mm:ss)
    const timestamp = item.body?.timestamp || "-";
    const timeDisplay = timestamp.includes(" ")
      ? timestamp.split(" ")[1].split(".")[0]
      : timestamp.includes("T")
        ? timestamp.split("T")[1].split(".")[0]
        : timestamp;

    return (
      <TouchableOpacity
        style={[styles.logCard, { borderLeftColor: statusColor }]}
        onPress={() => router.push(`/equipment/${item.header?.device_id}`)}
        activeOpacity={0.7}
      >
        {/* 카드 상단: 장비ID, 심각도 배지, 시간 */}
        <View style={styles.logHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.deviceId}>{item.header?.device_id}</Text>
            <View
              style={[styles.severityBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.severityText}>{severity}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>{timeDisplay}</Text>
        </View>

        {/* 카드 중단: 상태 코드 및 메시지 */}
        <View style={styles.logContent}>
          <Text style={styles.statusCode}>{mainStatus?.code || "NORMAL"}</Text>
          <Text style={styles.statusMsg} numberOfLines={1}>
            {mainStatus?.msg || "정상 가동 중입니다."}
          </Text>
        </View>

        {/* 카드 하단: 시퀀스 및 장비 상태 */}
        <View style={styles.logFooter}>
          <Text style={styles.footerText}>
            Sequence: #{item.body?.sequence}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isError ? "#EF4444" : "#10B981" },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isError ? "#EF4444" : "#10B981" },
              ]}
            >
              {item.body?.machine_status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title="전체 로그 목록" showBack={true} />

      <View style={styles.countBar}>
        <Text style={styles.countText}>
          총 {sortedLogs.length}건의 로그 데이터
        </Text>
      </View>

      <FlatList
        data={sortedLogs}
        renderItem={renderLogItem}
        keyExtractor={(item, index) =>
          `${item.header?.device_id}_${item.body?.sequence}_${index}`
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>표시할 로그가 없습니다.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  countBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  countText: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  listContent: { padding: 16, paddingBottom: 40 },
  logCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    // 그림자 설정
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  deviceId: { fontSize: 14, fontWeight: "800", color: "#1E293B" },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  timestamp: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  logContent: { marginBottom: 14 },
  statusCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  statusMsg: { fontSize: 13, color: "#64748B", lineHeight: 18 },
  logFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  footerText: { fontSize: 12, color: "#94A3B8" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "700" },
  emptyBox: { marginTop: 100, alignItems: "center" },
  emptyText: { color: "#94A3B8", fontSize: 14 },
});
