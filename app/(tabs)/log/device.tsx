import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DeviceIcon from "../../../components/DeviceIcon";
import Header from "../../../components/Header";
import PageHeader from "../../../components/PageHeader";
import { Colors } from "../../../constants/Colors";
import { useDeviceData } from "../../../hooks/updateData";
import { PageStyles } from "../../../styles/PageStyles";
import { DeviceSummary } from "../../../types/equipment";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 4;
const ITEM_SIZE = (width - 40) / COLUMN_COUNT;

export default function DeviceLogScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const devices = useDeviceData();

  const renderDeviceItem = ({ item }: { item: DeviceSummary }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() =>
        router.push({
          pathname: "/log/detail",
          params: {
            deviceId: item.deviceId,
            deviceName: item.modelName,
          },
        })
      }
      activeOpacity={0.7}
    >
      <DeviceIcon
        status={item.machineStatus}
        name={item.deviceId}
        size={ITEM_SIZE * 0.8}
      />
      <ThemedText style={styles.deviceLabel} numberOfLines={1}>
        {item.deviceId.replace("RASP_PI_", "#")}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        PageStyles.safeArea,
        { backgroundColor: Colors[theme].background },
      ]}
      edges={["top", "right", "left"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <Header />

      <ThemedView style={PageStyles.container}>
        <PageHeader title="장비별 로그 보기" />
        <View style={{ marginBottom: 30 }} />

        <FlatList
          data={devices}
          keyExtractor={(item) => item.deviceId}
          renderItem={renderDeviceItem}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={PageStyles.emptyText}>
                연결된 장비가 없습니다.
              </ThemedText>
            </View>
          }
        />
      </ThemedView>
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
    marginBottom: 20,
  },
  deviceLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 100,
  },
});
