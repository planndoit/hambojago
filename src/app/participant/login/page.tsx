import { AppTopBar } from "@/components/app-top-bar";
import { AuthForm } from "@/components/auth-form";
import { MobileShell } from "@/components/mobile-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ParticipantLoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectPath =
    typeof next === "string" && next.startsWith("/") ? next : "/participant/settings";

  return (
    <MobileShell className="grid content-start gap-5">
      <AppTopBar title="참여자 로그인" />
      <Card>
        <CardHeader>
          <p className="hb-kicker">참여자</p>
          <CardTitle>로그인하고 프로필을 연결해요</CardTitle>
          <CardDescription>
            이름과 PIN으로 참여하는 방식은 그대로예요. 로그인하면 결과 화면에 아바타가 보입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm authApiPath="/api/participant-auth" redirectPath={redirectPath} />
        </CardContent>
      </Card>
    </MobileShell>
  );
}
