import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert as RNAlert,
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
import { useLogData } from "../../../hooks/updateData";
import { resolveDeviceError } from "../../../mock/Logs";
import {
  getActiveAlertByDeviceId,
  isCurrentUserAcceptor,
  resolveAlertByDeviceId,
} from "../../../services/alertManager";
import {
  DeviceDetail,
  Direction,
  MachineStatus,
  VisionStatus,
} from "../../../types/equipment";
import apiClient from "../../../services/apiClient"; // api 대신 apiClient 사용 권장 (baseURL 설정 반영)

export default function DeviceDetailScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const router = useRouter();
  const logs = useLogData();
  
  const [showResolveButton, setShowResolveButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverDevice, setServerDevice] = useState<DeviceDetail | null>(null);

  // 1. 서버 데이터 fetch 로직 (사용자 제안 디버깅 로그 포함)
  useEffect(() => {
    console.log("상세 페이지 진입 - 장비 ID:", deviceId);

    const fetchDetail = async () => {
      if (!deviceId) return;
      
      try {
        console.log("데이터 요청 시작 (URL: /api/devices/" + deviceId + "/detail)...");
        // 주의: 분석 결과 서버 경로는 /api/devices/{id}/detail 입니다.
        const response = await apiClient.get(`/api/devices/${deviceId}/detail`);
        
        console.log("데이터 수신 성공 (Raw):", response.data);
        
        // MobileServer는 ApiResponse 래퍼를 사용하므로 response.data.data를 확인해야 함
        const actualData = response.data.success ? response.data.data : response.data;
        console.log("실제 데이터 추출:", actualData);
        
        setServerDevice(actualData);
      } catch (error: any) {
        console.error("데이터 요청 실패:", error);
        console.error("에러 상세:", error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [deviceId]);

  // 2. 알림 해결 버튼 권한 체크
  useEffect(() => {
    if (deviceId) {
      const activeAlert = getActiveAlertByDeviceId(deviceId);
      if (activeAlert && activeAlert.acceptedBy) {
        const isAcceptor = isCurrentUserAcceptor(
          activeAlert.alertEvent.alertId,
        );
        setShowResolveButton(isAcceptor);
      } else {
        setShowResolveButton(false);
      }
    }
  }, [logs, deviceId]);

  // 3. 렌더링용 데이터 결정 (서버 데이터 우선, 없으면 로그 데이터에서 매핑)
  const detail: DeviceDetail | null = useMemo(() => {
    if (serverDevice) return serverDevice;

    const currentDeviceLog = logs.find((l) => l.header?.device_id === deviceId);
    if (!currentDeviceLog) return null;

    const body = currentDeviceLog.body;
    return {
      deviceId: deviceId as string,
      batchId: currentDeviceLog.header.batch_id,
      modelName: currentDeviceLog.header.model_name,
      sequence: body.sequence,
      machineStatus: body.machine_status as MachineStatus,
      temperature: body.sensor_data.temperature,
      vibrationX: body.sensor_data.vibration_x,
      vibrationY: body.sensor_data.vibration_y,
      illumination: body.sensor_data.illumination,
      humidity: body.sensor_data.humidity || 0,
      timestamp: body.timestamp,
      statusInfos: body.status_info.map((info) => ({
        code: info.code,
        msg: info.msg,
        severity: info.severity,
        direction: info.direction as Direction,
        partLocation: info.part_location as string,
        isCaptureRequired: info.is_capture_required,
      })),
      visionResult: {
        result: body.vision_result.result as VisionStatus,
        defectType: body.vision_result.defect_type,
        confidence: body.vision_result.confidence,
        inspectionArea: body.vision_result.inspection_area,
        imageUrl: body.vision_result.image_url,
      },
    };
  }, [serverDevice, logs, deviceId]);

  const handleResolveError = async () => {
    if (!deviceId) return;
    try {
      await resolveAlertByDeviceId(deviceId);
      await resolveDeviceError(deviceId);
      setShowResolveButton(false);
      RNAlert.alert("알림", "오류 수정이 완료되었습니다.");
    } catch (error) {
      console.error("[DeviceDetail] 오류 수정 처리 실패:", error);
      RNAlert.alert("오류", "처리에 실패했습니다.");
    }
  };

  // 로딩 상태 표시
  if (isLoading && !detail) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10, color: "#64748B" }}>장비 데이터를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  // 데이터 없음 표시
  if (!detail) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: "#64748B" }}>장비 정보를 찾을 수 없습니다.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: "#3B82F6" }}>뒤로 가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLOR[detail.machineStatus] || "#94A3B8";

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
              {STATUS_LABEL[detail.machineStatus]}
            </Text>
          </View>
          <Text style={styles.deviceId}>{detail.deviceId}</Text>
          <Text style={styles.modelName}>{detail.modelName}</Text>
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
          <InfoRow
            label="조도"
            value={`${detail.illumination.toFixed(3)} lux`}
          />
          <InfoRow label="습도" value={`${(detail.humidity ?? 0).toFixed(3)} %`} />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>
            상태 정보 ({detail.statusInfos.length})
          </Text>
          <View style={styles.divider} />
          {detail.statusInfos.map((status, index) => (
            <View
              key={index}
              style={[
                styles.statusItem,
                {
                  borderLeftColor: SEVERITY_COLOR[status.severity] || "#CBD5E1",
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
            </View>
          ))}
        </View>

        {showResolveButton && (
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
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
  statusMsg: { fontSize: 13, color: "#475569" },
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