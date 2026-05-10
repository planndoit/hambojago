import { redirect } from "next/navigation";

import { createEventAction } from "@/app/actions";
import { AppTopBar } from "@/components/app-top-bar";
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
    <MobileShell className="grid content-start gap-4">
      <AppTopBar title="약속 만들기" />
      <Card>
        <CardHeader>
          <p className="text-sm font-black text-orange-600">약속 생성</p>
          <CardTitle>날짜 범위만 정하면 링크가 만들어집니다</CardTitle>
          <CardDescription>참여자는 범위 안의 날짜 중 가능한 날만 선택합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createEventAction} className="grid gap-4">
          <Label>
            <span>약속 이름</span>
            <Input name="title" placeholder="토요일 저녁 모임" required />
          </Label>
          <Label>
            <span>설명</span>
            <Textarea
              name="description"
              placeholder="간단한 안내를 적어주세요"
              rows={3}
            />
          </Label>
          <div className="grid grid-cols-2 gap-3">
          <Label>
            <span>시작 날짜</span>
            <Input name="startDate" required type="date" />
          </Label>
          <Label>
            <span>종료 날짜</span>
            <Input name="endDate" required type="date" />
          </Label>
          </div>
          <Button className="w-full" size="lg" type="submit">
            링크 만들기
          </Button>
        </form>
        </CardContent>
      </Card>
    </MobileShell>
  );
}
