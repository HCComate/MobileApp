import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity>
        <Ionicons name="menu" size={28} color={Colors.light.text} />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <Ionicons name="eye" size={22} color={Colors.light.icon} />
        <Text style={styles.logoText}>VisionMate</Text>
      </View>
      <TouchableOpacity>
        <Ionicons
          name="help-circle-outline"
          size={26}
          color={Colors.light.text}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    marginLeft: 6,
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
});
