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
    <MobileShell className="grid content-start gap-4">
      <AppTopBar title="참여자 로그인" />
      <Card>
        <CardHeader>
          <p className="text-sm font-black text-orange-600">참여자 계정</p>
          <CardTitle>로그인 후 약속에 참여하세요</CardTitle>
          <CardDescription>
            로그인하면 프로필 사진이 결과 화면에 표시됩니다. 계속해서 이름과 PIN으로 참여하는 방식은 그대로입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm authApiPath="/api/participant-auth" redirectPath={redirectPath} />
        </CardContent>
      </Card>
    </MobileShell>
  );
}
