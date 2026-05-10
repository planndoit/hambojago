import { ParticipationForm } from "@/components/participation-form";
import { ParticipantVoteBanner } from "@/components/participant-vote-banner";
import { MobileShell } from "@/components/mobile-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventWithDates } from "@/lib/events";
import { getCurrentParticipantAccount } from "@/lib/participant-auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventWithDates(slug);

  return {
    title: `${event.title} - 함보자고`,
    description: event.description ?? "되는 날만 눌러주세요. 가장 많이 겹치는 날짜를 바로 보여드려요."
  };
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

  return (
    <MobileShell className="grid content-start gap-4 pb-0">
      <Card className="overflow-hidden">
        <CardHeader>
          <ParticipantVoteBanner account={participantAccount} slug={event.slug} />
          <p className="mt-4 text-sm font-black text-orange-600">가능한 날짜를 골라주세요</p>
          <CardTitle>{event.title}</CardTitle>
          {event.description ? <CardDescription>{event.description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="pb-0">
          <ParticipationForm
            dates={event.event_dates}
            key={event.slug}
            participantAccount={participantAccount}
            selectedParticipantId={participantId}
            slug={event.slug}
          />
        </CardContent>
      </Card>
    </MobileShell>
  );
}
