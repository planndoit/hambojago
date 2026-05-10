"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { formatKoreanDate } from "@/lib/date";
import type { EventDate } from "@/lib/types";

type ParticipationFormProps = {
  slug: string;
  dates: EventDate[];
};

type MeResponse = {
  participant: { id: string; name: string } | null;
  dates: string[];
};

const tokenKey = (slug: string) => `hamboja:event:${slug}:participantToken`;

export function ParticipationForm({ slug, dates }: ParticipationFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedCount = selectedDates.size;
  const sortedDates = useMemo(
    () => [...dates].sort((a, b) => a.date.localeCompare(b.date)),
    [dates]
  );

  useEffect(() => {
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
  }, [slug]);

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

  return (
    <div className="stack">
      <div className="calendar" aria-label="후보 날짜">
        {sortedDates.map((eventDate) => {
          const selected = selectedDates.has(eventDate.date);

          return (
            <button
              className={selected ? "date-button selected" : "date-button"}
              key={eventDate.date}
              onClick={() => toggleDate(eventDate.date)}
              type="button"
            >
              <strong>{formatKoreanDate(eventDate.date)}</strong>
            </button>
          );
        })}
      </div>
      <p className="muted">{selectedCount}개 날짜 선택됨</p>
      <label className="field">
        <span>이름</span>
        <input
          className="input"
          onChange={(event) => setName(event.target.value)}
          placeholder="홍길동"
          value={name}
        />
      </label>
      <label className="field">
        <span>4자리 PIN</span>
        <input
          className="input"
          inputMode="numeric"
          maxLength={4}
          onChange={(event) => setPin(event.target.value)}
          pattern="\d{4}"
          placeholder="1234"
          value={pin}
        />
      </label>
      {message ? <p className="muted">{message}</p> : null}
      <button
        className="button"
        disabled={isPending || selectedCount === 0 || !name || !/^\d{4}$/.test(pin)}
        onClick={submit}
        type="button"
      >
        선택 완료
      </button>
    </div>
  );
}
