import { StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

export const PageStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  container: {
    flex: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
  },
});
