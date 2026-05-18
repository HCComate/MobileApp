import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
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
import { MOCK_NOTICES, Notice } from "../../mock/notice";

const ITEMS_PER_PAGE = 4;
const MAX_PAGE_BUTTONS = 3;

export default function NoticeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const backgroundColor = Colors[colorScheme].background;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const totalPages = Math.ceil(MOCK_NOTICES.length / ITEMS_PER_PAGE);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return MOCK_NOTICES.slice(start, end);
  }, [currentPage]);

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

  const renderItem = ({ item }: { item: Notice }) => (
    <TouchableOpacity
      style={styles.noticeItem}
      onPress={() => handlePressNotice(item)}
      activeOpacity={0.7}
    >
      <View style={styles.textContent}>
        <View style={styles.noticeHeader}>
          {item.important && (
            <View style={styles.importantBadge}>
              <ThemedText style={styles.importantText}>중요</ThemedText>
            </View>
          )}
          <ThemedText style={styles.dateText}>{item.date}</ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" style={styles.titleText}>
          {item.title}
        </ThemedText>
        <ThemedText numberOfLines={1} style={styles.contentPreview}>
          {item.content}
        </ThemedText>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={16} color="#CCC" />
      </View>
    </TouchableOpacity>
  );

  const renderPagination = () => {
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
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderPagination}
        />
      </ThemedView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            {selectedNotice && (
              <View style={styles.modalBody}>
                <View style={styles.noticeHeader}>
                  {selectedNotice.important && (
                    <View style={styles.importantBadge}>
                      <ThemedText style={styles.importantText}>중요</ThemedText>
                    </View>
                  )}
                  <ThemedText style={styles.dateText}>
                    {selectedNotice.date}
                  </ThemedText>
                </View>

                <ThemedText type="title" style={styles.modalTitle}>
                  {selectedNotice.title}
                </ThemedText>

                <View style={styles.modalDivider} />

                <ScrollView
                  showsVerticalScrollIndicator={true}
                  style={styles.modalScroll}
                >
                  <ThemedText style={styles.modalContentText}>
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
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    flexDirection: "row",
    alignItems: "center",
  },
  textContent: {
    flex: 1,
    paddingRight: 8,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  importantBadge: {
    backgroundColor: "#FFEDED",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  importantText: {
    color: "#FF4D4F",
    fontSize: 11,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  titleText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  contentPreview: {
    fontSize: 14,
    color: "#666",
  },
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
  pageButtonText: {
    fontSize: 14,
    color: "#007AFF",
  },
  disabledButton: {
    opacity: 0.4,
  },
  disabledButtonText: {
    color: "#999",
  },
  pageNumber: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 16,
  },
  activePageNumber: {
    backgroundColor: "#007AFF",
  },
  pageNumberText: {
    fontSize: 14,
    color: "#333",
  },
  activePageNumberText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    position: "relative",
    maxHeight: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  modalBody: {
    marginTop: 15,
  },
  modalTitle: {
    fontSize: 20,
    color: "#333",
    marginTop: 10,
    lineHeight: 26,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 15,
  },
  modalScroll: {
    maxHeight: 350,
  },
  modalContentText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
});
