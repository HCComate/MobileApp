import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";

export default function InfoBanner({ text }: { text: string }) {
  const theme = useColorScheme() ?? "light";
  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.infoBanner,
        {
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          borderColor: isDark ? "#334155" : "#D1E4FF",
        },
      ]}
    >
      <Ionicons
        name="information-circle"
        size={20}
        color={isDark ? "#60A5FA" : Colors.light.icon}
      />
      <Text
        style={[
          styles.infoText,
          { color: isDark ? "#F1F5F9" : Colors.light.text },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "500",
  },
});
