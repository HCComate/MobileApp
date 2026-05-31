import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WORKER_IMAGES } from "../constants/workerImages";
import { CURRENT_SERVER_URL, isServerMode } from "../mock/userData";
import { MOCK_WORKERS } from "../mock/workers";

export default function ManagementScreen() {
  const router = useRouter();
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isServerMode) {
      setWorkers(MOCK_WORKERS);
    } else {
      fetchServerWorkers();
    }
  }, []);

  const fetchServerWorkers = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const pureToken = token?.replace("Bearer ", "");

      const response = await axios.get(`${CURRENT_SERVER_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${pureToken}`,
          "x-access-token": pureToken,
        },
      });

      if (Array.isArray(response.data)) {
        const mappedWorkers = response.data.map((user: any) => ({
          id: user.emp_id?.toString() || "N/A",
          name: user.nickname || "이름없음",
          role: user.role || "UNKNOWN",
          status: user.is_online ? "근무 중" : "대기 중",
        }));
        setWorkers(mappedWorkers);
      } else {
        setWorkers(MOCK_WORKERS);
      }
    } catch {
      setWorkers(MOCK_WORKERS);
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

  const renderWorkerItem = ({ item, index }: { item: any; index: number }) => {
    const imageSource = WORKER_IMAGES[index + 1];

    return (
      <View style={styles.workerItem}>
        <View
          style={[
            styles.profileIconContainer,
            {
              borderColor: getRoleColor(item.role),
              borderWidth: 2,
              overflow: "hidden",
            },
          ]}
        >
          {imageSource ? (
            <Image source={imageSource} style={{ width: 46, height: 46 }} />
          ) : (
            <Ionicons
              name="person-circle"
              size={46}
              color={getRoleColor(item.role)}
            />
          )}
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
  };

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
