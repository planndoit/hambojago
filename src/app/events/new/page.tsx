import { redirect } from "next/navigation";
import { CalendarRange } from "lucide-react";

import { createEventAction } from "@/app/actions";
import { AppTopBar } from "@/components/app-top-bar";
import { FormStatusOverlay } from "@/components/form-status-overlay";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentCreator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const creator = await getCurrentCreator();

  if (!creator) {
    redirect("/login");
  }

  return (
    <MobileShell className="grid content-start gap-5">
      <AppTopBar title="약속 만들기" />
      <Card>
        <CardHeader>
          <div className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <CalendarRange className="size-5" />
          </div>
          <p className="hb-kicker">새 약속</p>
          <CardTitle>이름과 날짜 범위만 정하면 돼요</CardTitle>
          <CardDescription>
            참여자는 그 안에서 가능한 날만 고릅니다. 나중에 링크로 초대하면 됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createEventAction} className="relative grid gap-5">
            <FormStatusOverlay />
            <Label>
              <span>약속 이름</span>
              <Input name="title" placeholder="토요일 저녁 모임" required />
            </Label>
            <Label>
              <span>설명 · 안내 (선택)</span>
              <Textarea name="description" placeholder="장소나 메모를 적어도 좋아요" rows={4} />
            </Label>
            <div className="hb-calendar-surface grid gap-4 p-4">
              <p className="text-xs font-bold text-stone-500">참여자에게 보이는 날짜 범위</p>
              <div className="grid grid-cols-2 gap-3">
                <Label className="gap-1.5">
                  <span className="text-xs text-stone-600">시작</span>
                  <Input name="startDate" required type="date" />
                </Label>
                <Label className="gap-1.5">
                  <span className="text-xs text-stone-600">종료</span>
                  <Input name="endDate" required type="date" />
                </Label>
              </div>
            </div>
            <Label className="gap-1.5">
              <span className="text-xs text-stone-600">투표 마감 일시 (선택, 기기에 표시된 시각 = 서울 기준으로 저장)</span>
              <Input name="voteDeadline" type="datetime-local" />
            </Label>
            <p className="text-[0.7rem] leading-relaxed text-stone-500">
              비워 두면 기한 없이 계속 투표할 수 있어요. 마감은 지금 이후로만 설정됩니다.
            </p>
            <Button className="w-full" size="lg" type="submit">
              링크 만들기
            </Button>
          </form>
        </CardContent>
      </Card>
    </MobileShell>
  );
}
