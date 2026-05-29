import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MOCK_WORKERS } from "../mock/workers";
import { respondToAlert } from "../services/alertManager";
import { AlertModalData, alertModalStore } from "../store/alertModalStore";

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "#22C55E",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#7C3AED",
};

export default function AlertModal() {
  const [data, setData] = useState<AlertModalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    const unsub = alertModalStore.subscribe((d) => {
      setData(d);
      // ⭐ 안전하게 함수가 존재할 때만 호출하도록 수정했습니다.
      if (typeof alertModalStore.getQueueLength === "function") {
        setQueueLength(alertModalStore.getQueueLength());
      }
      setLoading(false);
    });
    return unsub;
  }, []);
  if (!data) return null;

  const severityColor = SEVERITY_COLOR[data.severity] ?? "#64748B";

  const handleAccept = async () => {
    setLoading(true);
    try {
      await respondToAlert(data.alertId, "ACCEPTED", MOCK_WORKERS as any);
      alertModalStore.hide(); // 스토어에서 다음 알람을 가져옴
    } catch (e) {
      console.warn("[AlertModal] 수락 처리 실패", e);
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await respondToAlert(data.alertId, "REJECTED", MOCK_WORKERS as any);
      alertModalStore.hide(); // 스토어에서 다음 알람을 가져옴
    } catch (e) {
      console.warn("[AlertModal] 거절 처리 실패", e);
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={!!data}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더에 남은 알람 개수 표시 추가 */}
          <View style={[styles.header, { backgroundColor: severityColor }]}>
            <View>
              <Text style={styles.headerText}>⚠️ 장비 오류 알림</Text>
              {queueLength > 1 && (
                <Text style={styles.queueText}>
                  대기 중인 알람 {queueLength}건
                </Text>
              )}
            </View>
            <View style={styles.severityBadge}>
              <Text style={styles.severityText}>{data.severity}</Text>
            </View>
          </View>

          <View style={styles.body}>
            <LogRow label="장비 ID" value={data.deviceId} />
            <LogRow label="오류 코드" value={data.errorCode} />
            <LogRow label="오류 내용" value={data.errorMsg} />
            <LogRow
              label="발생 시각"
              value={new Date(data.timestamp).toLocaleTimeString()}
            />
          </View>

          <View style={styles.questionRow}>
            <Text style={styles.questionText}>수리하러 가시겠습니까?</Text>
            <Text style={styles.questionSub}>
              거절 시 다음 담당자에게 알림이 전달됩니다.
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator
              style={{ marginVertical: 24 }}
              color={severityColor}
            />
          ) : (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, styles.rejectBtn]}
                onPress={handleReject}
              >
                <Text style={styles.rejectBtnText}>❌ 거절</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.acceptBtn,
                  { backgroundColor: severityColor },
                ]}
                onPress={handleAccept}
              >
                <Text style={styles.acceptBtnText}>✅ 수락</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function LogRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.logRow}>
      <Text style={styles.logLabel}>{label}</Text>
      <Text style={styles.logValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    width: "100%",
    overflow: "hidden",
    elevation: 10,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  queueText: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  severityBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  body: { padding: 20 },
  logRow: { flexDirection: "row", marginBottom: 10 },
  logLabel: { width: 80, color: "#64748B", fontSize: 14 },
  logValue: { flex: 1, color: "#1E293B", fontSize: 14, fontWeight: "600" },
  questionRow: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  questionSub: { fontSize: 12, color: "#94A3B8" },
  btnRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  btn: {
    flex: 1,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: { backgroundColor: "#F8FAFC" },
  rejectBtnText: { color: "#64748B", fontWeight: "bold" },
  acceptBtn: { backgroundColor: "#1E3A8A" },
  acceptBtnText: { color: "#FFF", fontWeight: "bold" },
});
