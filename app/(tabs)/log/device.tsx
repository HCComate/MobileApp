import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DeviceIcon from "../../../components/DeviceIcon";
import Header from "../../../components/Header";
import { MOCK_DEVICES } from "../../../mock/devices";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 4;
const ITEM_SIZE = (width - 40) / COLUMN_COUNT;

export default function DeviceLogScreen() {
  const router = useRouter();

  const renderDeviceItem = ({ item }: { item: (typeof MOCK_DEVICES)[0] }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() =>
        router.push({
          pathname: "/log/detail",
          params: {
            deviceId: item.id,
            deviceName: item.name,
          },
        })
      }
      activeOpacity={0.7}
    >
      <DeviceIcon
        status={item.status}
        name={item.name}
        size={ITEM_SIZE * 0.8}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      {/* 중복 헤더 방지 */}
      <Stack.Screen options={{ headerShown: false }} />

      <Header />

      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>장비별 로그 보기</Text>
        </View>

        {/* 장비 리스트 */}
        <FlatList
          data={MOCK_DEVICES}
          keyExtractor={(item) => item.id}
          renderItem={renderDeviceItem}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>연결된 장비가 없습니다.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  pageHeader: {
    backgroundColor: "#1D1D5A",
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  deviceCard: {
    width: ITEM_SIZE,
    alignItems: "center",
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});
