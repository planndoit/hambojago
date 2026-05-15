import { redirect } from "next/navigation";

import { AppTopBar } from "@/components/app-top-bar";
import { CreatorProfileForm } from "@/components/creator-profile-form";
import { MobileShell } from "@/components/mobile-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentCreator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CreatorProfilePage() {
  const creator = await getCurrentCreator();

  if (!creator) {
    redirect("/login");
  }

  return (
    <MobileShell className="grid content-start gap-5">
      <AppTopBar title="회원정보" />
      <Card>
        <CardHeader>
          <p className="hb-kicker">생성자</p>
          <CardTitle>회원정보 수정</CardTitle>
          <CardDescription>아이디·이름·비밀번호·프로필 사진을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreatorProfileForm
            initialAvatarUrl={creator.avatar_url}
            initialDisplayName={creator.display_name ?? ""}
            username={creator.username}
          />
        </CardContent>
      </Card>
    </MobileShell>
  );
}
