import Link from "next/link";
import { BarChart3, CalendarDays, Plus, Share2, Sparkles } from "lucide-react";

import { AppTopBar } from "@/components/app-top-bar";
import { EventVoteDeadlineForm } from "@/components/event-vote-deadline-form";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentCreator } from "@/lib/auth";
import { formatKoreanDate } from "@/lib/date";
import { getCreatorEventSummaries } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const creator = await getCurrentCreator();

  if (!creator) {
    return <LandingHome />;
  }

  const eventSummaries = await getCreatorEventSummaries(creator.id);

  return (
    <MobileShell className="grid content-start gap-5">
      <AppTopBar title="내 약속" />

      <Button asChild size="lg" className="w-full shadow-[0_12px_32px_-14px_rgb(234_88_12_/45%)]">
        <Link href="/events/new">
          <Plus className="size-5" />
          약속 만들기
        </Link>
      </Button>

      {eventSummaries.length > 0 ? (
        <section className="grid gap-4" aria-label="내가 만든 약속 목록">
          {eventSummaries.map(({ event, participantCount, bestDate, bestDateCount }) => (
            <Card key={event.id}>
              <CardHeader className="pb-2">
                <p className="hb-kicker">약속</p>
                <CardTitle className="text-xl sm:text-2xl">{event.title}</CardTitle>
                {event.description ? (
                  <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="grid gap-4 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="hb-calendar-surface flex flex-col gap-2 p-4">
                    <CalendarDays className="size-5 text-orange-500" />
                    <p className="text-[0.7rem] font-bold uppercase tracking-wide text-stone-500">
                      날짜 범위
                    </p>
                    <p className="text-sm font-black leading-snug text-stone-900">
                      {formatKoreanDate(event.start_date)}
                      <br />
                      {formatKoreanDate(event.end_date)}
                    </p>
                  </div>
                  <div className="hb-calendar-surface flex flex-col gap-2 p-4">
                    <BarChart3 className="size-5 text-stone-600" />
                    <p className="text-[0.7rem] font-bold uppercase tracking-wide text-stone-500">
                      참여
                    </p>
                    <p className="text-sm font-black text-stone-900">{participantCount}명</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 p-4 text-white shadow-inner ring-1 ring-white/10">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide text-orange-200/90">
                    유력 날짜
                  </p>
                  {bestDate ? (
                    <p className="mt-1.5 text-sm font-black leading-snug">
                      {formatKoreanDate(bestDate)} · {bestDateCount}명
                    </p>
                  ) : (
                    <p className="mt-1.5 text-sm font-semibold text-stone-400">아직 선택이 없어요</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="secondary">
                    <Link href={`/events/${event.slug}/share`}>
                      <Share2 className="size-4" />
                      공유
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/e/${event.slug}/results`}>결과</Link>
                  </Button>
                </div>

                <div className="rounded-2xl border border-orange-100/80 bg-white/60 p-4">
                  <p className="mb-2 text-xs font-black text-stone-800">투표 마감 변경</p>
                  <EventVoteDeadlineForm slug={event.slug} voteDeadlineIso={event.vote_deadline} />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <Card>
          <CardHeader>
            <div className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Sparkles className="size-6" />
            </div>
            <CardTitle>아직 만든 약속이 없어요</CardTitle>
            <CardDescription>첫 약속을 만들고 링크를 공유해보세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <Link href="/events/new">첫 약속 만들기</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </MobileShell>
  );
}

function LandingHome() {
  return (
    <MobileShell className="flex flex-col gap-8">
      <section className="grid gap-5 pt-4">
        <div className="grid gap-4">
          <p className="hb-kicker">Hambojago</p>
          <div className="grid gap-2">
            <h1 className="text-[2.5rem] font-black leading-[1.02] tracking-[-0.055em] text-stone-950 sm:text-[2.65rem]">
              함보자고
            </h1>
            <p className="text-lg font-black leading-snug tracking-[-0.03em] text-stone-800 sm:text-xl">
              약속 날짜를 가장 빠르게 맞추는 방법
            </p>
          </div>
          <p className="max-w-[19rem] text-[0.95rem] leading-relaxed text-stone-600">
            링크 하나만 공유하세요. 참여자는 로그인 없이 달력에서 되는 날만 골라요.
          </p>
        </div>
        <ul className="grid gap-2 text-sm font-semibold text-stone-600">
          <li className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-orange-400" />
            여러 날 중 겹치는 날이 한눈에 보입니다.
          </li>
          <li className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-orange-400" />
            모임·회식·스터디 어디에나 쓸 수 있어요.
          </li>
        </ul>
      </section>

      <Card className="overflow-hidden">
        <CardHeader>
          <p className="hb-kicker">이렇게 써요</p>
          <CardTitle className="text-xl sm:text-2xl">달력으로 조율하고 링크로 모으기</CardTitle>
          <CardDescription>가능한 날만 탭하고, 주최자는 결과에서 바로 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="hb-calendar-surface flex flex-col gap-3 p-4">
              <CalendarDays className="size-6 text-orange-500" />
              <p className="text-sm font-black text-stone-900">날짜 선택</p>
              <p className="text-xs leading-relaxed text-stone-600">후보일만 달력에 보여요</p>
            </div>
            <div className="hb-calendar-surface flex flex-col gap-3 p-4">
              <Share2 className="size-6 text-stone-700" />
              <p className="text-sm font-black text-stone-900">링크 공유</p>
              <p className="text-xs leading-relaxed text-stone-600">카톡으로 내면 끝</p>
            </div>
          </div>
          <div className="grid gap-2.5">
            <Button asChild size="lg" className="w-full">
              <Link href="/events/new">약속 만들기</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/login">생성자 로그인</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </MobileShell>
  );
}
