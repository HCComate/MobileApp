import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../services/apiClient";

export default function ManagementScreen() {
  const router = useRouter();
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchServerWorkers();
  }, []);

  const fetchServerWorkers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/api/users");

      // MobileServer: ApiResponse 래퍼 { success, data } 또는 배열 직접 반환
      const raw = response.data?.data ?? response.data;
      const list = Array.isArray(raw) ? raw : [];
      const mappedWorkers = list.map((user: any) => ({
        id: user.userId || "N/A",
        name: user.name || "이름없음",
        role: user.role || "UNKNOWN",
        status: user.shiftStatus === "ON_DUTY" ? "근무 중" : "퇴근",
      }));
      setWorkers(mappedWorkers);
    } catch {
      setWorkers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "MASTER":
        return "#B91C1C";
      case "OPERATOR":
        return "#047857";
      case "TECHNICIAN":
        return "#1D4ED8";
      default:
        return "#64748B";
    }
  };

  const renderWorkerItem = ({ item }: { item: any }) => (
    <View style={styles.workerItem}>
      <View
        style={[
          styles.profileIconContainer,
          { borderColor: getRoleColor(item.role), borderWidth: 2 },
        ]}
      >
        <Ionicons
          name="person-circle"
          size={46}
          color={getRoleColor(item.role)}
        />
      </View>
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>
          {item.name}({item.id})
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: getRoleColor(item.role),
            fontWeight: "bold",
          }}
        >
          {item.role}
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>작업자 관리</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3055C1" />
          </View>
        ) : (
          <FlatList
            data={workers}
            keyExtractor={(item) => item.id}
            renderItem={renderWorkerItem}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  listContainer: { paddingHorizontal: 20 },
  workerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  profileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  workerInfo: { marginLeft: 15 },
  workerName: { fontSize: 16, fontWeight: "600" },
  workerStatus: { fontSize: 14, marginTop: 4, fontWeight: "500" },
  separator: { height: 1, backgroundColor: "#F5F5F5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
