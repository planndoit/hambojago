"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

import { getDateRange } from "@/lib/date";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createSlug() {
  return randomUUID().slice(0, 8);
}

export async function createEventAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const candidateDates = getDateRange(startDate, endDate);

  if (!title || candidateDates.length === 0) {
    throw new Error("약속 이름과 올바른 날짜 범위가 필요합니다.");
  }

  const authClient = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await authClient.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const adminClient = createSupabaseAdminClient();
  const slug = createSlug();

  const { data: event, error: eventError } = await adminClient
    .from("events")
    .insert({
      creator_id: user.id,
      slug,
      title,
      description: description || null,
      start_date: startDate,
      end_date: endDate
    })
    .select()
    .single();

  if (eventError || !event) {
    throw new Error(eventError?.message ?? "약속을 만들지 못했습니다.");
  }

  const { error: datesError } = await adminClient.from("event_dates").insert(
    candidateDates.map((date) => ({
      event_id: event.id,
      date
    }))
  );

  if (datesError) {
    throw new Error(datesError.message);
  }

  redirect(`/events/${event.slug}/share`);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
