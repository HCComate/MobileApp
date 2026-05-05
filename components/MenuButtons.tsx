import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MenuButtonsProps {
  items: string[];
  onPress?: (item: string) => void;
}

export default function MenuButtons({ items, onPress }: MenuButtonsProps) {
  return (
    <View style={styles.buttonGrid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.gridButton, { backgroundColor: Colors.light.tint }]}
          activeOpacity={0.7}
          onPress={() => onPress?.(item)}
        >
          <Text style={styles.buttonText}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridButton: {
    width: "48.5%",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
