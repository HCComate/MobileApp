import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { lastError } from "../services/errorAlert";

export default function LastErrorBanner() {
  const [err, setErr] = useState(lastError);

  useEffect(() => {
    // 폴링 방식으로 간단히 lastError 변화를 감시
    const iv = setInterval(() => setErr(lastError), 1000);
    return () => clearInterval(iv);
  }, []);

  if (!err) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={() => {}}>
      <View>
        <Text style={styles.title}>마지막 오류: {err.title}</Text>
        <Text style={styles.body}>{err.body}</Text>
        <Text style={styles.ts}>{err.ts}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fdecea",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5c6cb",
  },
  title: {
    fontWeight: "700",
    color: "#721c24",
  },
  body: {
    color: "#721c24",
  },
  ts: {
    color: "#6c757d",
    fontSize: 11,
    marginTop: 4,
  },
});
