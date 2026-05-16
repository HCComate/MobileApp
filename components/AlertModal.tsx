// ─────────────────────────────────────────────
//  components/AlertModal.tsx
//  오류 알람 팝업 모달
//
//  - 알림 탭 시 자동으로 표시
//  - 오류 로그 상세 정보 표시
//  - 수락 / 거절 버튼
//  - 수락 시 서버에 응답 전송 + 에스컬레이션 중단
//  - 거절 시 다음 사람에게 에스컬레이션
// ─────────────────────────────────────────────

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

// 심각도 색상
const SEVERITY_COLOR: Record<string, string> = {
  LOW: "#22C55E",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#7C3AED",
};

export default function AlertModal() {
  const [data, setData] = useState<AlertModalData | null>(null);
  const [loading, setLoading] = useState(false);

  // alertModalStore 구독
  useEffect(() => {
    const unsub = alertModalStore.subscribe((d) => setData(d));
    return unsub;
  }, []);

  if (!data) return null;

  const severityColor = SEVERITY_COLOR[data.severity] ?? "#64748B";

  // ── 수락 처리 ──────────────────────────────
  const handleAccept = async () => {
    setLoading(true);
    try {
      await respondToAlert(data.alertId, "ACCEPTED", MOCK_WORKERS as any);

      // TODO: 서버에 수락 신호 전송
      // await fetch(`http://서버IP:포트/api/alerts/${data.alertId}/respond`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ response: 'ACCEPTED' }),
      // });

      alertModalStore.hide();
    } catch (e) {
      console.warn("[AlertModal] 수락 처리 실패", e);
    } finally {
      setLoading(false);
    }
  };

  // ── 거절 처리 ──────────────────────────────
  const handleReject = async () => {
    setLoading(true);
    try {
      await respondToAlert(data.alertId, "REJECTED", MOCK_WORKERS as any);

      // TODO: 서버에 거절 신호 전송
      // await fetch(`http://서버IP:포트/api/alerts/${data.alertId}/respond`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ response: 'REJECTED' }),
      // });

      alertModalStore.hide();
    } catch (e) {
      console.warn("[AlertModal] 거절 처리 실패", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={!!data}
      transparent
      animationType="fade"
      onRequestClose={() => {}} // 뒤로가기로 닫히지 않게
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={[styles.header, { backgroundColor: severityColor }]}>
            <Text style={styles.headerText}>⚠️ 장비 오류 알림</Text>
            <View style={styles.severityBadge}>
              <Text style={styles.severityText}>{data.severity}</Text>
            </View>
          </View>

          {/* 오류 로그 상세 */}
          <View style={styles.body}>
            <LogRow label="장비 ID" value={data.deviceId} />
            <LogRow label="오류 코드" value={data.errorCode} />
            <LogRow label="오류 내용" value={data.errorMsg} />
            <LogRow label="발생 시각" value={data.timestamp} />
          </View>

          {/* 수락 여부 질문 */}
          <View style={styles.questionRow}>
            <Text style={styles.questionText}>수리하러 가시겠습니까?</Text>
            <Text style={styles.questionSub}>
              거절 시 다음 담당자에게 알림이 전달됩니다.
            </Text>
          </View>

          {/* 버튼 영역 */}
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color="#1E3A8A" />
          ) : (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, styles.rejectBtn]}
                onPress={handleReject}
                activeOpacity={0.8}
              >
                <Text style={styles.rejectBtnText}>❌ 거절</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.acceptBtn]}
                onPress={handleAccept}
                activeOpacity={0.8}
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

// ── 로그 행 컴포넌트 ────────────────────────────
const LogRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.logRow}>
    <Text style={styles.logLabel}>{label}</Text>
    <Text style={styles.logValue} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

// ── 스타일 ────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  severityBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  severityText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // 오류 로그 상세
  body: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 8,
  },
  logRow: {
    flexDirection: "row",
    gap: 8,
  },
  logLabel: {
    width: 72,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  logValue: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
  },

  // 수락 여부 질문
  questionRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  questionSub: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },

  // 버튼
  btnRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  rejectBtn: {
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },
  rejectBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },
  acceptBtn: {},
  acceptBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#22C55E",
  },
});
