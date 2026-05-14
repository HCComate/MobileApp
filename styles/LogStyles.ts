import { StyleSheet } from "react-native";

export const LogStyles = StyleSheet.create({
  columnHeader: {
    flexDirection: "row",
    backgroundColor: "#4A4A6A",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },

  columnText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },

  logRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    alignItems: "center",
  },

  deviceCell: {
    flex: 0.8,
    alignItems: "center",
  },

  timeCell: {
    flex: 1,
    alignItems: "center",
  },

  msgCell: {
    flex: 2,
    paddingLeft: 15,
    justifyContent: "center",
  },

  cellText: {
    fontSize: 14,
    fontWeight: "500",
  },

  timeText: {
    fontSize: 11,
  },
});
