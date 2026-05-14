import { AppTopBar } from "@/components/app-top-bar";
import { AuthForm } from "@/components/auth-form";
import { MobileShell } from "@/components/mobile-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <MobileShell className="grid content-start gap-5">
      <AppTopBar title="계정" />
      <Card>
        <CardHeader>
          <p className="hb-kicker">생성자</p>
          <CardTitle>로그인하고 약속을 만들어요</CardTitle>
          <CardDescription>
            참여자는 계정 없이 링크만으로 날짜를 선택할 수 있어요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </MobileShell>
  );
}
