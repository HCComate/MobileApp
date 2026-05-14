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
import PageHeader from "../../../components/PageHeader";
import { MOCK_DEVICES } from "../../../mock/devices";
import { PageStyles } from "../../../styles/PageStyles";

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
    <SafeAreaView style={PageStyles.safeArea} edges={["top", "right", "left"]}>
      {/* 중복 헤더 방지 */}
      <Stack.Screen options={{ headerShown: false }} />

      <Header />

      <View style={PageStyles.container}>
        <PageHeader title="장비별 로그 보기" />

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
              <Text style={PageStyles.emptyText}>연결된 장비가 없습니다.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
