import { Stack } from "expo-router";
import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MOCK_WORKERS } from "../mock/workers";

export default function ManagementScreen() {
  const renderWorkerItem = ({ item }: { item: (typeof MOCK_WORKERS)[0] }) => (
    <View style={styles.workerItem}>
      <Image source={{ uri: item.image }} style={styles.profileImage} />
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>
          {item.name}({item.id})
        </Text>
        <Text
          style={[
            styles.workerStatus,
            { color: item.status === "근무 중" ? "#3055C1" : "#A57373" },
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>작업자 관리</Text>
        </View>

        <FlatList
          data={MOCK_WORKERS}
          keyExtractor={(item) => item.id}
          renderItem={renderWorkerItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  workerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#F0F0F0",
  },
  workerInfo: {
    marginLeft: 15,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  workerStatus: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#F5F5F5",
  },
});
