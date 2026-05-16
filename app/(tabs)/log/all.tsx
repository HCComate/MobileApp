import { Stack } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import PageHeader from "../../../components/PageHeader";
import { useLogData } from "../../../hooks/updateData";
import { RawLog } from "../../../mock/Logs";
import { LogStyles } from "../../../styles/LogStyles";
import { PageStyles } from "../../../styles/PageStyles";

export default function AllLogScreen() {
  const logs = useLogData();

  const getStatusStyle = (item: RawLog) => {
    const info = item.body.status_info[0];
    const msg = info.msg.toLowerCase();

    // 문제 해결은 파란색
    if (
      msg.includes("recovery") ||
      msg.includes("success") ||
      msg.includes("reconnected")
    ) {
      return { backgroundColor: "#3055C1", textColor: "#FFFFFF" };
    }

    // 오류는 빨간색
    if (
      item.body.machine_status === "ERROR" ||
      info.severity === "CRITICAL" ||
      info.severity === "HIGH"
    ) {
      return { backgroundColor: "#FF4D4D", textColor: "#FFFFFF" };
    }
    // 경고는 노란색
    if (info.severity === "MEDIUM") {
      return { backgroundColor: "#F1C40F", textColor: "#000000" };
    }
    // 일반적인 경우는 흰색
    return { backgroundColor: "#F2F4F7", textColor: "#333333" };
  };

  const renderLogItem = ({ item }: { item: RawLog }) => {
    const style = getStatusStyle(item);
    const info = item.body.status_info[0];
    const ts = item.body.timestamp.replace("T", " ").split(".")[0];
    const [date, time] = ts.split(" ");

    return (
      <View
        style={[LogStyles.logRow, { backgroundColor: style.backgroundColor }]}
      >
        <View style={LogStyles.deviceCell}>
          {/* 데이터에서 장비 ID 직접 바인딩 */}
          <Text
            style={[
              LogStyles.cellText,
              { color: style.textColor, fontWeight: "bold" },
            ]}
          >
            {item.header.device_id}
          </Text>
        </View>

        <View style={LogStyles.timeCell}>
          <Text style={[LogStyles.timeText, { color: style.textColor }]}>
            {date}
          </Text>

          <Text style={[LogStyles.timeText, { color: style.textColor }]}>
            {time}
          </Text>
        </View>

        <View style={LogStyles.msgCell}>
          {/* 데이터에서 메시지 직접 바인딩 */}
          <Text
            style={[LogStyles.cellText, { color: style.textColor }]}
            numberOfLines={1}
          >
            {info.msg}
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
        <PageHeader title="전체 로그 보기" />
        <View style={LogStyles.columnHeader}>
          <Text style={[LogStyles.columnText, { flex: 0.8 }]}>장비</Text>
          <Text style={[LogStyles.columnText, { flex: 1.2 }]}>일시</Text>
          <Text style={[LogStyles.columnText, { flex: 2 }]}>로그 내용</Text>
        </View>
        <FlatList
          data={logs}
          keyExtractor={(item) =>
            `${item.header.device_id}-${item.body.sequence}`
          }
          renderItem={renderLogItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
