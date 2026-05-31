import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import PageHeader from "../../../components/PageHeader";
import { useLogData } from "../../../hooks/updateData";
import { RawLog } from "../../../mock/Logs";
import { LogStyles } from "../../../styles/LogStyles";
import { PageStyles } from "../../../styles/PageStyles";

export default function DeviceDetailLogScreen() {
  const logs = useLogData();
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
    const info = item.body.status_info[0];
    const msg = info.msg.toLowerCase();
    if (msg.includes("recovery") || msg.includes("success")) {
      return { backgroundColor: "#3055C1", textColor: "#FFFFFF" };
    }
    if (item.body.machine_status === "ERROR" || item.body.machine_status === "LOCKED") {
      return { backgroundColor: "#FF4D4D", textColor: "#FFFFFF" };
    }
    if (info.severity === "MEDIUM") {
      return { backgroundColor: "#F1C40F", textColor: "#000000" };
    }
    return { backgroundColor: "#F2F4F7", textColor: "#333333" };
  };

  const renderLogItem = ({ item }: { item: RawLog }) => {
    const style = getStatusStyle(item);
    const ts = item.body.timestamp.replace("T", " ").split(".")[0];
    const [date, time] = ts.split(" ");
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
            {item.body.status_info[0].msg}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={PageStyles.safeArea} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <View style={PageStyles.container}>
        <PageHeader title={`${deviceName || deviceId} 로그 리스트`} />

        <View style={LogStyles.columnHeader}>
          <Text style={[LogStyles.columnText, { flex: 1 }]}>발생 일시</Text>

          <Text style={[LogStyles.columnText, { flex: 2 }]}>상세 내용</Text>
        </View>

        <FlatList
          data={filteredLogs}
          keyExtractor={(item) =>
            `${item.header.device_id}-${item.body.sequence}`
          }
          renderItem={renderLogItem}
          ListEmptyComponent={
            <Text
              style={[
                PageStyles.emptyText,
                {
                  marginTop: 50,
                },
              ]}
            >
              해당 장비의 기록이 없습니다.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}
