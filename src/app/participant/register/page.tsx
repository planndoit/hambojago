import { AppTopBar } from "@/components/app-top-bar";
import { ParticipantSignupForm } from "@/components/participant-signup-form";
import { MobileShell } from "@/components/mobile-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ParticipantRegisterPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectPath =
    typeof next === "string" && next.startsWith("/") ? next : "/participant/settings";

  return (
    <MobileShell className="grid content-start gap-5">
      <AppTopBar title="참여자 회원가입" />
      <Card>
        <CardHeader>
          <p className="hb-kicker">참여자</p>
          <CardTitle>계정을 만들고 약속으로 돌아가요</CardTitle>
          <CardDescription>
            가입을 마치면 돌아온 페이지에서 날짜를 선택할 수 있어요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParticipantSignupForm redirectPath={redirectPath} />
        </CardContent>
      </Card>
    </MobileShell>
  );
}
