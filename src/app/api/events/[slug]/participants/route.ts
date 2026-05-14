import { NextResponse } from "next/server";

import { isVotingClosed } from "@/lib/event-voting";
import { createEditToken, hashSecret, isValidPin } from "@/lib/security";
import { getCurrentParticipantAccount } from "@/lib/participant-auth";
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

type ParticipantLookupRow = {
  id: string;
  pin_hash: string;
  participant_account_id: string | null;
};

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

  const linkedAccount = await getCurrentParticipantAccount();
  const linkedAccountId = linkedAccount?.id ?? null;

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

  let existingParticipant: ParticipantLookupRow | null = null;

  if (editTokenHash) {
    const { data: rows, error } = await supabase
      .from("participants")
      .select("id, pin_hash, participant_account_id")
      .eq("event_id", event.id)
      .eq("edit_token_hash", editTokenHash)
      .limit(1);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    existingParticipant = rows?.at(0) ?? null;
  }

  if (!existingParticipant && linkedAccountId) {
    const { data: row, error } = await supabase
      .from("participants")
      .select("id, pin_hash, participant_account_id")
      .eq("event_id", event.id)
      .eq("participant_account_id", linkedAccountId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    existingParticipant = row ?? null;
  }

  if (!existingParticipant) {
    const { data: rows, error } = await supabase
      .from("participants")
      .select("id, pin_hash, participant_account_id")
      .eq("event_id", event.id)
      .eq("name", name)
      .eq("pin_hash", pinHash)
      .limit(1);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    existingParticipant = rows?.at(0) ?? null;
  }

  if (existingParticipant && existingParticipant.pin_hash !== pinHash) {
    return NextResponse.json(
      { message: "처음 입력한 4자리 PIN이 일치해야 수정할 수 있습니다." },
      { status: 403 }
    );
  }

  const nextEditToken = existingParticipant && editToken ? editToken : createEditToken();
  const nextEditTokenHash = hashSecret(nextEditToken);

  const participantId = existingParticipant?.id;

  const updatePayload = {
    name,
    edit_token_hash: nextEditTokenHash,
    updated_at: new Date().toISOString(),
    ...(linkedAccountId && !existingParticipant?.participant_account_id
      ? { participant_account_id: linkedAccountId }
      : {})
  };

  if (participantId) {
    const { error: updateError } = await supabase
      .from("participants")
      .update(updatePayload)
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
          edit_token_hash: nextEditTokenHash,
          participant_account_id: linkedAccountId ?? null
        })
        .select("id")
        .single();

  if (participantError || !participant) {
    return NextResponse.json(
      {
        message:
          participantError?.code === "23505"
            ? "이 참여자 계정으로는 이미 이 약속에 참여했습니다."
            : participantError?.message ?? "참여자를 저장하지 못했습니다."
      },
      { status: participantError?.code === "23505" ? 409 : 500 }
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
