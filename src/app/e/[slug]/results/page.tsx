import Link from "next/link";
import { Trophy } from "lucide-react";

import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKoreanDate } from "@/lib/date";
import { getEventResults } from "@/lib/events";
import type { EventResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

type ResultCalendarMonth = {
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

function getResultCalendarMonths(results: EventResult[]): ResultCalendarMonth[] {
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

export default async function ResultsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event, results, participantCount, bestDates } = await getEventResults(slug);
  const bestDateSet = new Set(bestDates.map((result) => result.date));
  const votedResults = results.filter((result) => result.count > 0);
  const calendarMonths = getResultCalendarMonths(results);

  return (
    <MobileShell className="grid content-start gap-4">
      <Card>
        <CardHeader>
          <p className="text-sm font-black text-orange-600">결과</p>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>현재 {participantCount}명이 선택했어요.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {bestDates[0] ? (
            <div className="rounded-[1.75rem] bg-stone-950 p-5 text-white">
              <Trophy className="mb-3 size-7 text-orange-300" />
              <strong className="text-xl leading-tight">
                {formatKoreanDate(bestDates[0].date)}이 가장 유력해요
              </strong>
              <p className="mt-2 text-sm text-stone-300">
                {bestDates[0].count}명이 선택했습니다.
              </p>
            </div>
          ) : (
            <p className="rounded-3xl bg-stone-50 p-4 text-sm text-stone-500">
              아직 선택한 사람이 없습니다.
            </p>
          )}
          <section className="grid gap-3" aria-label="날짜별 선택 현황 달력">
            {calendarMonths.map((month) => (
              <div
                className="rounded-[1.75rem] border border-orange-100 bg-white p-3"
                key={month.key}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-lg font-black tracking-[-0.03em] text-stone-950">
                    {month.title}
                  </h2>
                  <span className="text-xs font-bold text-stone-400">선택 인원</span>
                </div>
                <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[0.7rem] font-bold text-stone-400">
                  {weekdays.map((weekday) => (
                    <span key={weekday}>{weekday}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {month.cells.map((cell, index) => {
                    if (!cell) {
                      return <div aria-hidden="true" key={`${month.key}-blank-${index}`} />;
                    }

                    const count = cell.result?.count ?? 0;
                    const isCandidate = Boolean(cell.result);
                    const isBest = bestDateSet.has(cell.date);

                    return (
                      <div
                        className={cn(
                          "relative flex aspect-square min-h-10 flex-col items-center justify-center rounded-2xl text-sm font-black",
                          isCandidate ? "bg-orange-50 text-stone-800" : "bg-stone-50 text-stone-300",
                          count > 0 && "bg-white text-stone-950 ring-1 ring-orange-200",
                          isBest && "bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-0"
                        )}
                        key={cell.date}
                      >
                        <span>{cell.day}</span>
                        {count > 0 ? (
                          <span
                            className={cn(
                              "mt-0.5 rounded-full px-1.5 py-0.5 text-[0.62rem] leading-none",
                              isBest ? "bg-white text-orange-600" : "bg-orange-100 text-orange-700"
                            )}
                          >
                            {count}명
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
          {votedResults.length > 0 ? (
            <div className="grid gap-3">
              {votedResults.map((result) => (
                <div
                  className={cn(
                    "rounded-3xl border bg-white p-4",
                    bestDateSet.has(result.date)
                      ? "border-orange-400 ring-4 ring-orange-100"
                      : "border-orange-100"
                  )}
                  key={result.date}
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-base">{formatKoreanDate(result.date)}</strong>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                      {result.count}명
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-500">{result.participants.join(", ")}</p>
                </div>
              ))}
            </div>
          ) : null}
          <Button asChild size="lg" className="w-full">
            <Link href={`/e/${event.slug}`}>내 선택 수정하기</Link>
          </Button>
        </CardContent>
      </Card>
    </MobileShell>
  );
}
