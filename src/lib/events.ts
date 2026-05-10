import { notFound } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  CreatorEventSummary,
  EventParticipantSummary,
  EventResult,
  EventWithDates,
  ResultParticipantDisplay
} from "@/lib/types";

export async function getEventWithDates(slug: string): Promise<EventWithDates> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_dates(*)")
    .eq("slug", slug)
    .order("date", { referencedTable: "event_dates", ascending: true })
    .single();

  if (error || !data) {
    notFound();
  }

  return data;
}

export async function getEventResults(slug: string) {
  const event = await getEventWithDates(slug);
  const supabase = createSupabaseAdminClient();

  const { data: availability, error } = await supabase
    .from("availability")
    .select("date, participant_id")
    .eq("event_id", event.id);

  if (error) {
    throw new Error(error.message);
  }

  const participantIds = [...new Set(availability.map((row) => row.participant_id))];
  const { data: participantRows, error: participantsError } =
    participantIds.length > 0
      ? await supabase
          .from("participants")
          .select("id, name, participant_accounts(avatar_url)")
          .in("id", participantIds)
      : { data: [], error: null };

  if (participantsError) {
    throw new Error(participantsError.message);
  }

  type ParticipantJoinRow = {
    id: string;
    name: string;
    participant_accounts: { avatar_url: string | null } | null;
  };

  const participantDisplayMap = new Map<string, ResultParticipantDisplay>(
    (participantRows as ParticipantJoinRow[]).map((participant) => [
      participant.id,
      {
        id: participant.id,
        name: participant.name,
        avatarUrl: participant.participant_accounts?.avatar_url ?? null
      }
    ])
  );

  const results = event.event_dates.map<EventResult>((eventDate) => {
    const rows = availability.filter((row) => row.date === eventDate.date);
    const seen = new Set<string>();
    const participantsList: ResultParticipantDisplay[] = [];

    for (const row of rows) {
      if (seen.has(row.participant_id)) {
        continue;
      }

      seen.add(row.participant_id);
      const meta = participantDisplayMap.get(row.participant_id);

      if (meta) {
        participantsList.push(meta);
      }
    }

    return {
      date: eventDate.date,
      count: participantsList.length,
      participants: participantsList
    };
  });

  const participantCount = participantIds.length;

  const bestCount = Math.max(0, ...results.map((result) => result.count));

  return {
    event,
    results,
    participantCount,
    bestDates: results.filter((result) => result.count === bestCount && bestCount > 0),
    participants: (participantRows as ParticipantJoinRow[])
      .map<EventParticipantSummary>((participant) => ({
        id: participant.id,
        name: participant.name,
        avatarUrl: participant.participant_accounts?.avatar_url ?? null
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"))
  };
}

export async function getCreatorEventSummaries(
  creatorId: string
): Promise<CreatorEventSummary[]> {
  const supabase = createSupabaseAdminClient();
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (eventsError) {
    throw new Error(eventsError.message);
  }

  if (events.length === 0) {
    return [];
  }

  const eventIds = events.map((event) => event.id);
  const [{ data: participants, error: participantsError }, { data: availability, error: availabilityError }] =
    await Promise.all([
      supabase.from("participants").select("id, event_id").in("event_id", eventIds),
      supabase.from("availability").select("event_id, date, participant_id").in("event_id", eventIds)
    ]);

  if (participantsError) {
    throw new Error(participantsError.message);
  }

  if (availabilityError) {
    throw new Error(availabilityError.message);
  }

  return events.map((event) => {
    const participantCount = participants.filter(
      (participant) => participant.event_id === event.id
    ).length;
    const dateCounts = new Map<string, Set<string>>();

    availability
      .filter((row) => row.event_id === event.id)
      .forEach((row) => {
        const participantIds = dateCounts.get(row.date) ?? new Set<string>();
        participantIds.add(row.participant_id);
        dateCounts.set(row.date, participantIds);
      });

    const [bestDate, bestDateParticipants] =
      [...dateCounts.entries()].sort((a, b) => b[1].size - a[1].size)[0] ?? [];

    return {
      event,
      participantCount,
      bestDate: bestDate ?? null,
      bestDateCount: bestDateParticipants?.size ?? 0
    };
  });
}
