import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Stack } from "expo-router";
import React from "react";
import { FlatList, StatusBar, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import PageHeader from "../../../components/PageHeader";
import { Colors } from "../../../constants/Colors";
import { useEventLogs } from "../../../hooks/useEventLogs";
import { RawLog } from "../../../mock/Logs";
import { LogStyles } from "../../../styles/LogStyles";
import { PageStyles } from "../../../styles/PageStyles";

// RESOLVED(오류 수정 완료) 로그는 친화적 라벨로 변환해 표시한다.
// 서버 msg는 "Recovery by {username}" 형식.
function formatLogMsg(info?: { code?: string; msg?: string }) {
  if (info?.code === "RESOLVED") {
    const by = (info.msg ?? "").replace(/recovery by/i, "").trim();
    return by ? `오류 수정 완료 (${by})` : "오류 수정 완료";
  }
  return info?.msg ?? "-";
}

export default function EventLogScreen() {
  // 서버 전용 엔드포인트(/api/inspections/events)가 ERROR/LOCKED만 골라 내려준다.
  // 초당 50건 폭주에도 이벤트가 정상 로그에 묻히지 않는다(앱 측 필터 불필요).
  const eventLogs = useEventLogs();
  const theme = useColorScheme() ?? "light";

  const getStatusStyle = (item: RawLog) => {
    const info = item.body.status_info?.[0];
    const code = info?.code;
    const msg = (info?.msg ?? "").toLowerCase();

    // 오류 수정 완료(RESOLVED) 등 복구 로그는 파란색
    if (
      code === "RESOLVED" ||
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
            {formatLogMsg(info)}
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
            `${item.header.device_id}__${item.body.sequence}__${item.body.timestamp}`
          }
          renderItem={renderLogItem}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
