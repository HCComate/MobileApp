import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HelpModal from "./HelpModal";

export default function Header() {
  const [helpVisible, setHelpVisible] = useState(false);
  const pathname = usePathname?.() as string | undefined;
  return (
    <View style={styles.header}>
      <TouchableOpacity>
        <Ionicons name="menu" size={28} color={Colors.light.text} />
      </TouchableOpacity>
      {/*
      <View style={styles.logoContainer}>
        <Ionicons name="eye" size={22} color={Colors.light.icon} />
        <Text style={styles.logoText}>VisionMate</Text>
      </View>
      */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>VisionMate</Text>
      </View>
      <TouchableOpacity onPress={() => setHelpVisible(true)}>
        <Ionicons
          name="help-circle-outline"
          size={26}
          color={Colors.light.text}
        />
      </TouchableOpacity>
      <HelpModal
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        path={pathname}
      />
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
  logoImage: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EBF2FA",
  },
  logoText: {
    marginLeft: 6,
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
});
