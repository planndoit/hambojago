"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

import { deleteCurrentCreatorSession, getCurrentCreator } from "@/lib/auth";
import { getDateRange } from "@/lib/date";
import {
  deleteCurrentParticipantSession,
  getCurrentParticipantAccount
} from "@/lib/participant-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

  const creator = await getCurrentCreator();

  if (!creator) {
    redirect("/login");
  }

  const adminClient = createSupabaseAdminClient();
  const slug = createSlug();

  const { data: event, error: eventError } = await adminClient
    .from("events")
    .insert({
      creator_id: creator.id,
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
  await deleteCurrentCreatorSession();
  redirect("/");
}

export async function updateCreatorProfileAction(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const creator = await getCurrentCreator();

  if (!creator) {
    redirect("/login");
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("creator_accounts")
    .update({
      display_name: displayName.length > 0 ? displayName : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", creator.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/settings/profile");
}

export async function clearCreatorAvatarAction() {
  const creator = await getCurrentCreator();

  if (!creator) {
    redirect("/login");
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("creator_accounts")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", creator.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/settings/profile");
}

export async function participantSignOutAction() {
  await deleteCurrentParticipantSession();
  redirect("/");
}

export async function updateParticipantProfileAction(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const account = await getCurrentParticipantAccount();

  if (!account) {
    redirect("/participant/login");
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("participant_accounts")
    .update({
      display_name: displayName.length > 0 ? displayName : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", account.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/participant/settings");
}

export async function clearParticipantAvatarAction() {
  const account = await getCurrentParticipantAccount();

  if (!account) {
    redirect("/participant/login");
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("participant_accounts")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", account.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/participant/settings");
}
