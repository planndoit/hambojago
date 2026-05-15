import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, ChevronRight } from "lucide-react";

import { ParticipationForm } from "@/components/participation-form";
import { ParticipantVoteBanner } from "@/components/participant-vote-banner";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildEventShareMetadata } from "@/config/site-share";
import { isVotingClosed } from "@/lib/event-voting";
import { getEventWithDates, participantHasAvailabilityForEvent } from "@/lib/events";
import { getCurrentParticipantAccount } from "@/lib/participant-auth";
import { formatSeoulDateTimeLabel } from "@/lib/seoul-time";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventWithDates(slug);

  return buildEventShareMetadata(event.title, event.description);
}

export default async function EventPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ participantId?: string }>;
}) {
  const { slug } = await params;
  const { participantId } = await searchParams;
  const event = await getEventWithDates(slug);
  const participantAccount = await getCurrentParticipantAccount();

  if (!participantId && participantAccount) {
    const voted = await participantHasAvailabilityForEvent(event.id, participantAccount.id);

    if (voted) {
      redirect(`/e/${slug}/results`);
    }
  }

  const votingClosed = isVotingClosed(event.vote_deadline);

  return (
    <MobileShell className="grid content-start gap-3 pb-0 sm:gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 pt-0.5">
        <p className="hb-kicker text-[0.65rem]">함보자고</p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href={`/e/${event.slug}/results`}>
              <BarChart3 className="size-4" />
              결과 보기
            </Link>
          </Button>
          <Link
            className="inline-flex items-center gap-0.5 text-xs font-bold text-stone-500 transition hover:text-orange-700"
            href={`/e/${event.slug}/results`}
          >
            자세히
            <ChevronRight className="size-3.5 opacity-70" />
          </Link>
        </div>
      </div>

      {event.vote_deadline ? (
        <p className="text-center text-[0.7rem] font-bold text-stone-500">
          투표 마감(서울): {formatSeoulDateTimeLabel(event.vote_deadline)}
          {votingClosed ? " · 마감됨" : ""}
        </p>
      ) : null}

      <Card className="overflow-hidden shadow-[0_20px_48px_-28px_rgb(0_0_0_/30%)]">
        <CardHeader className="border-b border-orange-100/80 bg-gradient-to-b from-white to-orange-50/40 pb-4">
          <ParticipantVoteBanner account={participantAccount} slug={event.slug} />
          <p className="hb-kicker mt-5">참여</p>
          <CardTitle className="text-xl sm:text-2xl">{event.title}</CardTitle>
          {event.description ? <CardDescription>{event.description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="bg-orange-50/25 pb-0 pt-4">
          <ParticipationForm
            dates={event.event_dates}
            key={event.slug}
            participantAccount={participantAccount}
            selectedParticipantId={participantId}
            slug={event.slug}
            voteDeadline={event.vote_deadline}
          />
        </CardContent>
      </Card>
    </MobileShell>
  );
}
