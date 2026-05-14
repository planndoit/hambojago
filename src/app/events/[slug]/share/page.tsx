import Link from "next/link";
import { headers } from "next/headers";
import { ExternalLink, MessageCircle } from "lucide-react";

import { AppTopBar } from "@/components/app-top-bar";
import { CopyInviteLinkButton } from "@/components/copy-invite-link-button";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getEventWithDates } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function SharePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventWithDates(slug);
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const sharePath = `/e/${event.slug}`;
  const shareUrl = host ? `${protocol}://${host}${sharePath}` : sharePath;

  return (
    <MobileShell className="grid content-start gap-5">
      <AppTopBar title="공유" />
      <Card>
        <CardHeader>
          <div className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <MessageCircle className="size-6" />
          </div>
          <p className="hb-kicker">초대 링크</p>
          <CardTitle className="text-xl sm:text-2xl">{event.title}</CardTitle>
          <CardDescription>아래 주소를 복사해 카카오톡 등으로 보내 주세요.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input readOnly className="text-sm font-medium text-stone-700" value={shareUrl} />
          <CopyInviteLinkButton url={shareUrl} />
          <Button asChild size="lg" className="w-full">
            <Link href={sharePath}>
              <ExternalLink className="size-4" />
              참여 화면 열기
            </Link>
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link href={`/e/${event.slug}/results`}>결과 화면</Link>
          </Button>
        </CardContent>
      </Card>
    </MobileShell>
  );
}
