import { AppTopBar } from "@/components/app-top-bar";
import { AuthForm } from "@/components/auth-form";
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
      <AppTopBar title="참여자 가입" />
      <Card>
        <CardHeader>
          <p className="hb-kicker">참여자</p>
          <CardTitle>가입 후 약속 링크로 돌아가요</CardTitle>
          <CardDescription>가입을 마치면 아까 보던 참여 화면에서 날짜를 고를 수 있어요.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            authApiPath="/api/participant-auth"
            initialMode="signup"
            redirectPath={redirectPath}
          />
        </CardContent>
      </Card>
    </MobileShell>
  );
}
