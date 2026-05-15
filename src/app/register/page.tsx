import { AppTopBar } from "@/components/app-top-bar";
import { CreatorSignupForm } from "@/components/creator-signup-form";
import { MobileShell } from "@/components/mobile-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <MobileShell className="grid content-start gap-5">
      <AppTopBar title="회원가입" />
      <Card>
        <CardHeader>
          <p className="hb-kicker">생성자</p>
          <CardTitle>계정을 만들고 약속을 만들어요</CardTitle>
          <CardDescription>
            참여자는 계정 없이 링크만으로 날짜를 선택할 수 있어요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreatorSignupForm />
        </CardContent>
      </Card>
    </MobileShell>
  );
}
