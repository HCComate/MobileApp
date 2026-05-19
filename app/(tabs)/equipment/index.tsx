import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  EQ_COLORS,
  SEVERITY_COLOR,
  STATUS_COLOR,
  STATUS_LABEL,
} from "../../../constants/equipmentConstants";
import { useDeviceData } from "../../../hooks/updateData";
import { deviceStore } from "../../../store/deviceStore";
import { DeviceSummary } from "../../../types/equipment";

const { width: SW } = Dimensions.get("window");
const GRID_PAGE_SIZE = 16;
const VIRTUAL_BUFFER = 4;

type ViewMode = "list" | "grid";

export default function EquipmentStatsScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(0);

  // 통합 훅 사용 (USE_API 플래그에 따라 목업/API 자동 전환)
  const devices = useDeviceData();

  const activeWindowRef = useRef<Set<string>>(new Set());
  const listRef = useRef<FlatList<DeviceSummary> | null>(null);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 30 });

  // 스토어 동기화 유지
  useEffect(() => {
    if (devices.length > 0) {
      deviceStore.setAll(devices);
    }
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
      for (let i = min; i <= max; i++) {
        if (devices[i]) next.add(devices[i].deviceId);
      }
      activeWindowRef.current = next;
    },
    [devices],
  );

  const totalPages = Math.max(1, Math.ceil(devices.length / GRID_PAGE_SIZE));
  const pageDevices = devices.slice(
    currentPage * GRID_PAGE_SIZE,
    (currentPage + 1) * GRID_PAGE_SIZE,
  );

  const goToDetail = useCallback(
    (deviceId: string) => {
      router.push(`/equipment/${deviceId}`);
    },
    [router],
  );

  // ── 목록 아이템 ──────────────────────────────
  const renderListItem = useCallback(
    ({ item }: { item: DeviceSummary }) => {
      const statusColor = STATUS_COLOR[item.machineStatus] || "#94A3B8";
      const isNG = item.visionResult === "NG";

      const timeStr = item.timestamp || "";
      const timeDisplay = timeStr.includes(" ")
        ? timeStr.split(" ")[1].slice(0, 8)
        : timeStr.includes("T")
          ? timeStr.split("T")[1].slice(0, 8)
          : timeStr.length >= 8
            ? timeStr.slice(0, 8)
            : "-";

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
                  {STATUS_LABEL[item.machineStatus] || "알 수 없음"}
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
              <SummaryItem label="시간" value={timeDisplay} />
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
    const statusColor = STATUS_COLOR[item.machineStatus] || "#94A3B8";
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
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={EQ_COLORS.headerBg}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>장비 통계</Text>
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
  gridCellNG: {
    backgroundColor: EQ_COLORS.cardNGBg,
    borderColor: EQ_COLORS.ngRed,
  },
  gridThumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  gridThumbIcon: { fontSize: 20 },
  gridId: { fontSize: 12, fontWeight: "700", color: EQ_COLORS.textPrimary },
  gridDot: { width: 6, height: 6, borderRadius: 3 },
  gridNGBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: EQ_COLORS.ngRed,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  gridNGText: { color: EQ_COLORS.white, fontSize: 8, fontWeight: "800" },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingBottom: 20,
  },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: EQ_COLORS.headerBg,
    borderRadius: 6,
  },
  pageBtnOff: { backgroundColor: EQ_COLORS.borderMuted },
  pageBtnText: { color: EQ_COLORS.white, fontSize: 12, fontWeight: "600" },
  dotRow: { alignItems: "center", gap: 8, paddingHorizontal: 10 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: EQ_COLORS.borderMuted,
  },
  dotOn: { backgroundColor: EQ_COLORS.headerBg, width: 12 },
});
