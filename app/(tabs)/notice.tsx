import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/Header";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { Colors } from "../../constants/Colors";
import { useNoticeData } from "../../hooks/useNoticeData";
import { Notice } from "../../mock/notice";

const ITEMS_PER_PAGE = 4;
const MAX_PAGE_BUTTONS = 3;

export default function NoticeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const backgroundColor = Colors[colorScheme].background;

  const isDark = colorScheme === "dark";
  const cardBgColor = isDark ? "#1E1E1E" : "#FFF";
  const cardBorderColor = isDark ? "#2C2C2C" : "#F0F0F0";
  const mainTextColor = isDark ? "#FFF" : "#333";
  const subTextColor = isDark ? "#BBB" : "#666";

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { notices, loading, refreshing, refresh } = useNoticeData();

  useEffect(() => {
    setCurrentPage(1);
  }, [notices]);

  const sortedNotices = useMemo(() => {
    if (!notices) return [];
    return [...notices].sort((a, b) => {
      if (a.is_important !== b.is_important) {
        return b.is_important - a.is_important;
      }
      return b.created_at.localeCompare(b.created_at)
        ? b.created_at.localeCompare(a.created_at)
        : 0;
    });
  }, [notices]);

  const totalPages = Math.ceil(sortedNotices.length / ITEMS_PER_PAGE);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedNotices.slice(start, end);
  }, [currentPage, sortedNotices]);

  const visiblePages = useMemo(() => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
    let endPage = startPage + MAX_PAGE_BUTTONS - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - MAX_PAGE_BUTTONS + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const handlePressNotice = (item: Notice) => {
    setSelectedNotice(item);
    setModalVisible(true);
  };

  const handleRefresh = async () => {
    setCurrentPage(1);
    await refresh();
  };

  const renderItem = ({ item }: { item: Notice }) => (
    <TouchableOpacity
      style={[
        styles.noticeItem,
        { backgroundColor: cardBgColor, borderColor: cardBorderColor },
      ]}
      onPress={() => handlePressNotice(item)}
      activeOpacity={0.7}
    >
      <View style={styles.textContent}>
        <View style={styles.noticeHeader}>
          {item.is_important === 1 && (
            <View style={styles.importantBadge}>
              <ThemedText style={styles.importantText}>중요</ThemedText>
            </View>
          )}
          <ThemedText style={styles.dateText}>{item.created_at}</ThemedText>
        </View>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.titleText, { color: mainTextColor }]}
        >
          {item.title}
        </ThemedText>
        <ThemedText
          numberOfLines={1}
          style={[styles.contentPreview, { color: subTextColor }]}
        >
          {item.content}
        </ThemedText>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? "#666" : "#CCC"}
        />
      </View>
    </TouchableOpacity>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          disabled={currentPage === 1}
          onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          style={[
            styles.pageButton,
            currentPage === 1 && styles.disabledButton,
          ]}
        >
          <ThemedText
            style={[
              styles.pageButtonText,
              currentPage === 1 && styles.disabledButtonText,
            ]}
          >
            이전
          </ThemedText>
        </TouchableOpacity>

        {visiblePages.map((page) => (
          <TouchableOpacity
            key={page}
            onPress={() => setCurrentPage(page)}
            style={[
              styles.pageNumber,
              currentPage === page && styles.activePageNumber,
            ]}
          >
            <ThemedText
              style={[
                styles.pageNumberText,
                { color: currentPage === page ? "#FFF" : mainTextColor },
                currentPage === page && styles.activePageNumberText,
              ]}
            >
              {page}
            </ThemedText>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          disabled={currentPage === totalPages}
          onPress={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          style={[
            styles.pageButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
        >
          <ThemedText
            style={[
              styles.pageButtonText,
              currentPage === totalPages && styles.disabledButtonText,
            ]}
          >
            다음
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <ThemedView style={styles.container}>
        <View style={styles.titleSection}>
          <ThemedText type="title">공지사항</ThemedText>
        </View>

        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderPagination}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        />
      </ThemedView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBgColor }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={mainTextColor} />
            </TouchableOpacity>

            {selectedNotice && (
              <View style={styles.modalBody}>
                <View style={styles.noticeHeader}>
                  {selectedNotice.is_important === 1 && (
                    <View style={styles.importantBadge}>
                      <ThemedText style={styles.importantText}>중요</ThemedText>
                    </View>
                  )}
                  <ThemedText style={styles.dateText}>
                    {selectedNotice.created_at}
                  </ThemedText>
                </View>

                <ThemedText
                  type="title"
                  style={[styles.modalTitle, { color: mainTextColor }]}
                >
                  {selectedNotice.title}
                </ThemedText>

                <View
                  style={[
                    styles.modalDivider,
                    { backgroundColor: cardBorderColor },
                  ]}
                />

                <ScrollView
                  showsVerticalScrollIndicator={true}
                  style={styles.modalScroll}
                >
                  <ThemedText
                    style={[styles.modalContentText, { color: mainTextColor }]}
                  >
                    {selectedNotice.content}
                  </ThemedText>
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  titleSection: { marginVertical: 20 },
  listContent: { paddingBottom: 30 },
  noticeItem: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  textContent: { flex: 1, paddingRight: 8 },
  noticeHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  importantBadge: {
    backgroundColor: "#FFEDED",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  importantText: { color: "#FF4D4F", fontSize: 11, fontWeight: "bold" },
  dateText: { fontSize: 12, color: "#999" },
  titleText: { fontSize: 16, marginBottom: 4 },
  contentPreview: { fontSize: 14 },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  pageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 5,
  },
  pageButtonText: { fontSize: 14, color: "#007AFF" },
  disabledButton: { opacity: 0.4 },
  disabledButtonText: { color: "#999" },
  pageNumber: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 16,
  },
  activePageNumber: { backgroundColor: "#007AFF" },
  pageNumberText: { fontSize: 14 },
  activePageNumberText: { fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    position: "relative",
    maxHeight: "80%",
  },
  closeButton: { position: "absolute", top: 16, right: 16, zIndex: 10 },
  modalBody: { marginTop: 15 },
  modalTitle: { fontSize: 20, marginTop: 10, lineHeight: 26 },
  modalDivider: { height: 1, marginVertical: 15 },
  modalScroll: { maxHeight: 350 },
  modalContentText: { fontSize: 15, lineHeight: 22 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
