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
      <AppTopBar title="참여자 프로필" />
      <Card>
        <CardHeader>
          <p className="hb-kicker">프로필</p>
          <CardTitle>이름과 사진</CardTitle>
          <CardDescription>
            약속 참여 시 기본 이름으로 쓰이고, 결과 화면 아바타로도 표시됩니다.
          </CardDescription>
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
