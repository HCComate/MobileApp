import { MOCK_WORKERS, Worker } from "./workers";

export interface DailySchedule {
  date: string; // "YYYY-MM-DD"
  workers: Worker[];
}

// 특정 연도와 월의 모든 날짜에 대해 최소 3명 이상의 근무자를 자동 배정합니다.
export const generateMonthlySchedule = (
  year: number,
  month: number,
): DailySchedule[] => {
  const schedule: DailySchedule[] = [];

  // 해당 월의 마지막 날짜 구하기 (윤달 등 자동 계산)
  const lastDay = new Date(year, month, 0).getDate();

  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    // 날짜와 인덱스 조합으로 근무자 선택
    let dailyWorkers = MOCK_WORKERS.filter((_, index) => {
      // 날짜(day)와 월(month)을 조합해 매일 다른 패턴 생성
      const seed = (day + month + index) % 5;
      // 인덱스 0, 1은 고정 배치하고 나머지는 시드에 따라 선택 (최소 3명 유도)
      return index < 2 || seed < 2;
    });

    // 3명 미만일 경우 부족한 인원 보충
    if (dailyWorkers.length < 3) {
      const remainingWorkers = MOCK_WORKERS.filter(
        (mw) => !dailyWorkers.find((dw) => dw.id === mw.id),
      );

      while (dailyWorkers.length < 3 && remainingWorkers.length > 0) {
        dailyWorkers.push(remainingWorkers.shift()!);
      }
    }

    schedule.push({
      date: dateStr,
      workers: dailyWorkers,
    });
  }

  return schedule;
};

const now = new Date();
export const INITIAL_SCHEDULE = generateMonthlySchedule(
  now.getFullYear(),
  now.getMonth() + 1,
);
