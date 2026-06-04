import { Href, useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

export type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly";

/**
 * 각 통계 페이지 하단에 들어가는 "리포팅" 버튼.
 * 누르면 해당 기간(period)의 서버 리포트 페이지로 이동합니다.
 */
export default function ReportingButton({ period }: { period: ReportPeriod }) {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: theme === "dark" ? "#374151" : "#1D1D5A" },
      ]}
      onPress={() =>
        router.push(`/statistics/reporting?period=${period}` as Href)
      }
      activeOpacity={0.8}
    >
      <Text style={styles.text}>📄  리포팅</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  text: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
