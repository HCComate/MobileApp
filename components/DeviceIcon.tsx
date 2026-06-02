import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { STATUS_COLOR } from "../constants/equipmentConstants";

interface DeviceIconProps {
  status: "RUN" | "ERROR" | "IDLE" | "STOP" | "OFF" | "STANDBY" | "LOCKED";
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export default function DeviceIcon({
  status,
  name,
  size = 60,
  style,
}: DeviceIconProps) {
  // 색상 단일 소스: equipmentConstants.ts의 STATUS_COLOR 사용
  // (OFF는 STATUS_COLOR에 없으므로 STOP과 동일 처리)
  const mainColor =
    status === "OFF"
      ? STATUS_COLOR.STOP
      : STATUS_COLOR[status] ?? "#4A4A6A";

  return (
    <View
      style={[
        styles.container,
        { width: size, marginBottom: name ? 15 : 0 },
        style,
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          {
            width: size,
            height: size,
            backgroundColor: status === "ERROR" ? "#FFF0F0" : "#F2F4F7",
          },
          status === "ERROR" && styles.errorBorder,
        ]}
      >
        <Ionicons name="hardware-chip" size={size * 0.5} color={mainColor} />

        {status === "ERROR" && (
          <View
            style={[
              styles.errorBadge,
              {
                width: size * 0.3,
                height: size * 0.3,
                borderRadius: (size * 0.3) / 2,
              },
            ]}
          >
            <Text style={[styles.errorBadgeText, { fontSize: size * 0.18 }]}>
              !
            </Text>
          </View>
        )}
      </View>

      {name && (
        <Text style={styles.deviceName} numberOfLines={1}>
          {name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  iconWrapper: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  errorBorder: {
    borderColor: "#FF4D4D",
  },
  errorBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF4D4D",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  errorBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  deviceName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
});
