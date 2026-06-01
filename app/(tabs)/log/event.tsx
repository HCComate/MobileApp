import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Stack } from "expo-router";
import React from "react";
import { FlatList, StatusBar, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import PageHeader from "../../../components/PageHeader";
import { Colors } from "../../../constants/Colors";
import { useLogData } from "../../../hooks/updateData";
import { RawLog } from "../../../mock/Logs";
import { LogStyles } from "../../../styles/LogStyles";
import { PageStyles } from "../../../styles/PageStyles";

export default function EventLogScreen() {
  const logs = useLogData();
  const theme = useColorScheme() ?? "light";

  // 정상인 로그 아닌 것만 필터링
  const eventLogs = logs.filter(
    (item) =>
      item.body.status_info[0].code !== "NORMAL" &&
      item.body.status_info[0].code !== "SV-VS-PR-00",
  );

  const getStatusStyle = (item: RawLog) => {
    const info = item.body.status_info[0];
    const msg = info.msg.toLowerCase();

    if (
      msg.includes("recovery") ||
      msg.includes("success") ||
      msg.includes("reconnected")
    ) {
      return { backgroundColor: "#3055C1", textColor: "#FFFFFF" };
    }
    if (
      item.body.machine_status === "ERROR" ||
      info.severity === "CRITICAL" ||
      info.severity === "HIGH"
    ) {
      return { backgroundColor: "#FF4D4D", textColor: "#FFFFFF" };
    }
    return { backgroundColor: "#F1C40F", textColor: "#000000" };
  };

  const renderLogItem = ({ item }: { item: RawLog }) => {
    const style = getStatusStyle(item);
    const info = item.body.status_info[0];
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
        <View style={LogStyles.deviceCell}>
          {/* 장비 ID 데이터 바인딩 */}
          <ThemedText
            style={[
              LogStyles.cellText,
              {
                color: style.textColor,
                fontWeight: "bold",
              },
            ]}
          >
            {item.header.device_id}
          </ThemedText>
        </View>

        <View style={LogStyles.timeCell}>
          <ThemedText
            style={[
              LogStyles.timeText,
              {
                color: style.textColor,
              },
            ]}
          >
            {date}
          </ThemedText>

          <ThemedText
            style={[
              LogStyles.timeText,
              {
                color: style.textColor,
              },
            ]}
          >
            {time}
          </ThemedText>
        </View>

        <View style={LogStyles.msgCell}>
          {/* 상태 메시지 데이터 바인딩 */}
          <ThemedText
            style={[
              LogStyles.cellText,
              {
                color: style.textColor,
                fontWeight: "600",
              },
            ]}
          >
            {info.msg}
          </ThemedText>
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
        <PageHeader title="이벤트 로그 보기" />
        <View
          style={[
            LogStyles.columnHeader,
            { backgroundColor: theme === "dark" ? "#374151" : "#E2E8F0" },
          ]}
        >
          <ThemedText
            style={[
              LogStyles.columnText,
              { flex: 0.8, color: Colors[theme].text },
            ]}
          >
            장비
          </ThemedText>
          <ThemedText
            style={[
              LogStyles.columnText,
              { flex: 1.2, color: Colors[theme].text },
            ]}
          >
            일시
          </ThemedText>
          <ThemedText
            style={[
              LogStyles.columnText,
              { flex: 2, color: Colors[theme].text },
            ]}
          >
            기기 상태 내역
          </ThemedText>
        </View>
        <FlatList
          data={eventLogs}
          keyExtractor={(item) =>
            `${item.header.device_id}-${item.body.sequence}`
          }
          renderItem={renderLogItem}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
