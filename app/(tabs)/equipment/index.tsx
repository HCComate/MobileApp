import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  // SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
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
import { DeviceSummary } from "../../../types/equipment";

// ⚠️ 테스트용 더미 데이터
// TODO: 통신 연동 시 아래 import 제거 후 API 호출로 교체
import {
  generateMockDetails,
  generateMockSummaries,
} from "../../../mock/deviceMocks";

const { width: SW } = Dimensions.get("window");
const GRID_PAGE_SIZE = 16;
const VIRTUAL_BUFFER = 4;

type ViewMode = "list" | "grid";

export default function EquipmentStatsScreen() {
  const router = useRouter();

  // ⚠️ 테스트용: 더미 데이터로 초기화
  // TODO: 통신 연동 시 useState([]) 로 시작하고 API/WebSocket 수신으로 채우기
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [devices, setDevices] = useState<DeviceSummary[]>(
    generateMockSummaries,
  );
  const [currentPage, setCurrentPage] = useState(0);

  const activeWindowRef = useRef<Set<string>>(new Set());
  const listRef = useRef<FlatList<DeviceSummary> | null>(null);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 30 });

  // ⚠️ 테스트용: 더미 상세 데이터 store 등록
  // TODO: 통신 연동 시 이 블록 제거
  //       상세 데이터는 [deviceId].tsx 에서 API 직접 호출
  useEffect(() => {
    const details = generateMockDetails();
    console.log(
      "[EquipmentStats] registering mock details, count=",
      details.length,
      "firstId=",
      details[0]?.deviceId,
    );
    deviceStore.setAllDetails(details);
  }, []);

  // 요약 목록 변경 시 store 동기화
  useEffect(() => {
    deviceStore.setAll(devices);
  }, [devices]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems.length) return;
      const indices = viewableItems.map((v) => v.index ?? 0);
      const min = Math.max(0, Math.min(...indices) - VIRTUAL_BUFFER);
      const max = Math.min(
        devices.length - 1,
        Math.max(...indices) + VIRTUAL_BUFFER,
      );
      const next = new Set<string>();
      for (let i = min; i <= max; i++) next.add(devices[i].deviceId);
      activeWindowRef.current = next;
    },
    [devices],
  );

  // TODO: 통신 연동 시 이 함수를 WebSocket/Socket.IO 수신 콜백에 연결
  //   socket.on('deviceUpdate', (raw) => {
  //     const summary: DeviceSummary = {
  //       deviceId:      raw.header.device_id,
  //       modelName:     raw.header.model_name,
  //       machineStatus: raw.body.machine_status,
  //       timestamp:     raw.body.timestamp,
  //       visionResult:  raw.body.vision_result.result,
  //       severity:      raw.body.status_info[0]?.severity ?? 'LOW',
  //       lastSequence:  raw.body.sequence,
  //     };
  //     deviceStore.setDetail({ deviceId: raw.header.device_id, ... });
  //     handleIncomingData(summary);
  //   });
  // const handleIncomingData = useCallback((incoming: DeviceSummary) => {
  //   if (!activeWindowRef.current.has(incoming.deviceId)) return;
  //   setDevices((prev) =>
  //     prev.map((d) =>
  //       d.deviceId === incoming.deviceId ? { ...d, ...incoming } : d,
  //     ),
  //   );
  // }, []);

  const totalPages = Math.max(1, Math.ceil(devices.length / GRID_PAGE_SIZE));
  const pageDevices = devices.slice(
    currentPage * GRID_PAGE_SIZE,
    (currentPage + 1) * GRID_PAGE_SIZE,
  );

  const goToDetail = useCallback(
    (deviceId: string) => {
      try {
        const d = deviceStore.getDetail(deviceId);
        const s = deviceStore.get(deviceId);
        console.log("[EquipmentStats] goToDetail", deviceId, {
          detailFound: !!d,
          detail: d,
          summary: s,
        });
      } catch (e) {
        console.debug("[EquipmentStats] goToDetail error", e);
      }
      router.push(`/equipment/${deviceId}`);
    },
    [router],
  );

  // ── 목록 아이템 ──────────────────────────────
  const renderListItem = useCallback(
    ({ item }: { item: DeviceSummary }) => {
      const statusColor = STATUS_COLOR[item.machineStatus];
      const isNG = item.visionResult === "NG";
      return (
        <TouchableOpacity
          style={[
            styles.listCard,
            { borderLeftColor: statusColor },
            isNG && styles.listCardNG,
          ]}
          onPress={() => goToDetail(item.deviceId)}
          activeOpacity={0.75}
        >
          <View style={styles.listThumb}>
            <Text style={styles.thumbIcon}>🎥</Text>
          </View>
          <View style={styles.listBody}>
            <View style={styles.listRow}>
              <Text style={styles.deviceIdText}>{item.deviceId}</Text>
              <View style={[styles.badge, { backgroundColor: statusColor }]}>
                <Text style={styles.badgeText}>
                  {STATUS_LABEL[item.machineStatus]}
                </Text>
              </View>
            </View>
            <Text style={styles.modelName}>{item.modelName}</Text>
            <View style={styles.summaryGrid}>
              <SummaryItem
                label="Seq"
                value={String(item.lastSequence ?? "-")}
              />
              <SummaryItem
                label="비전 결과"
                value={item.visionResult ?? "-"}
                valueColor={isNG ? EQ_COLORS.ngRed : EQ_COLORS.okGreen}
              />
              <SummaryItem
                label="심각도"
                value={item.severity ?? "-"}
                valueColor={
                  item.severity
                    ? SEVERITY_COLOR[item.severity]
                    : EQ_COLORS.textMuted
                }
              />
              <SummaryItem label="시간" value={item.timestamp.slice(11, 19)} />
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      );
    },
    [goToDetail],
  );

  // ── 그리드 아이템 ─────────────────────────────
  const renderGridItem = (item: DeviceSummary) => {
    const statusColor = STATUS_COLOR[item.machineStatus];
    const isNG = item.visionResult === "NG";
    const shortId = item.deviceId.replace("RASP_PI_", "#");
    return (
      <TouchableOpacity
        key={item.deviceId}
        style={[
          styles.gridCell,
          { borderColor: statusColor },
          isNG && styles.gridCellNG,
        ]}
        onPress={() => goToDetail(item.deviceId)}
        activeOpacity={0.75}
      >
        <View
          style={[styles.gridThumb, { backgroundColor: statusColor + "22" }]}
        >
          <Text style={styles.gridThumbIcon}>🎥</Text>
        </View>
        <Text style={styles.gridId} numberOfLines={1}>
          {shortId}
        </Text>
        <View style={[styles.gridDot, { backgroundColor: statusColor }]} />
        {isNG && (
          <View style={styles.gridNGBadge}>
            <Text style={styles.gridNGText}>NG</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={EQ_COLORS.headerBg}
      />

      <Header />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/");
            }
          }}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>장비 모니터링</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.actionBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <ActionBtn label="+ 추가" onPress={() => {}} />
          <ActionBtn label="삭제" onPress={() => {}} />
          <ActionBtn label="필터" onPress={() => {}} />
          <ActionBtn label="정렬 ↕" onPress={() => {}} />
        </ScrollView>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === "list" && styles.toggleBtnOn,
            ]}
            onPress={() => setViewMode("list")}
          >
            <Text
              style={[
                styles.toggleIcon,
                viewMode === "list" && styles.toggleIconOn,
              ]}
            >
              ☰
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === "grid" && styles.toggleBtnOn,
            ]}
            onPress={() => setViewMode("grid")}
          >
            <Text
              style={[
                styles.toggleIcon,
                viewMode === "grid" && styles.toggleIconOn,
              ]}
            >
              ⊞
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.countBar}>
        <Text style={styles.countText}>전체 {devices.length}개 장비</Text>
        {viewMode === "grid" && (
          <Text style={styles.countText}>
            {currentPage + 1} / {totalPages} 페이지
          </Text>
        )}
      </View>
      {viewMode === "list" ? (
        <FlatList
          ref={listRef}
          data={devices}
          renderItem={renderListItem}
          keyExtractor={(item) => item.deviceId}
          contentContainerStyle={styles.listContent}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          windowSize={5}
          maxToRenderPerBatch={5}
          initialNumToRender={6}
          updateCellsBatchingPeriod={100}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.gridContainer}>
          <View style={styles.gridWrapper}>
            {pageDevices.map((d) => renderGridItem(d))}
          </View>
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, currentPage === 0 && styles.pageBtnOff]}
              disabled={currentPage === 0}
              onPress={() => setCurrentPage((p) => p - 1)}
            >
              <Text style={styles.pageBtnText}>‹ 이전</Text>
            </TouchableOpacity>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dotRow}
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dot, i === currentPage && styles.dotOn]}
                  onPress={() => setCurrentPage(i)}
                />
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.pageBtn,
                currentPage === totalPages - 1 && styles.pageBtnOff,
              ]}
              disabled={currentPage === totalPages - 1}
              onPress={() => setCurrentPage((p) => p + 1)}
            >
              <Text style={styles.pageBtnText}>다음 ›</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const ActionBtn = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <Text style={styles.actionBtnText}>{label}</Text>
  </TouchableOpacity>
);

const SummaryItem = ({
  label,
  value,
  valueColor = EQ_COLORS.textPrimary,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryLabel}>{label} </Text>
    <Text style={[styles.summaryValue, { color: valueColor }]}>{value}</Text>
  </View>
);

const CELL = (SW - 32 - 9 * 3) / 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: EQ_COLORS.pageBg },
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
  headerTitle: { color: EQ_COLORS.white, fontSize: 18, fontWeight: "700" },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: EQ_COLORS.actionBarBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: EQ_COLORS.actionBtnBg,
    borderRadius: 6,
    marginRight: 6,
  },
  actionBtnText: { color: EQ_COLORS.white, fontSize: 12, fontWeight: "600" },
  toggle: {
    flexDirection: "row",
    backgroundColor: EQ_COLORS.headerBg,
    borderRadius: 8,
    overflow: "hidden",
    marginLeft: 8,
  },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  toggleBtnOn: { backgroundColor: EQ_COLORS.toggleActiveBg },
  toggleIcon: { color: EQ_COLORS.textMuted, fontSize: 18 },
  toggleIconOn: { color: EQ_COLORS.headerBg },
  countBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: EQ_COLORS.countBarBg,
  },
  countText: { fontSize: 12, color: EQ_COLORS.textSecondary },
  listContent: { padding: 12, gap: 10 },
  listCard: {
    flexDirection: "row",
    backgroundColor: EQ_COLORS.cardBg,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    gap: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  listCardNG: { backgroundColor: EQ_COLORS.cardNGBg },
  listThumb: {
    width: 64,
    height: 64,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbIcon: { fontSize: 28 },
  listBody: { flex: 1, gap: 4 },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deviceIdText: {
    fontSize: 14,
    fontWeight: "700",
    color: EQ_COLORS.textPrimary,
  },
  modelName: { fontSize: 12, color: EQ_COLORS.textSecondary },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: EQ_COLORS.white, fontSize: 11, fontWeight: "600" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  summaryItem: { width: "48%", flexDirection: "row" },
  summaryLabel: { fontSize: 11, color: EQ_COLORS.textMuted },
  summaryValue: { fontSize: 11, fontWeight: "600" },
  chevron: { fontSize: 22, color: EQ_COLORS.borderMuted },
  gridContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  gridWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  gridCell: {
    width: CELL,
    height: CELL + 24,
    backgroundColor: EQ_COLORS.cardBg,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  gridCellNG: { backgroundColor: EQ_COLORS.cardNGBg },
  gridThumb: {
    width: CELL - 16,
    height: CELL - 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  gridThumbIcon: { fontSize: 22 },
  gridId: { fontSize: 10, fontWeight: "700", color: EQ_COLORS.textPrimary },
  gridDot: { width: 8, height: 8, borderRadius: 4 },
  gridNGBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: EQ_COLORS.ngRed,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  gridNGText: { color: EQ_COLORS.white, fontSize: 9, fontWeight: "700" },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: EQ_COLORS.actionBarBg,
    borderRadius: 8,
  },
  pageBtnOff: { backgroundColor: EQ_COLORS.borderMuted },
  pageBtnText: { color: EQ_COLORS.white, fontSize: 13, fontWeight: "600" },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: EQ_COLORS.borderMuted,
  },
  dotOn: { backgroundColor: EQ_COLORS.actionBarBg, width: 20, borderRadius: 4 },
});
