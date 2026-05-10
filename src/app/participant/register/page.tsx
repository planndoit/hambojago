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
    <MobileShell className="grid content-start gap-4">
      <AppTopBar title="참여자 회원가입" />
      <Card>
        <CardHeader>
          <p className="text-sm font-black text-orange-600">참여자 계정</p>
          <CardTitle>회원가입 후 약속 링크로 돌아가세요</CardTitle>
          <CardDescription>
            가입을 마치면 돌아온 페이지에서 날짜를 선택할 수 있습니다.
          </CardDescription>
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
