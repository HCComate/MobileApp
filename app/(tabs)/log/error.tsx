import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Stack } from "expo-router";
import React from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import PageHeader from "../../../components/PageHeader";
import { Colors } from "../../../constants/Colors";
import { useLogData } from "../../../hooks/updateData";
import { RawLog } from "../../../mock/Logs";
import { LogStyles } from "../../../styles/LogStyles";
import { PageStyles } from "../../../styles/PageStyles";

export default function ErrorLogScreen() {
  const logs = useLogData();
  const theme = useColorScheme() ?? "light";

  // 오직 machine_status가 ERROR인 데이터만 필터링
  const errorLogs = logs.filter((item) => item.body.machine_status === "ERROR");

  const renderLogItem = ({ item }: { item: RawLog }) => {
    const info = item.body.status_info[0];
    const ts = item.body.timestamp.replace("T", " ").split(".")[0];
    const [date, time] = ts.split(" ");

    return (
      <View style={[LogStyles.logRow, styles.errorRow]}>
        <View style={LogStyles.deviceCell}>
          {/* 실제 데이터의 장비 ID 바인딩 */}
          <ThemedText style={[LogStyles.cellText, styles.whiteTextBold]}>
            {item.header.device_id}
          </ThemedText>
        </View>

        <View style={LogStyles.timeCell}>
          <ThemedText style={[LogStyles.timeText, styles.whiteText]}>
            {date}
          </ThemedText>
          <ThemedText style={[LogStyles.timeText, styles.whiteText]}>
            {time}
          </ThemedText>
        </View>

        <View style={LogStyles.msgCell}>
          {/* 실제 데이터의 에러 메시지 바인딩 */}
          <ThemedText style={[LogStyles.cellText, styles.whiteText]}>
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
        <PageHeader title="오류 로그 보기" />

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
            기기 오류 발생
          </ThemedText>
        </View>

        <FlatList
          data={errorLogs}
          keyExtractor={(item) =>
            `${item.header.device_id}-${item.body.sequence}`
          }
          renderItem={renderLogItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={PageStyles.emptyText}>
                현재 감지된 시스템 오류가 없습니다.
              </ThemedText>
            </View>
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorRow: {
    backgroundColor: "#FF4D4D", // 오류 로그 특수 색상 (유지)
    borderBottomColor: "rgba(255,255,255,0.3)",
  },

  whiteText: {
    color: "#FFFFFF",
  },

  whiteTextBold: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 100,
  },
});
