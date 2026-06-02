import { Stack } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import PageHeader from "../../../components/PageHeader";
import { useLogData } from "../../../hooks/updateData";
import { RawLog } from "../../../mock/Logs";
import { LogStyles } from "../../../styles/LogStyles";
import { PageStyles } from "../../../styles/PageStyles";

export default function ErrorLogScreen() {
  const logs = useLogData();
  // 오직 machine_status가 ERROR인 데이터만 필터링
  const errorLogs = logs.filter(
    (item) => item.body.machine_status === "ERROR" || item.body.machine_status === "LOCKED",
  );

  const renderLogItem = ({ item }: { item: RawLog }) => {
    const info = item.body.status_info?.[0] ?? { msg: "오류 발생" };
    const ts = (item.body.timestamp ?? "").replace("T", " ").split(".")[0];
    const [date = "-", time = "-"] = ts.split(" ");

    return (
      <View style={[LogStyles.logRow, styles.errorRow]}>
        <View style={LogStyles.deviceCell}>
          {/* 실제 데이터의 장비 ID 바인딩 */}
          <Text style={[LogStyles.cellText, styles.whiteTextBold]}>
            {item.header.device_id}
          </Text>
        </View>

        <View style={LogStyles.timeCell}>
          <Text style={[LogStyles.timeText, styles.whiteText]}>{date}</Text>
          <Text style={[LogStyles.timeText, styles.whiteText]}>{time}</Text>
        </View>

        <View style={LogStyles.msgCell}>
          {/* 실제 데이터의 에러 메시지 바인딩 */}
          <Text style={[LogStyles.cellText, styles.whiteText]}>{info.msg}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={PageStyles.safeArea} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <View style={PageStyles.container}>
        <PageHeader title="오류 로그 보기" />

        <View style={LogStyles.columnHeader}>
          <Text style={[LogStyles.columnText, { flex: 0.8 }]}>장비</Text>
          <Text style={[LogStyles.columnText, { flex: 1.2 }]}>일시</Text>
          <Text style={[LogStyles.columnText, { flex: 2 }]}>
            기기 오류 발생
          </Text>
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
              <Text style={PageStyles.emptyText}>
                현재 감지된 시스템 오류가 없습니다.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorRow: {
    backgroundColor: "#FF4D4D",
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
