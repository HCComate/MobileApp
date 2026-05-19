import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import {
  EQ_COLORS,
  SEVERITY_COLOR,
  STATUS_COLOR,
  STATUS_LABEL,
} from "../../../constants/equipmentConstants";
import { MOCK_DEVICES } from "../../../mock/devices";
import { resolveDeviceError } from "../../../mock/Logs";
import { resolveAlertByDeviceId } from "../../../services/alertManager";
import { deviceStore } from "../../../store/deviceStore";
import {
  DeviceDetail,
  MachineStatus,
  Severity,
  VisionResult,
} from "../../../types/equipment";

const { width: SW } = Dimensions.get("window");

type CameraTab = "front" | "side" | "rear";
const CAM_TABS: { label: string; value: CameraTab }[] = [
  { label: "전면", value: "front" },
  { label: "측면", value: "side" },
  { label: "후면", value: "rear" },
];

export default function DeviceDetailScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CameraTab>("front");
  const [detail, setDetail] = useState<DeviceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateDetail = () => {
      if (!deviceId) return;

      const currentDetail = deviceStore.getDetail(deviceId);
      if (currentDetail) {
        setDetail(currentDetail);
      } else {
        const summary = deviceStore.get(deviceId);
        if (summary) {
          // Summary에서 상세 정보로 변환 시 누락된 필드 채우기
          setDetail({
            deviceId: summary.deviceId,
            batchId: `BATCH_${Math.floor(Math.random() * 10000)}`,
            modelName: summary.modelName,
            sequence: summary.lastSequence || Math.floor(Math.random() * 1000),
            machineStatus: summary.machineStatus,
            temperature: parseFloat(
              (Math.random() * (30 - 20) + 20).toFixed(1),
            ),
            vibrationX: parseFloat(
              (Math.random() * (0.5 - 0.1) + 0.1).toFixed(2),
            ),
            vibrationY: parseFloat(
              (Math.random() * (0.5 - 0.1) + 0.1).toFixed(2),
            ),
            illumination: Math.floor(Math.random() * (1000 - 300) + 300),
            timestamp: summary.timestamp,
            statusInfos: [], // 상세 페이지에서 별도로 관리될 수 있음
            visionResult: {
              result: (summary.visionResult || "OK") as VisionResult,
              defectType: "N/A",
              confidence: parseFloat(Math.random().toFixed(2)),
              inspectionArea: "N/A",
              imageUrl: null,
            },
          });
        } else {
          // MOCK_DEVICES에서 직접 로드 시 상세 정보 생성
          const mock = (MOCK_DEVICES as any[]).find((d) => d.id === deviceId);
          if (mock) {
            setDetail({
              deviceId: mock.id,
              batchId: `BATCH_${Math.floor(Math.random() * 10000)}`,
              modelName: mock.name,
              sequence: Math.floor(Math.random() * 1000),
              machineStatus: (mock.status === "OFF"
                ? "STOP"
                : mock.status) as MachineStatus,
              temperature: parseFloat(
                (Math.random() * (30 - 20) + 20).toFixed(1),
              ),
              vibrationX: parseFloat(
                (Math.random() * (0.5 - 0.1) + 0.1).toFixed(2),
              ),
              vibrationY: parseFloat(
                (Math.random() * (0.5 - 0.1) + 0.1).toFixed(2),
              ),
              illumination: Math.floor(Math.random() * (1000 - 300) + 300),
              timestamp: new Date().toISOString(),
              statusInfos: [],
              visionResult: {
                result: (Math.random() > 0.8 ? "NG" : "OK") as VisionResult,
                defectType: "N/A",
                confidence: parseFloat(Math.random().toFixed(2)),
                inspectionArea: "N/A",
                imageUrl: null,
              },
            });
          }
        }
      }
      setLoading(false);
    };

    const interval = setInterval(updateDetail, 1000);
    updateDetail();

    return () => clearInterval(interval);
  }, [deviceId]);

  const handleResolveError = async () => {
    if (!detail || !deviceId) return;

    await resolveDeviceError(deviceId);
    await resolveAlertByDeviceId(deviceId);

    const updatedSummary = {
      deviceId: detail.deviceId,
      modelName: detail.modelName,
      machineStatus: "RUN" as MachineStatus,
      timestamp: new Date().toISOString(),
      visionResult: "OK" as VisionResult,
      severity: "LOW" as Severity,
      lastSequence: detail.sequence,
    };
    deviceStore.update(updatedSummary);
    setDetail((prev) =>
      prev ? { ...prev, machineStatus: "RUN", statusInfos: [] } : null,
    );
    router.back();
  };

  if (loading || !detail) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>장비 상세 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLOR[detail.machineStatus] || "#94A3B8";
  const isError = detail.machineStatus === "ERROR";

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={EQ_COLORS.headerBg}
      />

      <Header />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusBadgeText}>
              {STATUS_LABEL[detail.machineStatus] || "알 수 없음"}
            </Text>
          </View>
          <Text style={styles.deviceId}>{detail.deviceId}</Text>
          <Text style={styles.modelName}>{detail.modelName}</Text>
          <Text style={styles.timestamp}>
            최근 업데이트:{" "}
            {detail.timestamp
              ? detail.timestamp.includes("T")
                ? detail.timestamp.split("T")[1].split(".")[0]
                : detail.timestamp
              : "-"}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>주요 정보</Text>
          <View style={styles.divider} />
          <InfoRow label="배치 ID" value={detail.batchId} />
          <InfoRow label="시퀀스" value={String(detail.sequence)} />
          <InfoRow
            label="비전 결과"
            value={detail.visionResult.result}
            valueColor={
              detail.visionResult.result === "NG"
                ? EQ_COLORS.ngRed
                : EQ_COLORS.okGreen
            }
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>센서 데이터</Text>
          <View style={styles.divider} />
          <InfoRow label="온도" value={`${detail.temperature.toFixed(1)}°C`} />
          <InfoRow
            label="진동 (X/Y)"
            value={`${detail.vibrationX.toFixed(2)} / ${detail.vibrationY.toFixed(2)}`}
          />
          <InfoRow label="조도" value={`${detail.illumination} lux`} />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>
            상태 정보 ({detail.statusInfos.length})
          </Text>
          <View style={styles.divider} />
          {detail.statusInfos.length > 0 ? (
            detail.statusInfos.map((status, index) => (
              <View
                key={index}
                style={[
                  styles.statusItem,
                  {
                    borderLeftColor:
                      SEVERITY_COLOR[status.severity] || "#CBD5E1",
                  },
                ]}
              >
                <View style={styles.statusItemHeader}>
                  <Text style={styles.statusCode}>{status.code}</Text>
                  <View
                    style={[
                      styles.severityBadge,
                      {
                        backgroundColor:
                          SEVERITY_COLOR[status.severity] || "#CBD5E1",
                      },
                    ]}
                  >
                    <Text style={styles.severityText}>{status.severity}</Text>
                  </View>
                </View>
                <Text style={styles.statusMsg}>{status.msg}</Text>
                <View style={styles.chipRow}>
                  <Chip label={status.direction} />
                  <Chip label={status.partLocation} />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.statusMsg}>특이 사항 없음</Text>
          )}
        </View>

        {isError && (
          <TouchableOpacity
            style={styles.resolveErrorButton}
            onPress={handleResolveError}
          >
            <Text style={styles.resolveErrorButtonText}>오류 수정 완료</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({
  label,
  value,
  valueColor = EQ_COLORS.textPrimary,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, { color: valueColor }]}>{value}</Text>
  </View>
);

const Chip = ({ label }: { label: string }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: { marginTop: 10, fontSize: 14, color: "#64748B" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollView: { flex: 1, padding: 16 },
  statusSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: EQ_COLORS.headerBg,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusBadgeText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  deviceId: { fontSize: 26, fontWeight: "800", color: "#FFF" },
  modelName: { fontSize: 14, color: "#FFF", opacity: 0.8, marginTop: 4 },
  timestamp: { fontSize: 12, color: "#FFF", opacity: 0.6, marginTop: 10 },
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoLabel: { color: "#64748B", fontSize: 14 },
  infoValue: { fontWeight: "600", fontSize: 14, color: "#1E293B" },
  statusItem: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  statusItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statusCode: { fontWeight: "700", fontSize: 14, color: "#1E293B" },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  severityText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  statusMsg: { fontSize: 13, color: "#475569", marginBottom: 8 },
  chipRow: { flexDirection: "row", gap: 6 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  chipText: { fontSize: 10, color: "#64748B", fontWeight: "600" },
  resolveErrorButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  resolveErrorButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
