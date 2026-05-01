import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

// 달력 한글화
LocaleConfig.locales["kr"] = {
  monthNames: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  monthNamesShort: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  dayNames: [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  today: "오늘",
};
LocaleConfig.defaultLocale = "kr";

interface CalendarViewProps {
  selectedDate: string;
  onDateSelect?: (date: string) => void;
  // 클릭을 위한 객체
  markedDates?: any;
}

export default function CalendarView({
  selectedDate,
  onDateSelect,
  markedDates,
}: CalendarViewProps) {
  return (
    <View style={styles.calendarContainer}>
      <Calendar
        current={selectedDate}
        onDayPress={(day: any) => {
          if (onDateSelect) onDateSelect(day.dateString);
        }}
        theme={{
          calendarBackground: "transparent",
          textSectionTitleColor: "#b6b9be",
          selectedDayBackgroundColor: Colors.light.tint,
          selectedDayTextColor: "#ffffff",
          todayTextColor: Colors.light.tint,
          dayTextColor: Colors.light.text,
          arrowColor: Colors.light.tint,
          monthTextColor: Colors.light.text,
          textDayFontWeight: "500",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "bold",
        }}
        markingType={"multi-dot"}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates?.[selectedDate] || {}),
            selected: true,
            selectedColor: Colors.light.tint,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: "#EBF2FA",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
});
