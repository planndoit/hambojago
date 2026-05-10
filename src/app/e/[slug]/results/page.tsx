import Link from "next/link";
import { Trophy } from "lucide-react";

import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKoreanDate } from "@/lib/date";
import { getEventResults } from "@/lib/events";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event, results, participantCount, bestDates } = await getEventResults(slug);
  const bestDateSet = new Set(bestDates.map((result) => result.date));

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
            <strong className="text-xl leading-tight">{formatKoreanDate(bestDates[0].date)}이 가장 유력해요</strong>
            <p className="mt-2 text-sm text-stone-300">{bestDates[0].count}명이 선택했습니다.</p>
          </div>
        ) : (
          <p className="rounded-3xl bg-stone-50 p-4 text-sm text-stone-500">아직 선택한 사람이 없습니다.</p>
        )}
        <div className="grid gap-3">
          {results.map((result) => (
            <div
              className={cn(
                "rounded-3xl border bg-white p-4",
                bestDateSet.has(result.date) ? "border-orange-400 ring-4 ring-orange-100" : "border-orange-100"
              )}
              key={result.date}
            >
              <div className="flex items-start justify-between gap-3">
                <strong className="text-base">{formatKoreanDate(result.date)}</strong>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                  {result.count}명
                </span>
              </div>
              <p className="mt-2 text-sm text-stone-500">
                {result.participants.length > 0 ? result.participants.join(", ") : "아직 없음"}
              </p>
            </div>
          ))}
        </div>
        <Button asChild size="lg" className="w-full">
          <Link href={`/e/${event.slug}`}>내 선택 수정하기</Link>
        </Button>
        </CardContent>
      </Card>
    </MobileShell>
  );
}
