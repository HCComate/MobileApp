import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PageHeaderProps = {
  title: string;
  showBack?: boolean;
};

export default function PageHeader({
  title,
  showBack = true,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.pageHeader}>
      {showBack ? (
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.sidePlaceholder} />
      )}

      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.sidePlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    backgroundColor: "#1D1D5A",
    paddingVertical: 20,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },
  backBtn: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 8,
  },
  backText: {
    fontSize: 28,
    color: "#FFFFFF",
  },
  sidePlaceholder: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
