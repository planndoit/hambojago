"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatKoreanDate } from "@/lib/date";
import type { EventDate } from "@/lib/types";
import { cn } from "@/lib/utils";

type ParticipationFormProps = {
  slug: string;
  dates: EventDate[];
  selectedParticipantId?: string;
};

type MeResponse = {
  participant: { id: string; name: string } | null;
  dates: string[];
};

type VerifyResponse = {
  editToken?: string;
  participant?: { id: string; name: string };
  dates?: string[];
  message?: string;
};

const tokenKey = (slug: string) => `hamboja:event:${slug}:participantToken`;
const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

type CalendarMonth = {
  key: string;
  title: string;
  cells: Array<{
    date: string;
    day: number;
    isCandidate: boolean;
  } | null>;
};

function getMonthTitle(year: number, month: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long"
  }).format(new Date(Date.UTC(year, month, 1)));
}

function getCalendarMonths(dates: EventDate[]): CalendarMonth[] {
  const dateSet = new Set(dates.map((eventDate) => eventDate.date));
  const monthKeys = [...new Set(dates.map((eventDate) => eventDate.date.slice(0, 7)))].sort();

  return monthKeys.map((key) => {
    const [yearText, monthText] = key.split("-");
    const year = Number(yearText);
    const month = Number(monthText) - 1;
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const cells: CalendarMonth["cells"] = Array.from({ length: firstDay.getUTCDay() }, () => null);

    for (let day = 1; day <= lastDay.getUTCDate(); day += 1) {
      const date = `${yearText}-${monthText}-${String(day).padStart(2, "0")}`;
      cells.push({
        date,
        day,
        isCandidate: dateSet.has(date)
      });
    }

    return {
      key,
      title: getMonthTitle(year, month),
      cells
    };
  });
}

export function ParticipationForm({
  slug,
  dates,
  selectedParticipantId
}: ParticipationFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [isParticipantVerified, setIsParticipantVerified] = useState(!selectedParticipantId);
  const [isPending, startTransition] = useTransition();

  const selectedCount = selectedDates.size;
  const calendarMonths = useMemo(() => getCalendarMonths(dates), [dates]);
  const canEditSelection = !selectedParticipantId || isParticipantVerified;

  useEffect(() => {
    if (selectedParticipantId) {
      return;
    }

    const storedToken = window.localStorage.getItem(tokenKey(slug)) ?? "";

    if (!storedToken) {
      return;
    }

    fetch(`/api/events/${slug}/participants/me?token=${encodeURIComponent(storedToken)}`)
      .then((response) => response.json() as Promise<MeResponse>)
      .then((data) => {
        if (!data.participant) {
          return;
        }

        setName(data.participant.name);
        setSelectedDates(new Set(data.dates));
      })
      .catch(() => {
        setMessage("기존 선택을 불러오지 못했습니다.");
      });
  }, [selectedParticipantId, slug]);

  function toggleDate(date: string) {
    setSelectedDates((current) => {
      const next = new Set(current);

      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }

      return next;
    });
  }

  function submit() {
    startTransition(async () => {
      setMessage("");
      const storedToken = window.localStorage.getItem(tokenKey(slug)) ?? "";

      const response = await fetch(`/api/events/${slug}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          pin,
          dates: [...selectedDates],
          editToken: storedToken
        })
      });

      const data = (await response.json()) as { editToken?: string; message?: string };

      if (!response.ok || !data.editToken) {
        setMessage(data.message ?? "선택을 저장하지 못했습니다.");
        return;
      }

      window.localStorage.setItem(tokenKey(slug), data.editToken);
      router.push(`/e/${slug}/results`);
      router.refresh();
    });
  }

  function verifyParticipant() {
    if (!selectedParticipantId) {
      return;
    }

    startTransition(async () => {
      setMessage("");

      const response = await fetch(`/api/events/${slug}/participants/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          participantId: selectedParticipantId,
          pin
        })
      });

      const data = (await response.json()) as VerifyResponse;

      if (!response.ok || !data.editToken || !data.participant || !data.dates) {
        setMessage(data.message ?? "선택을 불러오지 못했습니다.");
        return;
      }

      window.localStorage.setItem(tokenKey(slug), data.editToken);
      setName(data.participant.name);
      setSelectedDates(new Set(data.dates));
      setIsParticipantVerified(true);
      setMessage("");
    });
  }

  if (!canEditSelection) {
    return (
      <div className="grid gap-5 pb-5">
        <div className="rounded-[1.75rem] bg-orange-50 p-4">
          <p className="text-sm font-black text-orange-700">선택 수정</p>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            처음 입력한 4자리 PIN을 확인한 뒤 기존 선택을 불러옵니다.
          </p>
        </div>
        <Label>
          <span>처음 입력한 4자리 PIN</span>
          <Input
            inputMode="numeric"
            maxLength={4}
            onChange={(event) => setPin(event.target.value)}
            pattern="\d{4}"
            placeholder="1234"
            value={pin}
          />
        </Label>
        {message ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{message}</p> : null}
        <Button
          className="w-full"
          disabled={isPending || !/^\d{4}$/.test(pin)}
          onClick={verifyParticipant}
          size="lg"
          type="button"
        >
          기존 선택 불러오기
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="grid gap-4" aria-label="후보 날짜 달력">
        <div className="flex items-center justify-between rounded-3xl bg-orange-50 px-4 py-3">
          <div>
            <p className="text-xs font-bold text-orange-700">선택한 날짜</p>
            <p className="text-lg font-black text-stone-950">{selectedCount}개</p>
          </div>
          <ChevronDown className="size-5 text-orange-500" />
        </div>
        {calendarMonths.map((month) => (
          <div className="rounded-[1.75rem] border border-orange-100 bg-white p-3" key={month.key}>
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-lg font-black tracking-[-0.03em] text-stone-950">
                {month.title}
              </h2>
              <span className="text-xs font-bold text-stone-400">복수 선택</span>
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

                const selected = selectedDates.has(cell.date);

                return (
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "relative flex aspect-square min-h-10 items-center justify-center rounded-2xl text-sm font-black transition active:scale-95",
                      cell.isCandidate
                        ? "bg-orange-50 text-stone-800 shadow-sm hover:bg-orange-100"
                        : "cursor-not-allowed bg-stone-50 text-stone-300",
                      selected && "bg-orange-500 text-white shadow-lg shadow-orange-500/25 hover:bg-orange-500"
                    )}
                    disabled={!cell.isCandidate}
                    key={cell.date}
                    onClick={() => toggleDate(cell.date)}
                    type="button"
                  >
                    {cell.day}
                    {selected ? (
                      <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-white text-orange-500">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>
      {selectedCount > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[...selectedDates].sort().map((date) => (
            <span
              className="shrink-0 rounded-full bg-stone-900 px-3 py-2 text-xs font-bold text-white"
              key={date}
            >
              {formatKoreanDate(date)}
            </span>
          ))}
        </div>
      ) : null}
      <Label>
        <span>이름</span>
        <Input
          onChange={(event) => setName(event.target.value)}
          placeholder="홍길동"
          value={name}
        />
      </Label>
      <Label>
        <span>처음 입력한 4자리 PIN</span>
        <Input
          inputMode="numeric"
          maxLength={4}
          onChange={(event) => setPin(event.target.value)}
          pattern="\d{4}"
          placeholder="1234"
          value={pin}
        />
      </Label>
      {message ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{message}</p> : null}
      <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-white via-white to-white/0 px-5 pb-5 pt-8">
        <Button
          className="w-full"
          disabled={isPending || selectedCount === 0 || !name || !/^\d{4}$/.test(pin)}
          onClick={submit}
          size="lg"
          type="button"
        >
          선택 완료
        </Button>
      </div>
    </div>
  );
}
