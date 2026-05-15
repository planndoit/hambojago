import { redirect } from "next/navigation";

import { AppTopBar } from "@/components/app-top-bar";
import { ParticipantProfileForm } from "@/components/participant-profile-form";
import { MobileShell } from "@/components/mobile-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentParticipantAccount } from "@/lib/participant-auth";

export const dynamic = "force-dynamic";

export default async function ParticipantSettingsPage() {
  const account = await getCurrentParticipantAccount();

  if (!account) {
    redirect("/participant/login");
  }

  return (
    <MobileShell className="grid content-start gap-5">
      <AppTopBar title="회원정보" />
      <Card>
        <CardHeader>
          <p className="hb-kicker">참여자</p>
          <CardTitle>회원정보 수정</CardTitle>
          <CardDescription>아이디·이름·비밀번호·프로필 사진을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ParticipantProfileForm
            initialAvatarUrl={account.avatar_url}
            initialDisplayName={account.display_name ?? ""}
            username={account.username}
          />
        </CardContent>
      </Card>
    </MobileShell>
  );
}
