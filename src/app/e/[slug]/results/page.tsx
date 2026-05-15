import Link from "next/link";
import { Trophy } from "lucide-react";

import { AppTopBar } from "@/components/app-top-bar";
import { ParticipantAvatar } from "@/components/participant-avatar";
import { ResultsCalendarInteractive } from "@/components/results-calendar-interactive";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildEventShareMetadata } from "@/config/site-share";
import { formatKoreanDate } from "@/lib/date";
import { getEventResults } from "@/lib/events";
import { buildResultCalendarMonths, followupVoteDatesByDateAsc } from "@/lib/result-calendar";
import { formatSeoulDateTimeLabel } from "@/lib/seoul-time";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await getEventResults(slug);

  return {
    ...buildEventShareMetadata(`${event.title} · 결과`, event.description)
  };
}

export default async function ResultsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event, results, participantCount, bestDates, participants } = await getEventResults(slug);
  const bestDateSet = new Set(bestDates.map((result) => result.date));
  const votedResults = results.filter((result) => result.count > 0);
  const calendarMonths = buildResultCalendarMonths(results);
  const followupTop = followupVoteDatesByDateAsc(results, bestDateSet);

  return (
    <MobileShell className="grid content-start gap-5">
      <AppTopBar title="결과" />
      <Card>
        <CardHeader>
          <p className="hb-kicker">약속 결과</p>
          <CardTitle className="text-xl sm:text-2xl">{event.title}</CardTitle>
          <CardDescription>지금까지 {participantCount}명이 날짜를 골랐어요.</CardDescription>
          {event.vote_deadline ? (
            <p className="text-xs font-bold text-stone-500">
              투표 마감(서울): {formatSeoulDateTimeLabel(event.vote_deadline)}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-5">
          {bestDates[0] ? (
            <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 p-5 text-white shadow-inner ring-1 ring-white/10">
              <Trophy className="mb-3 size-7 text-amber-300" />
              <p className="text-xs font-bold uppercase tracking-wide text-orange-200/90">가장 유력</p>
              <ul className="mt-2 grid gap-2">
                {bestDates.map((row) => (
                  <li key={row.date}>
                    <strong className="text-lg font-black leading-snug sm:text-xl">
                      {formatKoreanDate(row.date)}
                    </strong>
                    <span className="mt-1 block text-sm text-stone-300">{row.count}명 선택</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="hb-calendar-surface p-4 text-sm text-stone-600">아직 선택한 사람이 없습니다.</p>
          )}

          {followupTop.length > 0 ? (
            <section aria-label="다음 후보 날짜">
              <h2 className="text-base font-black tracking-[-0.03em] text-stone-950 sm:text-lg">
                그다음 후보 TOP 5
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                유력한 날 다음으로, 가까운 날짜 순으로 최대 5개를 모았어요.
              </p>
              <ol className="mt-3 grid gap-2">
                {followupTop.map((row, index) => (
                  <li
                    className="hb-calendar-surface flex items-center justify-between gap-3 px-4 py-3"
                    key={row.date}
                  >
                    <span className="text-sm font-black text-stone-400">{index + 1}</span>
                    <span className="flex-1 font-black text-stone-900">{formatKoreanDate(row.date)}</span>
                    <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-black text-orange-800">
                      {row.count}명
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <ResultsCalendarInteractive
            bestDateSet={[...bestDateSet]}
            months={calendarMonths}
            results={results}
          />

          {participants.length > 0 ? (
            <section className="grid gap-3" aria-label="참여자별 선택 수정">
              <div>
                <h2 className="text-base font-black tracking-[-0.03em] text-stone-950 sm:text-lg">
                  참여자 선택 수정
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  이름을 누르고 처음 입력한 PIN으로 본인 확인 후 날짜를 바꿀 수 있어요.
                </p>
              </div>
              <div className="grid gap-2">
                {participants.map((participant) => (
                  <Button
                    asChild
                    className="h-auto min-h-12 justify-start gap-3 px-4 py-2.5"
                    key={participant.id}
                    variant="outline"
                  >
                    <Link href={`/e/${event.slug}?participantId=${participant.id}`}>
                      <ParticipantAvatar
                        avatarUrl={participant.avatarUrl}
                        name={participant.name}
                        size={32}
                      />
                      <span className="text-left font-bold">{participant.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </section>
          ) : null}
          {votedResults.length > 0 ? (
            <section className="grid gap-3" aria-label="투표된 날짜 목록">
              <div>
                <h2 className="text-base font-black tracking-[-0.03em] text-stone-950 sm:text-lg">
                  선택이 모인 날 (전체)
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  한 명 이상이 고른 날을 모두 보여줍니다.
                </p>
              </div>
              {votedResults.map((result) => (
                <div
                  className={cn(
                    "hb-calendar-surface p-4",
                    bestDateSet.has(result.date) && "ring-2 ring-orange-400/80"
                  )}
                  key={result.date}
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-base font-black">{formatKoreanDate(result.date)}</strong>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">
                      {result.count}명
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.participants.map((participant) => (
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
              ))}
            </section>
          ) : null}
        </CardContent>
      </Card>
    </MobileShell>
  );
}
