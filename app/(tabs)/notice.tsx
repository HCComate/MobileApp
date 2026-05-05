import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { Colors } from "../../constants/Colors";
import { MOCK_NOTICES, Notice } from "../../mock/notice";

export default function NoticeScreen() {
  const renderItem = ({ item }: { item: Notice }) => (
    <TouchableOpacity style={styles.noticeItem}>
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
      <Ionicons
        name="chevron-forward"
        size={16}
        color="#CCC"
        style={styles.arrow}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors.light.background }]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <ThemedView style={styles.container}>
        <View style={styles.titleSection}>
          <ThemedText type="title">공지사항</ThemedText>
        </View>

        <FlatList
          data={MOCK_NOTICES}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
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
    position: "relative",
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
    paddingRight: 20,
  },
  arrow: {
    position: "absolute",
    right: 15,
    top: "50%",
    marginTop: 5,
  },
});
