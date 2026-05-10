import Link from "next/link";

import { ParticipantAvatar } from "@/components/participant-avatar";
import { Button } from "@/components/ui/button";

type ParticipantVoteBannerProps = {
  slug: string;
  account: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function ParticipantVoteBanner({ slug, account }: ParticipantVoteBannerProps) {
  const nextPath = `/e/${slug}`;
  const loginHref = `/participant/login?next=${encodeURIComponent(nextPath)}`;

  if (!account) {
    return (
      <div className="flex flex-col gap-3 rounded-3xl border border-orange-100 bg-orange-50/80 p-4">
        <p className="text-sm font-bold leading-6 text-stone-800">
          참여자 계정으로 로그인하면 프로필 사진이 결과 화면에 함께 표시됩니다.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={loginHref}>참여자 로그인</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/participant/register?next=${encodeURIComponent(nextPath)}`}>회원가입</Link>
          </Button>
        </div>
      </div>
    );
  }

  const label = account.display_name?.trim() ? account.display_name.trim() : account.username;

  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl border border-orange-100 bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <ParticipantAvatar avatarUrl={account.avatar_url} name={label} size={44} />
        <div className="min-w-0">
          <p className="text-xs font-bold text-orange-600">참여자 로그인됨</p>
          <p className="truncate text-sm font-black text-stone-950">{label}</p>
        </div>
      </div>
      <Button asChild size="sm" variant="secondary">
        <Link href="/participant/settings">프로필</Link>
      </Button>
    </div>
  );
}
