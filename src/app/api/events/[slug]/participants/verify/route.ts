import { NextResponse } from "next/server";

import { isVotingClosed } from "@/lib/event-voting";
import { createEditToken, hashSecret, isValidPin } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type VerifyRequest = {
  participantId?: unknown;
  pin?: unknown;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const body = (await request.json()) as VerifyRequest;
  const participantId = typeof body.participantId === "string" ? body.participantId : "";
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";

  if (!participantId || !isValidPin(pin)) {
    return NextResponse.json(
      { message: "참여자와 처음 입력한 4자리 PIN이 필요합니다." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, vote_deadline")
    .eq("slug", slug)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ message: "약속을 찾을 수 없습니다." }, { status: 404 });
  }

  if (isVotingClosed(event.vote_deadline)) {
    return NextResponse.json({ message: "투표 마감 시간이 지났습니다." }, { status: 403 });
  }

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("id, name, pin_hash")
    .eq("id", participantId)
    .eq("event_id", event.id)
    .single();

  if (participantError || !participant) {
    return NextResponse.json({ message: "참여자를 찾을 수 없습니다." }, { status: 404 });
  }

  if (participant.pin_hash !== hashSecret(pin)) {
    return NextResponse.json(
      { message: "처음 입력한 4자리 PIN이 일치하지 않습니다." },
      { status: 403 }
    );
  }

  const editToken = createEditToken();
  const { error: updateError } = await supabase
    .from("participants")
    .update({
      edit_token_hash: hashSecret(editToken),
      updated_at: new Date().toISOString()
    })
    .eq("id", participant.id);

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 500 });
  }

  const { data: availability, error: availabilityError } = await supabase
    .from("availability")
    .select("date")
    .eq("participant_id", participant.id);

  if (availabilityError) {
    return NextResponse.json({ message: availabilityError.message }, { status: 500 });
  }

  return NextResponse.json({
    editToken,
    participant: {
      id: participant.id,
      name: participant.name
    },
    dates: availability.map((row) => row.date)
  });
}
