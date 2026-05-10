import Link from "next/link";
import { BarChart3, CalendarDays, LogOut, Plus, Share2 } from "lucide-react";

import { signOutAction } from "@/app/actions";
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
    <MobileShell className="grid content-start gap-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-orange-600">함보자고</p>
          <h1 className="text-3xl font-black tracking-[-0.05em] text-stone-950">내 약속</h1>
        </div>
        <form action={signOutAction}>
          <Button size="icon" type="submit" variant="ghost" aria-label="로그아웃">
            <LogOut className="size-5" />
          </Button>
        </form>
      </header>

      <Button asChild size="lg" className="w-full">
        <Link href="/events/new">
          <Plus className="size-5" />
          약속 만들기
        </Link>
      </Button>

      {eventSummaries.length > 0 ? (
        <section className="grid gap-3" aria-label="내가 만든 약속 목록">
          {eventSummaries.map(({ event, participantCount, bestDate, bestDateCount }) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                {event.description ? (
                  <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-3xl bg-orange-50 p-4">
                    <CalendarDays className="mb-2 size-5 text-orange-500" />
                    <p className="text-xs font-bold text-stone-500">날짜 범위</p>
                    <p className="mt-1 text-sm font-black leading-5 text-stone-950">
                      {formatKoreanDate(event.start_date)}
                      <br />
                      {formatKoreanDate(event.end_date)}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-stone-50 p-4">
                    <BarChart3 className="mb-2 size-5 text-stone-700" />
                    <p className="text-xs font-bold text-stone-500">참여</p>
                    <p className="mt-1 text-sm font-black text-stone-950">{participantCount}명</p>
                  </div>
                </div>

                <div className="rounded-3xl bg-stone-950 p-4 text-white">
                  <p className="text-xs font-bold text-stone-300">유력 날짜</p>
                  {bestDate ? (
                    <p className="mt-1 text-sm font-black">
                      {formatKoreanDate(bestDate)} · {bestDateCount}명
                    </p>
                  ) : (
                    <p className="mt-1 text-sm font-bold text-stone-400">아직 선택이 없어요</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="secondary">
                    <Link href={`/events/${event.slug}/share`}>
                      <Share2 className="size-4" />
                      공유하기
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/e/${event.slug}/results`}>결과 보기</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">아직 만든 약속이 없어요</CardTitle>
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
    <MobileShell className="flex flex-col justify-between gap-6">
      <section className="grid gap-6 pt-10">
        <div className="grid gap-3">
          <p className="text-sm font-black tracking-[0.28em] text-orange-600">HAMBOJAGO</p>
          <div className="grid gap-2">
            <h1 className="text-[2.65rem] font-black leading-[1.02] tracking-[-0.055em] text-stone-950">
              함보자고
            </h1>
            <p className="text-xl font-black leading-snug tracking-[-0.035em] text-stone-800">
              약속 날짜를 가장 빠르게 맞추는 방법
            </p>
          </div>
          <p className="max-w-[18rem] text-[0.95rem] leading-6 text-stone-600">
            링크 하나를 공유하면 참여자는 로그인 없이 가능한 날짜만 고르면 됩니다.
          </p>
        </div>
      </section>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl">모바일에서 바로 쓰는 약속 조율</CardTitle>
          <CardDescription>달력에서 날짜를 누르고 결과를 바로 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-orange-50 p-4">
              <CalendarDays className="mb-3 size-6 text-orange-500" />
              <p className="text-sm font-bold">달력 선택</p>
            </div>
            <div className="rounded-3xl bg-stone-50 p-4">
              <Share2 className="mb-3 size-6 text-stone-700" />
              <p className="text-sm font-bold">링크 공유</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Button asChild size="lg" className="w-full">
              <Link href="/events/new">약속 만들기</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">로그인</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </MobileShell>
  );
}
