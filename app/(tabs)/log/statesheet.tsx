import { Stack } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";

const ERROR_MASTER_DATA = [
  {
    코드: "HM-PO-01",
    오류명: "비상 정지 버튼 활성",
    심각도: "Critical",
    "대응 방법": "즉시 원인 확인, 점검 후 사용",
  },
  {
    코드: "HM-PO-02",
    오류명: "과전류 트립 발생",
    심각도: "Critical",
    "대응 방법": "차단기 점검 및 회로 부하 체크 후 복구",
  },
  {
    코드: "SV-PR-01",
    오류명: "부품 누락(Missing) 감지",
    심각도: "Critical",
    "대응 방법": "해당 제품 즉시 분리 및 원인 공정 확인",
  },
  {
    코드: "AM-NT-01",
    오류명: "임계치 초과 압력 미방출",
    심각도: "Critical",
    "대응 방법": "밸브 수동 개방 및 안전 장치 확인",
  },
  {
    코드: "HM-TE-01",
    오류명: "메인모터 과열 위험",
    심각도: "High",
    "대응 방법": "모터 온도 체크 및 냉각 팬 상태 점검",
  },
  {
    코드: "HS-VI-01",
    오류명: "컨베이어 진동 과다",
    심각도: "High",
    "대응 방법": "벨트 장력 조정 및 롤러 베어링 점검",
  },
  {
    코드: "HM-AC-01",
    오류명: "그리퍼 흡착 압력 저하",
    심각도: "High",
    "대응 방법": "진공 라인 및 씰 상태 확인",
  },
  {
    코드: "HM-PR-01",
    오류명: "기판용 레일 이탈",
    심각도: "High",
    "대응 방법": "즉시 장치 정지 및 레일 정렬 상태 확인",
  },
  {
    코드: "HM-PR-02",
    오류명: "구성 센서 감지 불량",
    심각도: "High",
    "대응 방법": "센서 거리 재조정 또는 교체",
  },
  {
    코드: "HM-PO-03",
    오류명: "전력 누전 감지",
    심각도: "High",
    "대응 방법": "즉시 전원 차단 후 절연 점검",
  },
  {
    코드: "HV-PR-01",
    오류명: "카메라 서버 오류",
    심각도: "High",
    "대응 방법": "네트워크 연결 상태 확인",
  },
  {
    코드: "HV-PR-02",
    오류명: "조명 컨트롤러 통신 불량",
    심각도: "High",
    "대응 방법": "데이터 케이블 및 전원 상태 체크",
  },
  {
    코드: "HS-NE-01",
    오류명: "LAN 케이블 통신 끊김",
    심각도: "High",
    "대응 방법": "케이블 교체 및 허브 포트 확인",
  },
  {
    코드: "HS-DA-01",
    오류명: "SD 카드 쓰기 실패",
    심각도: "High",
    "대응 방법": "저장 용량 확인 및 SD 카드 교체",
  },
  {
    코드: "HS-PO-01",
    오류명: "메인 전압 불안정",
    심각도: "High",
    "대응 방법": "전원 장치 점검 및 UPS 상태 확인",
  },
  {
    코드: "SV-PR-02",
    오류명: "물리적 찍힘(Dent) 감지",
    심각도: "High",
    "대응 방법": "이전 공정 트레이 및 흡착기 점검",
  },
  {
    코드: "SV-PR-03",
    오류명: "표면 변색 감지",
    심각도: "High",
    "대응 방법": "클리닝 공정 체크 및 화이트 밸런스 조정",
  },
  {
    코드: "SV-PR-04",
    오류명: "크랙 감지(Crack)",
    심각도: "High",
    "대응 방법": "파손 제품 분리 및 원인 분석",
  },
  {
    코드: "SS-DA-01",
    오류명: "DB 쓰기 권한 오류",
    심각도: "High",
    "대응 방법": "DB 계정 권한 재설정 및 서버 확인",
  },
  {
    코드: "SS-NE-01",
    오류명: "소켓 연결 끊김",
    심각도: "High",
    "대응 방법": "네트워크 서버 및 클라이언트 상태 확인",
  },
  {
    코드: "AM-CN-01",
    오류명: "모니터링 기기 연결 해제",
    심각도: "High",
    "대응 방법": "연결 케이블 및 네트워크 설정 확인",
  },
  {
    코드: "AM-CN-02",
    오류명: "센서 데이터 수신 실패",
    심각도: "High",
    "대응 방법": "데이터 송수신 주기 점검",
  },
  {
    코드: "AM-SV-01",
    오류명: "실시간 모니터링 동기화 환경",
    심각도: "High",
    "대응 방법": "대시보드 데이터 갱신 여부 확인",
  },
  {
    코드: "AM-TM-01",
    오류명: "센서 응답 타임아웃",
    심각도: "High",
    "대응 방법": "센서 노드 상태 확인",
  },
  {
    코드: "AM-VL-01",
    오류명: "센서값 유효 범위 초과",
    심각도: "High",
    "대응 방법": "센서 보정값 재설정",
  },
  {
    코드: "AN-CN-01",
    오류명: "서버 연결 실패",
    심각도: "High",
    "대응 방법": "랜선 및 허브 전원 확인",
  },
  {
    코드: "AN-CN-02",
    오류명: "WebSocket 연결 해제",
    심각도: "High",
    "대응 방법": "서버 상태 및 포트 개방 확인",
  },
  {
    코드: "AN-CN-03",
    오류명: "API 호출 실패",
    심각도: "High",
    "대응 방법": "API 서버 엔드포인트 점검",
  },
  {
    코드: "AH-CN-01",
    오류명: "장비 통신 연결 실패",
    심각도: "High",
    "대응 방법": "연결 케이블 물리적 상태 확인",
  },
  {
    코드: "AH-CN-02",
    오류명: "장비 응답 없음",
    심각도: "High",
    "대응 방법": "장비 전원 및 로컬 제어기 점검",
  },
  {
    코드: "AH-TM-01",
    오류명: "장비 응답 타임아웃",
    심각도: "High",
    "대응 방법": "장비 제어 보드 부하 확인",
  },
  {
    코드: "HM-TE-02",
    오류명: "냉각수 부족 주의",
    심각도: "Medium",
    "대응 방법": "냉각수 보충 및 누수 여부 확인",
  },
  {
    코드: "HV-VA-01",
    오류명: "카메라 각도 미세 이탈",
    심각도: "Medium",
    "대응 방법": "카메라 마운트 고정 상태 확인",
  },
  {
    코드: "HV-PR-03",
    오류명: "이미지 노이즈 과다",
    심각도: "Medium",
    "대응 방법": "카메라 케이블 차폐 점검",
  },
  {
    코드: "SV-PR-05",
    오류명: "미세 스크래치 감지",
    심각도: "Medium",
    "대응 방법": "이송 경로 가이드 레일 점검",
  },
  {
    코드: "SV-PR-06",
    오류명: "이물질(Dust) 감지",
    심각도: "Medium",
    "대응 방법": "공기 정화 장치 및 에어건 확인",
  },
  {
    코드: "SV-VA-01",
    오류명: "AI 판독 신뢰도 저하",
    심각도: "Medium",
    "대응 방법": "조명 환경 및 학습 데이터 보강",
  },
  {
    코드: "SV-VA-02",
    오류명: "이미지 데이터 누락",
    심각도: "Medium",
    "대응 방법": "캡처 트리거 타이밍 재조정",
  },
  {
    코드: "SV-VA-03",
    오류명: "프레임 드롭 발생",
    심각도: "Medium",
    "대응 방법": "비전 PC CPU/GPU 부하 점검",
  },
  {
    코드: "AD-DA-01",
    오류명: "로컬 저장 실패",
    심각도: "Medium",
    "대응 방법": "저장소 용량 확인",
  },
  {
    코드: "AD-VL-01",
    오류명: "데이터 누락",
    심각도: "Medium",
    "대응 방법": "데이터베이스 저장 프로시저 확인",
  },
  {
    코드: "AD-PR-01",
    오류명: "JSON 파싱 오류",
    심각도: "Medium",
    "대응 방법": "수신 데이터 형식 유효성 확인",
  },
  {
    코드: "AB-AT-01",
    오류명: "로그인 실패",
    심각도: "Medium",
    "대응 방법": "사용자 계정 정보 확인",
  },
  {
    코드: "AB-AT-02",
    오류명: "액세스 토큰 만료",
    심각도: "Medium",
    "대응 방법": "자동 재로그인 로직 확인",
  },
  {
    코드: "AB-AT-03",
    오류명: "비정상 접속 시도 감지",
    심각도: "Medium",
    "대응 방법": "IP 차단 및 보안 로그 확인",
  },
  {
    코드: "AN-TM-01",
    오류명: "요청 타임아웃",
    심각도: "Medium",
    "대응 방법": "네트워크 대역폭 확인",
  },
  {
    코드: "AN-SY-01",
    오류명: "서버 데이터 동기화 지연",
    심각도: "Medium",
    "대응 방법": "동기화 주기 재설정",
  },
  {
    코드: "AM-NT-02",
    오류명: "알림 전송 실패",
    심각도: "Medium",
    "대응 방법": "알림 서버 연동 상태 확인",
  },
  {
    코드: "AH-PR-01",
    오류명: "장비 상태 동기화 지연",
    심각도: "Medium",
    "대응 방법": "장비 로컬 데이터베이스 점검",
  },
  {
    코드: "AX-IN-01",
    오류명: "초기화 실패",
    심각도: "Medium",
    "대응 방법": "장비 하드웨어 초기화 버튼 확인",
  },
];

export default function StateSheetScreen() {
  const getSeverityStyle = (severity: string) => {
    const s = severity.toUpperCase();
    if (s.includes("CRITICAL")) return { bg: "#FF4D4D", text: "#FFF" };
    if (s.includes("HIGH")) return { bg: "#FFB347", text: "#FFF" };
    return { bg: "#F1C40F", text: "#000" };
  };

  const renderRow = ({ item }: { item: (typeof ERROR_MASTER_DATA)[0] }) => {
    const style = getSeverityStyle(item.심각도);
    return (
      <View style={styles.tableRow}>
        <View style={[styles.cell, { flex: 1.2 }]}>
          <Text style={styles.codeText}>{item.코드}</Text>
        </View>
        <View style={[styles.cell, { flex: 2 }]}>
          <Text style={styles.nameText}>{item.오류명}</Text>
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <View style={[styles.severityBadge, { backgroundColor: style.bg }]}>
            <Text style={[styles.severityText, { color: style.text }]}>
              {item.심각도}
            </Text>
          </View>
        </View>
        <View style={[styles.cell, { flex: 2.5 }]}>
          <Text style={styles.solutionText}>{item["대응 방법"]}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.headerTitle}>통합 핵심 오류코드 식별표</Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.columnLabel, { flex: 1.2 }]}>코드</Text>
          <Text style={[styles.columnLabel, { flex: 2 }]}>오류명</Text>
          <Text style={[styles.columnLabel, { flex: 1 }]}>심각도</Text>
          <Text style={[styles.columnLabel, { flex: 2.5 }]}>대응 방법</Text>
        </View>
        <FlatList
          data={ERROR_MASTER_DATA}
          keyExtractor={(item) => item.코드}
          renderItem={renderRow}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  pageHeader: {
    backgroundColor: "#1D1D5A",
    paddingVertical: 15,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4A4A6A",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  columnLabel: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingVertical: 12,
    paddingHorizontal: 5,
    alignItems: "center",
  },
  cell: { justifyContent: "center", paddingHorizontal: 2 },
  codeText: { fontSize: 11, fontWeight: "700", color: "#333" },
  nameText: { fontSize: 12, color: "#333" },
  severityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  severityText: { fontSize: 9, fontWeight: "bold" },
  solutionText: { fontSize: 11, color: "#666" },
});
