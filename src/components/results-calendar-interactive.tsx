"use client";

import { useState } from "react";

import { ParticipantAvatar } from "@/components/participant-avatar";
import { formatKoreanDate } from "@/lib/date";
import type { EventResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ResultCalendarMonth } from "@/lib/result-calendar";
import { resultCalendarWeekdays } from "@/lib/result-calendar";

type ResultsCalendarInteractiveProps = {
  months: ResultCalendarMonth[];
  bestDateSet: string[];
  results: EventResult[];
};

export function ResultsCalendarInteractive({
  months,
  bestDateSet: bestDateList,
  results
}: ResultsCalendarInteractiveProps) {
  const bestDateSet = new Set(bestDateList);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const resultMap = new Map(results.map((row) => [row.date, row]));
  const selectedResult = selectedDate ? resultMap.get(selectedDate) : undefined;

  return (
    <div className="grid gap-4">
      <section className="grid gap-4" aria-label="날짜별 선택 현황 달력">
        {months.map((month) => (
          <div className="hb-calendar-surface p-3 sm:p-4" key={month.key}>
            <div className="mb-3 flex items-center justify-between px-0.5">
              <h2 className="text-base font-black tracking-[-0.03em] text-stone-950 sm:text-lg">
                {month.title}
              </h2>
              <span className="text-[0.65rem] font-bold uppercase tracking-wide text-stone-400">
                탭하여 누가 골랐는지
              </span>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[0.68rem] font-bold text-stone-400">
              {resultCalendarWeekdays.map((weekday, wi) => (
                <span
                  className={cn((wi === 0 || wi === 6) && "font-black text-red-500")}
                  key={weekday}
                >
                  {weekday}
                </span>
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
                const isSelected = selectedDate === cell.date;

                return (
                  <button
                    className={cn(
                      "relative flex aspect-square min-h-10 flex-col items-center justify-center rounded-xl text-sm font-black transition hover:opacity-95",
                      isCandidate ? "bg-orange-50/90 text-stone-800" : "cursor-default bg-stone-100/50 text-stone-300",
                      count > 0 &&
                        "bg-white text-stone-950 ring-1 ring-orange-200/90 shadow-sm",
                      isBest &&
                        "bg-orange-500 text-white shadow-[0_8px_22px_-8px_rgb(234_88_12_/45%)] ring-0",
                      isSelected && !isBest && "ring-2 ring-orange-500 ring-offset-1",
                      isSelected && isBest && "ring-2 ring-amber-200 ring-offset-1"
                    )}
                    key={cell.date}
                    onClick={() => setSelectedDate(cell.date)}
                    type="button"
                  >
                    <span>{cell.day}</span>
                    {count > 0 ? (
                      <span
                        className={cn(
                          "mt-0.5 rounded-full px-1.5 py-0.5 text-[0.62rem] leading-none font-bold",
                          isBest ? "bg-white text-orange-600" : "bg-orange-100 text-orange-800"
                        )}
                      >
                        {count}명
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="hb-calendar-surface min-h-[4.5rem] p-4">
        {!selectedDate ? (
          <p className="text-sm text-stone-500">달력에서 날짜를 누르면 투표한 사람이 표시됩니다.</p>
        ) : !selectedResult ? (
          <p className="text-sm text-stone-500">이 날은 후보에 없습니다.</p>
        ) : selectedResult.count === 0 ? (
          <p className="text-sm font-bold text-stone-700">
            {formatKoreanDate(selectedDate)} — 아직 아무도 고르지 않았어요.
          </p>
        ) : (
          <div className="grid gap-3">
            <p className="text-sm font-black text-stone-900">{formatKoreanDate(selectedDate)}</p>
            <div className="flex flex-wrap gap-2">
              {selectedResult.participants.map((participant) => (
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50/90 px-3 py-1.5 text-sm font-bold text-stone-800"
                  key={participant.id}
                >
                  <ParticipantAvatar
                    avatarUrl={participant.avatarUrl}
                    name={participant.name}
                    size={28}
                  />
                  {participant.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
