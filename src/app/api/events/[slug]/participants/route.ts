import { NextResponse } from "next/server";

import { createEditToken, hashSecret, isValidPin } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ParticipantRequest = {
  name?: unknown;
  pin?: unknown;
  dates?: unknown;
  editToken?: unknown;
};

function parseRequestBody(body: ParticipantRequest) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";
  const dates = Array.isArray(body.dates)
    ? body.dates.filter((date): date is string => typeof date === "string")
    : [];
  const editToken = typeof body.editToken === "string" ? body.editToken : "";

  return { name, pin, dates, editToken };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const body = (await request.json()) as ParticipantRequest;
  const { name, pin, dates, editToken } = parseRequestBody(body);

  if (!name || !isValidPin(pin) || dates.length === 0) {
    return NextResponse.json(
      { message: "이름, 4자리 PIN, 선택 날짜가 필요합니다." },
      { status: 400 }
    );
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

  const { data: candidateDates, error: datesError } = await supabase
    .from("event_dates")
    .select("date")
    .eq("event_id", event.id);

  if (datesError) {
    return NextResponse.json({ message: datesError.message }, { status: 500 });
  }

  const candidateDateSet = new Set(candidateDates.map((candidateDate) => candidateDate.date));
  const selectedDates = [...new Set(dates)].filter((date) => candidateDateSet.has(date));

  if (selectedDates.length === 0) {
    return NextResponse.json(
      { message: "약속 후보 날짜 중 하나 이상을 선택해야 합니다." },
      { status: 400 }
    );
  }

  const pinHash = hashSecret(pin);
  const editTokenHash = editToken ? hashSecret(editToken) : "";
  const participantQuery = supabase
    .from("participants")
    .select("id")
    .eq("event_id", event.id)
    .limit(1);

  const { data: existingParticipants, error: participantLookupError } = editTokenHash
    ? await participantQuery.eq("edit_token_hash", editTokenHash)
    : await participantQuery.eq("name", name).eq("pin_hash", pinHash);

  if (participantLookupError) {
    return NextResponse.json({ message: participantLookupError.message }, { status: 500 });
  }

  const existingParticipant = existingParticipants.at(0);
  const nextEditToken = existingParticipant && editToken ? editToken : createEditToken();
  const nextEditTokenHash = hashSecret(nextEditToken);

  const participantId = existingParticipant?.id;

  if (participantId) {
    const { error: updateError } = await supabase
      .from("participants")
      .update({
        name,
        pin_hash: pinHash,
        edit_token_hash: nextEditTokenHash,
        updated_at: new Date().toISOString()
      })
      .eq("id", participantId);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }
  }

  const { data: participant, error: participantError } = participantId
    ? await supabase.from("participants").select("id").eq("id", participantId).single()
    : await supabase
        .from("participants")
        .insert({
          event_id: event.id,
          name,
          pin_hash: pinHash,
          edit_token_hash: nextEditTokenHash
        })
        .select("id")
        .single();

  if (participantError || !participant) {
    return NextResponse.json(
      { message: participantError?.message ?? "참여자를 저장하지 못했습니다." },
      { status: 500 }
    );
  }

  const { error: deleteError } = await supabase
    .from("availability")
    .delete()
    .eq("participant_id", participant.id);

  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 500 });
  }

  const { error: availabilityError } = await supabase.from("availability").insert(
    selectedDates.map((date) => ({
      event_id: event.id,
      participant_id: participant.id,
      date
    }))
  );

  if (availabilityError) {
    return NextResponse.json({ message: availabilityError.message }, { status: 500 });
  }

  return NextResponse.json({ editToken: nextEditToken });
}
