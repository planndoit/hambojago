import { NextResponse } from "next/server";

import { hashSecret } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json({ participant: null, dates: [] });
  }

  const supabase = createSupabaseAdminClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ message: "약속을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("id, name")
    .eq("event_id", event.id)
    .eq("edit_token_hash", hashSecret(token))
    .single();

  if (participantError || !participant) {
    return NextResponse.json({ participant: null, dates: [] });
  }

  const { data: availability, error: availabilityError } = await supabase
    .from("availability")
    .select("date")
    .eq("participant_id", participant.id);

  if (availabilityError) {
    return NextResponse.json({ message: availabilityError.message }, { status: 500 });
  }

  return NextResponse.json({
    participant,
    dates: availability.map((row) => row.date)
  });
}
