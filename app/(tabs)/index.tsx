import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView from "../../components/CalendarView";
import Header from "../../components/Header";
import InfoBanner from "../../components/InfoBanner";
import MenuButtons from "../../components/MenuButtons";
import { Colors } from "../../constants/Colors";
import { dailyMessages } from "../../constants/DailyMessages";

export default function HomeScreen() {
  // 오늘 날짜 상태 관리
  const [today] = useState(new Date());
  const theme = useColorScheme() ?? "light";
  const router = useRouter();

  // 날짜 관련 데이터 계산
  const month = (today.getMonth() + 1).toString();
  const day = today.getDate().toString();
  const dayOfWeek = today.getDay();
  const calendarDate = today.toISOString().split("T")[0];

  // 홈 화면에서 사용할 메뉴 구성
  const HOME_MENU = ["장비 통계", "근무표", "전체 일정", "공지사항"];

  // 버튼 클릭 이벤트 핸들러
  const handleMenuPress = (item: string) => {
    switch (item) {
      case "장비 통계":
        router.push("/statistics");
        break;
      case "근무표":
        router.push("/schedule");
        break;
      case "전체 일정":
        router.push("/plan");
        break;
      case "공지사항":
        router.push("/notice");
        break;
      default:
        console.log(`${item} 메뉴 클릭됨`);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}
      edges={["top", "right", "left"]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* 헤더바 */}
      <Header />

      <ScrollView
        style={[
          styles.mainContainer,
          { backgroundColor: Colors[theme].background },
        ]}
        // flexGrow: 1을 통해 화면 전체를 채우게 하고, 하단 여백 확보
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        {/* 날짜 섹션 */}
        <View style={styles.dateSection}>
          <Text style={[styles.dateTitle, { color: Colors[theme].text }]}>
            {month}월 {day}일
          </Text>
          <Text style={[styles.dateSubtitle, { color: Colors[theme].text }]}>
            {dailyMessages[dayOfWeek]}
          </Text>
        </View>

        {/* 안내 배너 */}
        <InfoBanner text="VisionMate에 오신걸 환영합니다." />

        <View style={styles.calendarContainer}>
          <CalendarView key={theme} selectedDate={calendarDate} />
        </View>

        {/* 달력과 버튼 사이를 유연하게 채워주는 빈 공간 */}
        <View style={{ flex: 1 }} />

        <View style={styles.menuContainer}>
          <MenuButtons items={HOME_MENU} onPress={handleMenuPress} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateSection: {
    marginTop: 10,
    marginBottom: 5,
  },
  dateTitle: {
    fontSize: 34,
    fontWeight: "bold",
  },
  dateSubtitle: {
    fontSize: 20,
    marginTop: 4,
    fontWeight: "500",
  },
  calendarContainer: {
    marginVertical: 10,
    width: "100%",
  },
  menuContainer: {
    paddingTop: 10,
    marginBottom: 5,
    zIndex: 10,
  },
});