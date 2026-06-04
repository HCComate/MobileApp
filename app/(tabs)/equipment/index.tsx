import { Stack, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VisionImage from "../../../components/VisionImage";
import {
  EQ_COLORS,
  SEVERITY_COLOR,
  STATUS_COLOR,
  STATUS_LABEL,
} from "../../../constants/equipmentConstants";
import { useDeviceData } from "../../../hooks/updateData";
import { deviceStore } from "../../../store/deviceStore";
import { DeviceSummary, MachineStatus } from "../../../types/equipment";
import { Colors } from "@/constants/Colors";

const { width: SW } = Dimensions.get("window");
const LIST_PAGE_SIZE = 5; // 리스트 모드용 페이지 사이즈 (5개씩)
const GRID_COLUMNS = 4; // 그리드 모드 열 수

type ViewMode = "list" | "grid";

// 필터 칩에 노출할 상태 순서 (문제 있는 상태를 먼저 노출)
const FILTERABLE_STATUSES: MachineStatus[] = [
  "ERROR",
  "LOCKED",
  "STOP",
  "STANDBY",
  "RUN",
  "IDLE",
];

// ── 정렬 ──────────────────────────────────────
type SortKey = "severity" | "status" | "time" | "id";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "severity", label: "심각도순" },
  { key: "status", label: "상태순" },
  { key: "time", label: "시간순" },
  { key: "id", label: "장비 ID순" },
];

// 기준 선택 시의 기본 방향 (심각/최신/문제 상태를 위로 오게)
const SORT_DEFAULT_DIR: Record<SortKey, SortDir> = {
  severity: "desc", // CRITICAL → LOW
  status: "asc", // ERROR/LOCKED 등 문제 상태 먼저
  time: "desc", // 최신 먼저
  id: "asc", // 오름차순
};

const SEVERITY_RANK: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

// 상태 정렬 우선순위 = 필터 칩 순서(문제 상태일수록 작은 값)
const statusRank = (status: MachineStatus) => {
  const i = FILTERABLE_STATUSES.indexOf(status);
  return i === -1 ? FILTERABLE_STATUSES.length : i;
};

export default function EquipmentStatsScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(0);
  // 선택된 상태 필터 (빈 배열 = 전체). 칩 토글로 다중 선택.
  const [statusFilter, setStatusFilter] = useState<MachineStatus[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  // 정렬 (null = 기본순/원본 순서). 단일 기준 + 방향.
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showSort, setShowSort] = useState(false);
  const theme = useColorScheme() ?? "light";
  const isDark = theme === "dark"; // 다크모드 여부 변수화

  // 통합 훅 사용 (USE_API 플래그에 따라 목업/API 자동 전환)
  const devices = useDeviceData();

  const listRef = useRef<FlatList<DeviceSummary> | null>(null);

  // 스토어 내부 get 구조를 활용한 이미지 동기화 보존
  useEffect(() => {
    if (devices.length > 0) {
      const mergedDevices: DeviceSummary[] = devices.map((serverDev) => {
        const existStoreDev = deviceStore.get(serverDev.deviceId);
        return {
          ...serverDev,
          imageUrl: serverDev.imageUrl || existStoreDev?.imageUrl || undefined,
          visionResult: serverDev.visionResult || existStoreDev?.visionResult,
          defectType: serverDev.defectType || existStoreDev?.defectType || undefined,
        };
      });
      deviceStore.setAll(mergedDevices);
    }
  }, [devices]);

  // ── 데이터 파이프라인 ────────────────────────────
  const filteredDevices = useMemo(() => {
    if (statusFilter.length === 0) return devices;
    return devices.filter((d) => statusFilter.includes(d.machineStatus));
  }, [devices, statusFilter]);

  const isFiltered = statusFilter.length > 0;

  const sortedDevices = useMemo(() => {
    if (!sortKey) return filteredDevices;
    const arr = [...filteredDevices];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "severity":
          cmp =
            (SEVERITY_RANK[a.severity] ?? 0) - (SEVERITY_RANK[b.severity] ?? 0);
          break;
        case "status":
          cmp = statusRank(a.machineStatus) - statusRank(b.machineStatus);
          break;
        case "time":
          cmp =
            new Date(a.timestamp || 0).getTime() -
            new Date(b.timestamp || 0).getTime();
          break;
        case "id":
          cmp = a.deviceId.localeCompare(b.deviceId);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filteredDevices, sortKey, sortDir]);

  // 필터 토글
  const toggleStatus = useCallback((status: MachineStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
    setCurrentPage(0);
  }, []);

  const clearFilter = useCallback(() => {
    setStatusFilter([]);
    setCurrentPage(0);
  }, []);

  // 정렬 기준 선택
  const selectSort = useCallback((key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDir(SORT_DEFAULT_DIR[key]);
      return key;
    });
    setCurrentPage(0);
  }, []);

  const clearSort = useCallback(() => {
    setSortKey(null);
    setCurrentPage(0);
  }, []);

  // 리스트 모드 페이지네이션
  const totalPages = Math.max(
    1,
    Math.ceil(sortedDevices.length / LIST_PAGE_SIZE),
  );
  useEffect(() => {
    if (currentPage > totalPages - 1) setCurrentPage(totalPages - 1);
  }, [currentPage, totalPages]);

  const pagedDevices = sortedDevices.slice(
    currentPage * LIST_PAGE_SIZE,
    (currentPage + 1) * LIST_PAGE_SIZE,
  );

  const getPageNumbers = () => {
    let start = Math.max(0, currentPage - 1);
    if (start > totalPages - 3) start = Math.max(0, totalPages - 3);
    const end = Math.min(totalPages, start + 3);
    return Array.from({ length: end - start }, (_, i) => start + i);
  };

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
            { 
              borderLeftColor: statusColor,
              backgroundColor: isNG ? (isDark ? "#451a1a" : EQ_COLORS.cardNGBg) : Colors[theme].background,
              borderColor: isDark ? Colors[theme].border : "transparent",
              borderWidth: isDark ? 1 : 0
            },
          ]}
          onPress={() => goToDetail(item.deviceId)}
          activeOpacity={0.75}
        >
          <VisionImage
            vision={{
              result: item.visionResult,
              defectType: item.defectType,
              imageUrl: item.imageUrl,
            }}
            iconSize={28}
            style={[styles.listThumb, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}
          />
          <View style={styles.listBody}>
            <View style={styles.listRow}>
              <Text style={[styles.deviceIdText, { color: Colors[theme].text }]}>{item.deviceId}</Text>
              <View style={[styles.badge, { backgroundColor: statusColor }]}>
                <Text style={styles.badgeText}>
                  {STATUS_LABEL[item.machineStatus] || "알 수 없음"}
                </Text>
              </View>
            </View>
            <Text style={[styles.modelName, { color: isDark ? "#94A3B8" : EQ_COLORS.textSecondary }]}>
              {item.modelName}
            </Text>
            <View style={styles.summaryGrid}>
              <SummaryItem
                label="Seq"
                value={String(item.lastSequence ?? "-")}
                valueColor={Colors[theme].text}
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
                    : Colors[theme].text
                }
              />
              <SummaryItem label="시간" value={timeDisplay} valueColor={Colors[theme].text} />
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      );
    },
    [goToDetail, theme, isDark],
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
          { 
            borderColor: isNG ? EQ_COLORS.ngRed : (isDark ? Colors[theme].border : statusColor),
            backgroundColor: isNG ? (isDark ? "#451a1a" : EQ_COLORS.cardNGBg) : Colors[theme].background 
          },
        ]}
        onPress={() => goToDetail(item.deviceId)}
        activeOpacity={0.75}
      >
        <VisionImage
          vision={{
            result: item.visionResult,
            defectType: item.defectType,
            imageUrl: item.imageUrl,
          }}
          iconSize={20}
          style={[styles.gridThumb, { backgroundColor: statusColor + "22" }]}
        />
        <Text style={[styles.gridId, { color: Colors[theme].text }]} numberOfLines={1}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={EQ_COLORS.headerBg}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
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
          <ActionBtn
            label={isFiltered ? `필터 (${statusFilter.length})` : "필터"}
            active={isFiltered || showFilter}
            onPress={() => {
              setShowFilter((v) => !v);
              setShowSort(false);
            }}
          />
          <ActionBtn
            label={
              sortKey
                ? `${SORT_OPTIONS.find((o) => o.key === sortKey)?.label} ${
                    sortDir === "asc" ? "↑" : "↓"
                  }`
                : "정렬 ↕"
            }
            active={!!sortKey || showSort}
            onPress={() => {
              setShowSort((v) => !v);
              setShowFilter(false);
            }}
          />
        </ScrollView>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === "list" && styles.toggleBtnOn,
            ]}
            onPress={() => {
              setViewMode("list");
              setCurrentPage(0);
            }}
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
            onPress={() => {
              setViewMode("grid");
              setCurrentPage(0);
            }}
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

      {showFilter && (
        <View
          style={[
            styles.filterPanel,
            {
              backgroundColor: isDark ? "#1e293b" : "#F8FAFC",
              borderBottomColor: isDark ? Colors[theme].border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.filterChipRow}>
            {FILTERABLE_STATUSES.map((status) => {
              const on = statusFilter.includes(status);
              const color = STATUS_COLOR[status];
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    {
                      borderColor: color,
                      backgroundColor: on ? color : "transparent",
                    },
                  ]}
                  onPress={() => toggleStatus(status)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: on ? "#FFFFFF" : color },
                    ]}
                  >
                    {STATUS_LABEL[status]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {isFiltered && (
            <TouchableOpacity
              style={styles.filterClearBtn}
              onPress={clearFilter}
            >
              <Text style={styles.filterClearText}>초기화 ✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showSort && (
        <View
          style={[
            styles.filterPanel,
            {
              backgroundColor: isDark ? "#1e293b" : "#F8FAFC",
              borderBottomColor: isDark ? Colors[theme].border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.filterChipRow}>
            {SORT_OPTIONS.map((opt) => {
              const on = sortKey === opt.key;
              const accent = EQ_COLORS.toggleActiveBg;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.filterChip,
                    {
                      borderColor: accent,
                      backgroundColor: on ? accent : "transparent",
                    },
                  ]}
                  onPress={() => selectSort(opt.key)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: on ? "#FFFFFF" : accent },
                    ]}
                  >
                    {opt.label}
                    {on ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {sortKey && (
            <TouchableOpacity style={styles.filterClearBtn} onPress={clearSort}>
              <Text style={styles.filterClearText}>기본순 ✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={[styles.countBar, { backgroundColor: isDark ? "#1e293b" : EQ_COLORS.countBarBg }]}>
        <Text style={[styles.countText, { color: isDark ? "#94A3B8" : EQ_COLORS.textSecondary }]}>
          {isFiltered
            ? `전체 ${devices.length}개 중 ${filteredDevices.length}개`
            : `전체 ${devices.length}개 장비`}
        </Text>
      </View>

      {viewMode === "list" ? (
        <View style={{ flex: 1 }}>
          <FlatList
            ref={listRef}
            data={pagedDevices}
            renderItem={renderListItem}
            keyExtractor={(item) => item.deviceId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, currentPage === 0 && styles.pageBtnOff]}
              disabled={currentPage === 0}
              onPress={() => setCurrentPage((p) => p - 1)}
            >
              <Text style={styles.pageBtnText}>‹ 이전</Text>
            </TouchableOpacity>
            <View style={styles.numberRow}>
              {getPageNumbers().map((i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.numberBtn,
                    i === currentPage && styles.numberBtnOn,
                    i !== currentPage && isDark && { backgroundColor: "#334155" }
                  ]}
                  onPress={() => setCurrentPage(i)}
                >
                  <Text
                    style={[
                      styles.numberText,
                      i === currentPage && styles.numberTextOn,
                      i !== currentPage && isDark && { color: "#94A3B8" }
                    ]}
                  >
                    {i + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={sortedDevices}
          renderItem={({ item }) => renderGridItem(item)}
          keyExtractor={(item) => item.deviceId}
          numColumns={GRID_COLUMNS}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const ActionBtn = ({
  label,
  onPress,
  active = false,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.actionBtn, active && styles.actionBtnActive]}
    onPress={onPress}
  >
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
}) => {
  const theme = useColorScheme() ?? "light";
  const isDark = theme === "dark";

  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryLabel, { color: isDark ? "#94A3B8" : EQ_COLORS.textMuted }]}>
        {label}{" "}
      </Text>
      <Text style={[styles.summaryValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
};

const CELL = (SW - 32 - 9 * 3) / 4;

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  actionBtnActive: { backgroundColor: EQ_COLORS.toggleActiveBg },
  actionBtnText: { color: EQ_COLORS.white, fontSize: 12, fontWeight: "600" },
  filterPanel: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  filterChipText: { fontSize: 12, fontWeight: "600" },
  filterClearBtn: { marginTop: 10, alignSelf: "flex-start" },
  filterClearText: {
    fontSize: 12,
    fontWeight: "600",
    color: EQ_COLORS.ngRed,
  },
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
  },
  countText: { fontSize: 12 },
  listContent: { padding: 12, gap: 10 },
  listCard: {
    flexDirection: "row",
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
  listCardNG: {},
  listThumb: {
    width: 64,
    height: 64,
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
  },
  modelName: { fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: EQ_COLORS.white, fontSize: 11, fontWeight: "600" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  summaryItem: { width: "48%", flexDirection: "row" },
  summaryLabel: { fontSize: 11 },
  summaryValue: { fontSize: 11, fontWeight: "600" },
  chevron: { fontSize: 22, color: EQ_COLORS.borderMuted },
  gridContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  gridRow: { gap: 9, marginBottom: 9 },
  gridCell: {
    width: CELL,
    height: CELL + 24,
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
  gridCellNG: {},
  gridThumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  gridThumbIcon: { fontSize: 20 },
  gridId: { fontSize: 12, fontWeight: "700" },
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
    justifyContent: "center",
    paddingVertical: 20,
    gap: 10,
  },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: EQ_COLORS.headerBg,
    borderRadius: 6,
  },
  pageBtnOff: { backgroundColor: EQ_COLORS.borderMuted },
  pageBtnText: { color: EQ_COLORS.white, fontSize: 12, fontWeight: "600" },
  numberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  numberBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
  },
  numberBtnOn: { backgroundColor: EQ_COLORS.headerBg },
  numberText: { fontSize: 12, fontWeight: "600" },
  numberTextOn: { color: "#FFFFFF" },
});