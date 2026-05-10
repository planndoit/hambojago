import { AuthForm } from "@/components/auth-form";
import { MobileShell } from "@/components/mobile-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <MobileShell className="grid content-center">
      <Card>
        <CardHeader>
          <p className="text-sm font-black text-orange-600">생성자 로그인</p>
          <CardTitle>아이디와 비밀번호로 시작하세요</CardTitle>
          <CardDescription>
            참여자는 로그인 없이 링크에서 바로 날짜를 선택할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </MobileShell>
  );
}
