import Link from "next/link";
import { CalendarDays, Share2, Sparkles } from "lucide-react";

import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <MobileShell className="flex flex-col justify-between gap-6">
      <section className="grid gap-5 pt-8">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-orange-700 shadow-sm">
          <Sparkles className="size-4" />
          함보자고
        </div>
        <div className="grid gap-4">
          <h1 className="text-[3.4rem] font-black leading-[0.95] tracking-[-0.06em] text-stone-950">
            10초만에 약속 날짜 잡기
          </h1>
          <p className="text-base leading-7 text-stone-600">
            링크 하나를 공유하면 참여자는 로그인 없이 되는 날만 누르면 됩니다.
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
          <Button asChild size="lg" className="w-full">
            <Link href="/events/new">약속 만들기</Link>
          </Button>
        </CardContent>
      </Card>
    </MobileShell>
  );
}
