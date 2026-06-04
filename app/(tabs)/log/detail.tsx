import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, StatusBar, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import PageHeader from "../../../components/PageHeader";
import { Colors } from "../../../constants/Colors";
import { useLogData } from "../../../hooks/updateData";
import { RawLog } from "../../../mock/Logs";
import { LogStyles } from "../../../styles/LogStyles";
import { PageStyles } from "../../../styles/PageStyles";

export default function DeviceDetailLogScreen() {
  const logs = useLogData();
  const theme = useColorScheme() ?? "light";
  // 네비게이션으로 전달받은 deviceId 추출
  const { deviceId, deviceName } = useLocalSearchParams<{
    deviceId: string;
    deviceName: string;
  }>();

  // 해당 장비의 로그만 필터링
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => log.header.device_id === deviceId);
  }, [logs, deviceId]);

  const getStatusStyle = (item: RawLog) => {
    const info = item.body.status_info?.[0];
    const msg = (info?.msg ?? "").toLowerCase();
    if (msg.includes("recovery") || msg.includes("success")) {
      return { backgroundColor: "#3055C1", textColor: "#FFFFFF" };
    }
    if (item.body.machine_status === "ERROR" || item.body.machine_status === "LOCKED") {
      return { backgroundColor: "#FF4D4D", textColor: "#FFFFFF" };
    }
    if (info.severity === "MEDIUM") {
      return { backgroundColor: "#F1C40F", textColor: "#000000" };
    }
    // 일반적인 경우는 테마에 맞춰 배경색 조정
    return {
      backgroundColor: theme === "dark" ? "#1F2937" : "#F2F4F7",
      textColor: Colors[theme].text,
    };
  };

  const renderLogItem = ({ item }: { item: RawLog }) => {
    const style = getStatusStyle(item);
    const ts = (item.body.timestamp ?? "").replace("T", " ").split(".")[0];
    const [date = "-", time = "-"] = ts.split(" ");
    const msg = item.body.status_info?.[0]?.msg ?? "-";
    return (
      <View
        style={[
          LogStyles.logRow,
          {
            backgroundColor: style.backgroundColor,
          },
        ]}
      >
        <View style={LogStyles.timeCell}>
          <Text style={[LogStyles.timeText, { color: style.textColor }]}>
            {date}
          </Text>

          <Text style={[LogStyles.timeText, { color: style.textColor }]}>
            {time}
          </Text>
        </View>

        <View style={LogStyles.msgCell}>
          <Text style={[LogStyles.cellText, { color: style.textColor }]}>
            {msg}
          </Text>
        </View>
      </View>
    );
  };

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
        <PageHeader title={`${deviceName || deviceId} 로그 리스트`} />

        <View
          style={[
            LogStyles.columnHeader,
            { backgroundColor: theme === "dark" ? "#374151" : "#E2E8F0" },
          ]}
        >
          <Text
            style={[
              LogStyles.columnText,
              { flex: 1, color: Colors[theme].text },
            ]}
          >
            발생 일시
          </Text>

          <Text
            style={[
              LogStyles.columnText,
              { flex: 2, color: Colors[theme].text },
            ]}
          >
            상세 내용
          </Text>
        </View>

        <FlatList
          data={filteredLogs}
          keyExtractor={(item) =>
            `${item.header.device_id}__${item.body.sequence}__${item.body.timestamp}`
          }
          renderItem={renderLogItem}
          ListEmptyComponent={
            <ThemedText
              style={[
                PageStyles.emptyText,
                {
                  marginTop: 50,
                },
              ]}
            >
              해당 장비의 기록이 없습니다.
            </ThemedText>
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}
