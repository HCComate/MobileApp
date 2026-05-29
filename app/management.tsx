import { Ionicons } from "@expo/vector-icons";
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
import { CURRENT_SERVER_URL, isServerMode } from "../mock/userData";
import { MOCK_WORKERS } from "../mock/workers";

interface ServerWorker {
  userId: string;
  name: string;
  role: string;
  shiftStatus: string;
  workStatus: string;
  assignedDevices: string[];
}

export default function ManagementScreen() {
  const router = useRouter();

  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isServerMode) {
      console.log("[Management] 로컬 목업 작업자 리스트 로드");
      setWorkers(MOCK_WORKERS);
    } else {
      fetchServerWorkers();
    }
  }, []);

  const fetchServerWorkers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${CURRENT_SERVER_URL}/api/users`);

      if (response.data && response.data.success) {
        const mappedWorkers = response.data.data.map((user: ServerWorker) => ({
          id: user.userId,
          name: user.name,
          status: user.workStatus || "대기 중",
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=150`,
        }));
        setWorkers(mappedWorkers);
      }
    } catch (error) {
      console.error("[Management Fetch Error]:", error);
      setWorkers(MOCK_WORKERS);
    } finally {
      setIsLoading(false);
    }
  };

  const renderWorkerItem = ({ item }: { item: any }) => (
    <View style={styles.workerItem}>
      <Image source={{ uri: item.image }} style={styles.profileImage} />
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>
          {item.name}({item.id})
        </Text>
        <Text
          style={[
            styles.workerStatus,
            {
              color:
                item.status === "근무 중" || item.status === "WORKING"
                  ? "#3055C1"
                  : "#A57373",
            },
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
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>작업자 관리</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3055C1" />
            <Text style={styles.loadingText}>
              서버에서 작업자 명단을 불러오는 중...
            </Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },
});
