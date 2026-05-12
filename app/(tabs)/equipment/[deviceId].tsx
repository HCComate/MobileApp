import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  // SafeAreaView,
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
import { deviceStore } from "../../../store/deviceStore";
import { DeviceDetail, StatusInfo } from "../../../types/equipment";

const { width: SW } = Dimensions.get("window");

type CameraTab = "front" | "side" | "rear";
const CAM_TABS: { key: CameraTab; label: string }[] = [
  { key: "front", label: "전면" },
  { key: "side", label: "측면" },
  { key: "rear", label: "후면" },
];

export default function DeviceDetailScreen() {
  const router = useRouter();
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();

  const [detail, setDetail] = useState<DeviceDetail | null>(null);
  const [camTab, setCamTab] = useState<CameraTab>("front");
  const [loading, setLoading] = useState(true);

  // ⚠️ 테스트용: store 더미 상세 데이터 조회
  // TODO: 통신 연동 시 아래 블록을 API 호출로 교체
  //   try {
  //     const res  = await fetch(
  //       `http://서버IP:포트/api/devices/${deviceId}/detail`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     const data: DeviceDetail = await res.json();
  //     deviceStore.setDetail(data);
  //     setDetail(data);
  //   } catch (e) { setDetail(null); }
  //   finally     { setLoading(false); }
  useEffect(() => {
    const found = deviceStore.getDetail(deviceId);
    if (found) {
      setDetail(found);
      setLoading(false);
      return;
    }

    // 세부정보가 없을 때는 목록 요약에서 임시로 보완하여 표시
    const summary = deviceStore.get(deviceId);
    if (summary) {
      const partial: DeviceDetail = {
        deviceId: summary.deviceId,
        modelName: summary.modelName,
        batchId: "UNKNOWN",
        sequence: summary.lastSequence ?? 0,
        machineStatus: summary.machineStatus,
        temperature: 0,
        vibrationX: 0,
        vibrationY: 0,
        illumination: 0,
        humidity: 0,
        timestamp: summary.timestamp,
        statusInfos: [],
        visionResult: {
          result: (summary.visionResult ?? "OK") as any,
          defectType: "",
          confidence: 0,
          inspectionArea: "",
          imageUrl: null,
        },
      };
      setDetail(partial);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setDetail(deviceStore.getDetail(deviceId) ?? null);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [deviceId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={EQ_COLORS.actionBarBg} />
        <Text style={styles.loadingText}>장비 정보 불러오는 중…</Text>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <Text style={styles.loadingText}>장비를 찾을 수 없어요.</Text>
        <TouchableOpacity
          style={styles.backFallbackBtn}
          onPress={() => router.replace("/equipment")}
        >
          <Text style={styles.backFallbackText}>목록으로 돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLOR[detail.machineStatus];
  const isNG = detail.visionResult.result === "NG";

  // ⚠️ 테스트용: NG일 때 더미 imageUrl 표시
  // TODO: 통신 연동 시 서버에서 받은 imageUrl 그대로 사용
  const imageUrl = detail.visionResult.imageUrl;

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={EQ_COLORS.headerBg}
      />

      {/* 공통 헤더 추가 */}
      <Header />

      {/* 서브 헤더 (장비 상세 정보 및 뒤로가기) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/equipment")}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>{detail.deviceId} 상세 정보</Text>
          <Text style={styles.headerSub}>{detail.modelName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* 상태 배지 */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusBadgeText}>
              {STATUS_LABEL[detail.machineStatus]}
            </Text>
          </View>
          {isNG && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: EQ_COLORS.ngRed, marginLeft: 8 },
              ]}
            >
              <Text style={styles.statusBadgeText}>NG 불량 감지</Text>
            </View>
          )}
          <Text style={styles.seqText}>Seq #{detail.sequence}</Text>
        </View>

        {/* 카메라 이미지 */}
        <View style={styles.cameraCard}>
          <View style={styles.camTabRow}>
            {CAM_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.camTab, camTab === tab.key && styles.camTabOn]}
                onPress={() => setCamTab(tab.key)}
              >
                <Text
                  style={[
                    styles.camTabText,
                    camTab === tab.key && styles.camTabTextOn,
                  ]}
                >
                  {tab.label} 카메라
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.imageBox}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.cameraImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>
                  {camTab === "front"
                    ? "전면"
                    : camTab === "side"
                      ? "측면"
                      : "후면"}{" "}
                  카메라 이미지
                </Text>
                <Text style={styles.imagePlaceholderSub}>
                  이미지 수신 대기 중
                </Text>
              </View>
            )}
          </View>
          {isNG && (
            <View style={styles.defectBanner}>
              <Text style={styles.defectText}>
                🔴 결함: {detail.visionResult.defectType} | 위치:{" "}
                {detail.visionResult.inspectionArea} | 신뢰도:{" "}
                {(detail.visionResult.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          )}
        </View>

        {/* 비전 검사 결과 */}
        <SectionCard title="비전 검사 결과">
          <InfoRow
            label="결과"
            value={detail.visionResult.result}
            valueColor={isNG ? EQ_COLORS.ngRed : EQ_COLORS.okGreen}
          />
          <InfoRow label="결함 유형" value={detail.visionResult.defectType} />
          <InfoRow
            label="신뢰도"
            value={`${(detail.visionResult.confidence * 100).toFixed(1)}%`}
          />
          <InfoRow
            label="검사 영역"
            value={detail.visionResult.inspectionArea}
          />
        </SectionCard>

        {/* 센서 데이터 */}
        <SectionCard title="센서 데이터">
          <InfoRow label="온도" value={`${detail.temperature.toFixed(1)} °C`} />
          <InfoRow label="진동 X" value={`${detail.vibrationX.toFixed(3)} g`} />
          <InfoRow label="진동 Y" value={`${detail.vibrationY.toFixed(3)} g`} />
          <InfoRow label="조도" value={`${detail.illumination} lux`} />
          <InfoRow label="습도" value={`${detail.humidity.toFixed(1)} %`} />
        </SectionCard>

        {/* 상태 코드 */}
        <SectionCard title={`상태 코드 (${detail.statusInfos.length}건)`}>
          {detail.statusInfos.map((info, idx) => (
            <StatusInfoItem key={idx} info={info} />
          ))}
        </SectionCard>

        {/* 배치 정보 */}
        <SectionCard title="배치 정보">
          <InfoRow label="장비 ID" value={detail.deviceId} />
          <InfoRow label="모델명" value={detail.modelName} />
          <InfoRow label="배치 ID" value={detail.batchId} />
          <InfoRow label="타임스탬프" value={detail.timestamp} />
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── 소형 컴포넌트 ─────────────────────────────────
const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.divider} />
    {children}
  </View>
);

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

const StatusInfoItem = ({ info }: { info: StatusInfo }) => (
  <View
    style={[
      styles.statusItem,
      { borderLeftColor: SEVERITY_COLOR[info.severity] },
    ]}
  >
    <View style={styles.statusItemHeader}>
      <Text style={styles.statusCode}>{info.code}</Text>
      <View
        style={[
          styles.severityBadge,
          { backgroundColor: SEVERITY_COLOR[info.severity] },
        ]}
      >
        <Text style={styles.severityText}>{info.severity}</Text>
      </View>
    </View>
    <Text style={styles.statusMsg}>{info.msg}</Text>
    <View style={styles.chipRow}>
      <Chip label={info.direction} />
      <Chip label={info.partLocation} />
      {info.isCaptureRequired && (
        <Chip label="촬영 필요" color={EQ_COLORS.ngRed} />
      )}
    </View>
  </View>
);

const Chip = ({
  label,
  color = EQ_COLORS.textSecondary,
}: {
  label: string;
  color?: string;
}) => (
  <View style={[styles.chip, { borderColor: color }]}>
    <Text style={[styles.chipText, { color }]}>{label}</Text>
  </View>
);

// ── 스타일 ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: EQ_COLORS.pageBg },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: EQ_COLORS.pageBg,
    gap: 16,
  },
  loadingText: { color: EQ_COLORS.textSecondary, fontSize: 14 },
  backFallbackBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: EQ_COLORS.actionBarBg,
    borderRadius: 8,
  },
  backFallbackText: { color: EQ_COLORS.white, fontSize: 14, fontWeight: "600" },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: EQ_COLORS.headerBg,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  backBtn: { width: 40, alignItems: "center" },
  backBtnText: { color: EQ_COLORS.white, fontSize: 28, lineHeight: 30 },
  headerTitle: { color: EQ_COLORS.white, fontSize: 16, fontWeight: "700" },
  headerSub: { color: "#93C5FD", fontSize: 11, marginTop: 2 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  statusBadgeText: { color: EQ_COLORS.white, fontSize: 12, fontWeight: "700" },
  seqText: { marginLeft: "auto", color: EQ_COLORS.textMuted, fontSize: 12 },
  cameraCard: {
    backgroundColor: EQ_COLORS.cardBg,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  camTabRow: { flexDirection: "row", backgroundColor: "#F1F5F9" },
  camTab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  camTabOn: {
    backgroundColor: EQ_COLORS.actionBarBg,
    borderBottomWidth: 2,
    borderBottomColor: EQ_COLORS.toggleActiveBg,
  },
  camTabText: {
    fontSize: 12,
    color: EQ_COLORS.textSecondary,
    fontWeight: "600",
  },
  camTabTextOn: { color: EQ_COLORS.white },
  imageBox: { height: SW * 0.65, backgroundColor: EQ_COLORS.imageBg },
  cameraImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imagePlaceholderIcon: { fontSize: 48 },
  imagePlaceholderText: {
    color: EQ_COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  imagePlaceholderSub: { color: EQ_COLORS.textSecondary, fontSize: 11 },
  defectBanner: {
    backgroundColor: EQ_COLORS.defectBannerBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  defectText: { color: EQ_COLORS.ngRed, fontSize: 12, fontWeight: "600" },
  sectionCard: {
    backgroundColor: EQ_COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: EQ_COLORS.headerBg },
  divider: {
    height: 1,
    backgroundColor: EQ_COLORS.divider,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: { fontSize: 13, color: EQ_COLORS.textSecondary },
  infoValue: { fontSize: 13, fontWeight: "600" },
  statusItem: { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 12, gap: 4 },
  statusItemHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusCode: { fontSize: 13, fontWeight: "700", color: EQ_COLORS.textPrimary },
  severityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  severityText: { color: EQ_COLORS.white, fontSize: 10, fontWeight: "700" },
  statusMsg: { fontSize: 12, color: EQ_COLORS.textSecondary, lineHeight: 18 },
  chipRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  chip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipText: { fontSize: 10, fontWeight: "600" },
});
