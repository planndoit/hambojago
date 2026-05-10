import { ParticipationForm } from "@/components/participation-form";
import { getEventWithDates } from "@/lib/events";

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
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventWithDates(slug);

  return (
    <main className="page">
      <section className="card stack">
        <div>
          <p className="eyebrow">가능한 날짜를 골라주세요</p>
          <h1 className="title">{event.title}</h1>
          {event.description ? <p className="description">{event.description}</p> : null}
        </div>
        <ParticipationForm dates={event.event_dates} slug={event.slug} />
      </section>
    </main>
  );
}
