import type { EventResult } from "@/lib/types";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export type ResultCalendarMonth = {
  key: string;
  title: string;
  cells: Array<{
    date: string;
    day: number;
    result: EventResult | null;
  } | null>;
};

function getMonthTitle(year: number, month: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long"
  }).format(new Date(Date.UTC(year, month, 1)));
}

export function buildResultCalendarMonths(results: EventResult[]): ResultCalendarMonth[] {
  const resultMap = new Map(results.map((result) => [result.date, result]));
  const monthKeys = [...new Set(results.map((result) => result.date.slice(0, 7)))].sort();

  return monthKeys.map((key) => {
    const [yearText, monthText] = key.split("-");
    const year = Number(yearText);
    const month = Number(monthText) - 1;
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const cells: ResultCalendarMonth["cells"] = Array.from(
      { length: firstDay.getUTCDay() },
      () => null
    );

    for (let day = 1; day <= lastDay.getUTCDate(); day += 1) {
      const date = `${yearText}-${monthText}-${String(day).padStart(2, "0")}`;
      cells.push({
        date,
        day,
        result: resultMap.get(date) ?? null
      });
    }

    return {
      key,
      title: getMonthTitle(year, month),
      cells
    };
  });
}

export { weekdays as resultCalendarWeekdays };

export function followupVoteDatesByDateAsc(
  results: EventResult[],
  bestDateSet: Set<string>
): EventResult[] {
  return results
    .filter((row) => row.count > 0 && !bestDateSet.has(row.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
}
