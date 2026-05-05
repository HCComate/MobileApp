import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function InfoBanner({ text }: { text: string }) {
  return (
    <View style={styles.infoBanner}>
      <Ionicons name="information-circle" size={20} color={Colors.light.icon} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1E4FF",
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: "500",
  },
});
