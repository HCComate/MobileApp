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

export default function EventLogScreen() {
  const logs = useLogData();
  // 정상인 로그 아닌 것만 필터링
  const eventLogs = logs.filter((item) => {
    const code = item.body.status_info?.[0]?.code;
    return code !== undefined && code !== "NORMAL" && code !== "SV-VS-PR-00";
  });

  const getStatusStyle = (item: RawLog) => {
    const info = item.body.status_info?.[0];
    const msg = (info?.msg ?? "").toLowerCase();

    if (
      msg.includes("recovery") ||
      msg.includes("success") ||
      msg.includes("reconnected")
    ) {
      return { backgroundColor: "#3055C1", textColor: "#FFFFFF" };
    }
    if (
      item.body.machine_status === "ERROR" ||
      item.body.machine_status === "LOCKED" ||
      info.severity === "CRITICAL" ||
      info.severity === "HIGH"
    ) {
      return { backgroundColor: "#FF4D4D", textColor: "#FFFFFF" };
    }
    return { backgroundColor: "#F1C40F", textColor: "#000000" };
  };

  const renderLogItem = ({ item }: { item: RawLog }) => {
    const style = getStatusStyle(item);
    const info = item.body.status_info?.[0] ?? { msg: "-", severity: "LOW", code: "" };
    const ts = (item.body.timestamp ?? "").replace("T", " ").split(".")[0];
    const [date = "-", time = "-"] = ts.split(" ");

    return (
      <View
        style={[
          LogStyles.logRow,
          {
            backgroundColor: style.backgroundColor,
          },
        ]}
      >
        <View style={LogStyles.deviceCell}>
          {/* 장비 ID 데이터 바인딩 */}
          <Text
            style={[
              LogStyles.cellText,
              {
                color: style.textColor,
                fontWeight: "bold",
              },
            ]}
          >
            {item.header.device_id}
          </Text>
        </View>

        <View style={LogStyles.timeCell}>
          <Text
            style={[
              LogStyles.timeText,
              {
                color: style.textColor,
              },
            ]}
          >
            {date}
          </Text>

          <Text
            style={[
              LogStyles.timeText,
              {
                color: style.textColor,
              },
            ]}
          >
            {time}
          </Text>
        </View>

        <View style={LogStyles.msgCell}>
          {/* 상태 메시지 데이터 바인딩 */}
          <Text
            style={[
              LogStyles.cellText,
              {
                color: style.textColor,
                fontWeight: "600",
              },
            ]}
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
        <PageHeader title="이벤트 로그 보기" />
        <View style={LogStyles.columnHeader}>
          <Text style={[LogStyles.columnText, { flex: 0.8 }]}>장비</Text>
          <Text style={[LogStyles.columnText, { flex: 1.2 }]}>일시</Text>
          <Text style={[LogStyles.columnText, { flex: 2 }]}>
            기기 상태 내역
          </Text>
        </View>
        <FlatList
          data={eventLogs}
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
