"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CalendarHeart, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatKoreanDate } from "@/lib/date";
import { isVotingClosed } from "@/lib/event-voting";
import { getKrDayMeta } from "@/lib/kr-calendar";
import type { EventDate } from "@/lib/types";
import { formatSeoulDateTimeLabel } from "@/lib/seoul-time";
import { cn } from "@/lib/utils";
import { PendingOverlay } from "@/components/pending-overlay";

type ParticipationFormProps = {
  slug: string;
  dates: EventDate[];
  selectedParticipantId?: string;
  voteDeadline: string | null;
  participantAccount?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
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
  selectedParticipantId,
  voteDeadline,
  participantAccount
}: ParticipationFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [isParticipantVerified, setIsParticipantVerified] = useState(!selectedParticipantId);
  const [isPending, startTransition] = useTransition();
  const didPrefillFromAccount = useRef(false);

  const selectedCount = selectedDates.size;
  const calendarMonths = useMemo(() => getCalendarMonths(dates), [dates]);
  const canEditSelection = !selectedParticipantId || isParticipantVerified;
  const votingClosed = isVotingClosed(voteDeadline);

  useEffect(() => {
    if (selectedParticipantId || !participantAccount || didPrefillFromAccount.current) {
      return;
    }

    const label = participantAccount.display_name?.trim() || participantAccount.username;
    setName(label);
    didPrefillFromAccount.current = true;
  }, [participantAccount, selectedParticipantId]);

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

        if (data.dates.length > 0) {
          router.replace(`/e/${slug}/results`);
          return;
        }

        setName(data.participant.name);
        setSelectedDates(new Set(data.dates));
      })
      .catch(() => {
        setMessage("기존 선택을 불러오지 못했습니다.");
      });
  }, [selectedParticipantId, slug, router]);

  function toggleDate(date: string) {
    if (votingClosed) {
      return;
    }

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
      <div className="relative grid gap-5 pb-6">
        <PendingOverlay show={isPending} />
        {votingClosed ? (
          <p className="rounded-2xl bg-stone-900 p-4 text-sm font-bold text-orange-100">
            투표 마감({voteDeadline ? formatSeoulDateTimeLabel(voteDeadline) : ""})이 지나 선택을 바꿀 수
            없습니다.
          </p>
        ) : null}
        <div className="hb-calendar-surface p-4">
          <p className="text-sm font-black text-stone-900">선택 수정</p>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            처음 입력한 4자리 PIN을 입력하면 기존 선택을 불러옵니다.
          </p>
        </div>
        <Label>
          <span>4자리 PIN</span>
          <Input
            disabled={votingClosed}
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
          disabled={isPending || !/^\d{4}$/.test(pin) || votingClosed}
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
    <div className="relative grid gap-5">
      <PendingOverlay show={isPending} />
      {votingClosed ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-900">
          <BarChart3 className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-black">투표가 마감되었습니다.</p>
            <p className="mt-1 leading-relaxed">
              {voteDeadline ? `마감: ${formatSeoulDateTimeLabel(voteDeadline)}` : null} 새로 선택하거나
              수정할 수 없어요. 결과만 확인할 수 있습니다.
            </p>
          </div>
        </div>
      ) : null}
      <section className="grid gap-4" aria-label="후보 날짜 달력">
        <div className="hb-calendar-surface flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <CalendarHeart className="size-5" />
            </span>
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-wide text-stone-500">
                선택한 날짜
              </p>
              <p className="text-lg font-black text-stone-950">{selectedCount}개</p>
            </div>
          </div>
        </div>
        {calendarMonths.map((month) => (
          <div className="hb-calendar-surface p-3 sm:p-4" key={month.key}>
            <div className="mb-3 flex items-center justify-between px-0.5">
              <h2 className="text-base font-black tracking-[-0.03em] text-stone-950 sm:text-lg">
                {month.title}
              </h2>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[0.65rem] font-bold text-orange-800">
                복수 선택
              </span>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[0.68rem] font-bold text-stone-400">
              {weekdays.map((weekday, wi) => (
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

                const selected = selectedDates.has(cell.date);
                const meta = getKrDayMeta(cell.date);
                const redDay = meta.isWeekend || meta.isHoliday;
                const titleAttr = meta.holidayName ?? undefined;

                return (
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "relative flex aspect-square min-h-10 items-center justify-center rounded-xl text-sm font-black transition active:scale-[0.96]",
                      cell.isCandidate
                        ? "bg-orange-50/90 text-stone-800 shadow-sm hover:bg-orange-100"
                        : "cursor-not-allowed bg-stone-100/60 text-stone-300",
                      selected &&
                        "bg-orange-500 text-white shadow-[0_8px_20px_-6px_rgb(234_88_12_/55%)] hover:bg-orange-500",
                      redDay &&
                        cell.isCandidate &&
                        !selected &&
                        "text-red-600 hover:text-red-700",
                      redDay && !cell.isCandidate && !selected && "text-red-400"
                    )}
                    disabled={!cell.isCandidate || votingClosed}
                    key={cell.date}
                    onClick={() => toggleDate(cell.date)}
                    title={titleAttr}
                    type="button"
                  >
                    {cell.day}
                    {selected ? (
                      <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
                        <Check className="size-3" strokeWidth={3} />
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
        <div className="hb-calendar-surface px-3 py-3">
          <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-wide text-stone-500">
            선택 요약
          </p>
          <div className="flex flex-wrap gap-2">
            {[...selectedDates].sort().map((date) => (
              <span
                className="rounded-full border border-stone-200 bg-stone-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                key={date}
              >
                {formatKoreanDate(date)}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid gap-4 rounded-2xl border border-orange-100/80 bg-white/80 p-4 shadow-sm">
        <Label>
          <span>표시 이름</span>
          <Input
            disabled={votingClosed}
            onChange={(event) => setName(event.target.value)}
            placeholder="홍길동"
            value={name}
          />
        </Label>
        <Label>
          <span>4자리 PIN (나중에 수정할 때 필요해요)</span>
          <Input
            disabled={votingClosed}
            inputMode="numeric"
            maxLength={4}
            onChange={(event) => setPin(event.target.value)}
            pattern="\d{4}"
            placeholder="1234"
            value={pin}
          />
        </Label>
      </div>
      {message ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{message}</p> : null}
      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-orange-50 via-orange-50/95 to-transparent px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10 sm:-mx-5 sm:px-5">
        <Button
          className="w-full shadow-[0_14px_36px_-12px_rgb(234_88_12_/50%)]"
          disabled={
            votingClosed || isPending || selectedCount === 0 || !name || !/^\d{4}$/.test(pin)
          }
          onClick={submit}
          size="lg"
          type="button"
        >
          선택 완료하고 결과 보기
        </Button>
      </div>
    </div>
  );
}
