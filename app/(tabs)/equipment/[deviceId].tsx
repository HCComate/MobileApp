import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert as RNAlert,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
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
  subscribeAlertChanges,
} from "../../../services/alertManager";
import apiClient from "../../../services/apiClient"; // api 대신 apiClient 사용 권장 (baseURL 설정 반영)
import {
  DeviceDetail,
  Direction,
  MachineStatus,
  VisionStatus,
} from "../../../types/equipment";

export default function DeviceDetailScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const router = useRouter();
  const logs = useLogData();
  const theme = useColorScheme() ?? "light";

  const [showResolveButton, setShowResolveButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverDevice, setServerDevice] = useState<DeviceDetail | null>(null);

  // 1. 서버 데이터 fetch + 5초 폴링
  useEffect(() => {
    if (!deviceId) return;

    const fetchDetail = async () => {
      try {
        const response = await apiClient.get(`/api/devices/${deviceId}/detail`);
        const actualData = response.data.success ? response.data.data : response.data;
        if (actualData) setServerDevice(actualData);
      } catch (error: any) {
        console.error("장비 상세 데이터 요청 실패:", error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
    const interval = setInterval(fetchDetail, 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  // 2. 알림 해결 버튼 권한 체크
  const checkResolveButton = React.useCallback(() => {
    if (!deviceId) return;
    const activeAlert = getActiveAlertByDeviceId(deviceId);
    if (activeAlert && activeAlert.acceptedBy) {
      setShowResolveButton(isCurrentUserAcceptor(activeAlert.alertEvent.alertId));
    } else {
      setShowResolveButton(false);
    }
  }, [deviceId]);

  useEffect(() => {
    checkResolveButton();
  }, [logs, checkResolveButton]);

  useEffect(() => {
    // 알람 수락 시 즉시 버튼 갱신
    return subscribeAlertChanges(checkResolveButton);
  }, [checkResolveButton]);

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
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <ThemedText style={{ marginTop: 10 }}>
          장비 데이터를 불러오는 중...
        </ThemedText>
      </SafeAreaView>
    );
  }

  // 데이터 없음 표시
  if (!detail) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <ThemedText>장비 정보를 찾을 수 없습니다.</ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <ThemedText style={{ color: "#3B82F6" }}>뒤로 가기</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLOR[detail.machineStatus] || "#94A3B8";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={EQ_COLORS.headerBg}
      />
      <Header />
      <ThemedView style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statusSection}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <ThemedText style={styles.statusBadgeText}>
                {STATUS_LABEL[detail.machineStatus]}
              </ThemedText>
            </View>
            <ThemedText style={styles.deviceId}>{detail.deviceId}</ThemedText>
            <ThemedText style={styles.modelName}>{detail.modelName}</ThemedText>
          </View>

          <ThemedView style={styles.infoCard}>
            <ThemedText style={styles.cardTitle}>주요 정보</ThemedText>
            <View
              style={[
                styles.divider,
                { backgroundColor: Colors[theme].border },
              ]}
            />
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
          </ThemedView>

          <ThemedView style={styles.infoCard}>
            <ThemedText style={styles.cardTitle}>센서 데이터</ThemedText>
            <View
              style={[
                styles.divider,
                { backgroundColor: Colors[theme].border },
              ]}
            />
            <InfoRow
              label="온도"
              value={`${(detail.temperature ?? 0).toFixed(1)}°C`}
            />
            <InfoRow
              label="진동 (X/Y)"
              value={`${(detail.vibrationX ?? 0).toFixed(2)} / ${(detail.vibrationY ?? 0).toFixed(2)}`}
            />
            <InfoRow
              label="조도"
              value={`${(detail.illumination ?? 0).toFixed(3)} lux`}
            />
            <InfoRow
              label="습도"
              value={`${(detail.humidity ?? 0).toFixed(3)} %`}
            />
          </ThemedView>

          <ThemedView style={styles.infoCard}>
            <ThemedText style={styles.cardTitle}>
              상태 정보 ({detail.statusInfos.length})
            </ThemedText>
            <View
              style={[
                styles.divider,
                { backgroundColor: Colors[theme].border },
              ]}
            />
            {detail.statusInfos.map((status, index) => (
              <View
                key={index}
                style={[
                  styles.statusItem,
                  {
                    borderLeftColor:
                      SEVERITY_COLOR[status.severity] || "#CBD5E1",
                    backgroundColor: Colors[theme].background,
                  },
                ]}
              >
                <View style={styles.statusItemHeader}>
                  <ThemedText style={styles.statusCode}>
                    {status.code}
                  </ThemedText>
                  <View
                    style={[
                      styles.severityBadge,
                      {
                        backgroundColor:
                          SEVERITY_COLOR[status.severity] || "#CBD5E1",
                      },
                    ]}
                  >
                    <ThemedText style={styles.severityText}>
                      {status.severity}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.statusMsg}>{status.msg}</ThemedText>
              </View>
            ))}
          </ThemedView>

          {showResolveButton && (
            <TouchableOpacity
              style={styles.resolveErrorButton}
              onPress={handleResolveError}
            >
              <ThemedText style={styles.resolveErrorButtonText}>
                오류 수정 완료
              </ThemedText>
            </TouchableOpacity>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const InfoRow = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.infoRow}>
    <ThemedText style={styles.infoLabel}>{label}</ThemedText>
    <ThemedText style={[styles.infoValue, { color: valueColor || undefined }]}>
      {value}
    </ThemedText>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: { flex: 1 },
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  divider: { height: 1, marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontWeight: "600", fontSize: 14 },
  statusItem: {
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
  statusCode: { fontWeight: "700", fontSize: 14 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  severityText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  statusMsg: { fontSize: 13 },
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
