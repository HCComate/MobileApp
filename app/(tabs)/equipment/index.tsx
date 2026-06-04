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
  useColorScheme,
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
import { Colors } from "@/constants/Colors";

const { width: SW } = Dimensions.get("window");
const LIST_PAGE_SIZE = 5; // 리스트 모드용 페이지 사이즈 (5개씩)

type ViewMode = "list" | "grid";

export default function EquipmentStatsScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(0);
  const theme = useColorScheme() ?? "light";
  const isDark = theme === "dark"; // 다크모드 여부 변수화

  // 통합 훅 사용 (USE_API 플래그에 따라 목업/API 자동 전환)
  const devices = useDeviceData();

  const listRef = useRef<FlatList<DeviceSummary> | null>(null);

  // 스토어 동기화 유지
  useEffect(() => {
    if (devices.length > 0) {
      deviceStore.setAll(devices);
    }
  }, [devices]);

  // 리스트 모드 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(devices.length / LIST_PAGE_SIZE));
  const pagedListDevices = devices.slice(
    currentPage * LIST_PAGE_SIZE,
    (currentPage + 1) * LIST_PAGE_SIZE,
  );

  // 페이지 번호 리스트 (최대 3개)
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
              // [수정] 다크모드 카드 배경색 및 보더색 연동
              backgroundColor: isNG ? (isDark ? "#451a1a" : EQ_COLORS.cardNGBg) : Colors[theme].background,
              borderColor: isDark ? Colors[theme].border : "transparent",
              borderWidth: isDark ? 1 : 0
            },
          ]}
          onPress={() => goToDetail(item.deviceId)}
          activeOpacity={0.75}
        >
          {/* [수정] 썸네일 박스 배경색 다크모드 대응 */}
          <View style={[styles.listThumb, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}>
            <Text style={styles.thumbIcon}>🎥</Text>
          </View>
          <View style={styles.listBody}>
            <View style={styles.listRow}>
              {/* [수정] 기기 ID 텍스트 다크모드 색상 지정 */}
              <Text style={[styles.deviceIdText, { color: Colors[theme].text }]}>{item.deviceId}</Text>
              <View style={[styles.badge, { backgroundColor: statusColor }]}>
                <Text style={styles.badgeText}>
                  {STATUS_LABEL[item.machineStatus] || "알 수 없음"}
                </Text>
              </View>
            </View>
            {/* [수정] 모델명 텍스트 다크모드 시 가독성 보정 */}
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
            // [수정] 그리드 셀 배경색 다크모드 대응
            backgroundColor: isNG ? (isDark ? "#451a1a" : EQ_COLORS.cardNGBg) : Colors[theme].background 
          },
        ]}
        onPress={() => goToDetail(item.deviceId)}
        activeOpacity={0.75}
      >
        <View
          style={[styles.gridThumb, { backgroundColor: statusColor + "22" }]}
        >
          <Text style={styles.gridThumbIcon}>🎥</Text>
        </View>
        {/* [수정] 그리드 아이디 텍스트 다크모드 연동 */}
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
    // [수정] 최상단 컨테이너 배경색을 다크모드 배경색으로 연동
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
          <ActionBtn label="필터" onPress={() => {}} />
          <ActionBtn label="정렬 ↕" onPress={() => {}} />
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

      {/* [수정] 갯수 바 배경색 및 텍스트 다크모드 유연화 */}
      <View style={[styles.countBar, { backgroundColor: isDark ? "#1e293b" : EQ_COLORS.countBarBg }]}>
        <Text style={[styles.countText, { color: isDark ? "#94A3B8" : EQ_COLORS.textSecondary }]}>
          전체 {devices.length}개 장비
        </Text>
      </View>

      {viewMode === "list" ? (
        <View style={{ flex: 1 }}>
          <FlatList
            ref={listRef}
            data={pagedListDevices}
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
                    // [수정] 비활성화된 숫자 버튼 배경색 다크모드 조정
                    i !== currentPage && isDark && { backgroundColor: "#334155" }
                  ]}
                  onPress={() => setCurrentPage(i)}
                >
                  <Text
                    style={[
                      styles.numberText,
                      i === currentPage && styles.numberTextOn,
                      // [수정] 비활성화된 숫자 버튼 텍스트 다크모드 조정
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
        <ScrollView style={styles.gridContainer}>
          <View style={styles.gridWrapper}>
            {devices.map((d) => renderGridItem(d))}
          </View>
        </ScrollView>
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
}) => {
  const theme = useColorScheme() ?? "light";
  const isDark = theme === "dark";

  return (
    <View style={styles.summaryItem}>
      {/* [수정] 라벨 텍스트 다크모드 가독성 보정 */}
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
  gridContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  gridWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
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