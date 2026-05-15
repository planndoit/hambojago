"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteCurrentCreatorSession,
  getCurrentCreator,
  isValidDisplayName,
  isValidPassword
} from "@/lib/auth";
import { getDateRange } from "@/lib/date";
import {
  deleteCurrentParticipantSession,
  getCurrentParticipantAccount
} from "@/lib/participant-auth";
import { parseSeoulLocalDateTime } from "@/lib/seoul-time";
import { hashPassword, verifyPassword } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ProfileFormState = { error?: string; ok?: boolean };

function createSlug() {
  return randomUUID().slice(0, 8);
}

export async function createEventAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const voteDeadlineRaw = String(formData.get("voteDeadline") ?? "").trim();
  const candidateDates = getDateRange(startDate, endDate);

  if (!title || candidateDates.length === 0) {
    throw new Error("약속 이름과 올바른 날짜 범위가 필요합니다.");
  }

  let voteDeadlineIso: string | null = null;

  if (voteDeadlineRaw) {
    const parsed = parseSeoulLocalDateTime(voteDeadlineRaw);

    if (!parsed) {
      throw new Error("투표 마감 일시 형식이 올바르지 않습니다.");
    }

    if (parsed.getTime() <= Date.now()) {
      throw new Error("투표 마감은 지금 이후로만 설정할 수 있습니다.");
    }

    voteDeadlineIso = parsed.toISOString();
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
      end_date: endDate,
      vote_deadline: voteDeadlineIso
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

export async function updateEventVoteDeadlineAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const voteDeadlineRaw = String(formData.get("voteDeadline") ?? "").trim();

  if (!slug) {
    throw new Error("약속 정보가 없습니다.");
  }

  const creator = await getCurrentCreator();

  if (!creator) {
    redirect("/login");
  }

  const adminClient = createSupabaseAdminClient();
  const { data: event, error: eventError } = await adminClient
    .from("events")
    .select("id")
    .eq("slug", slug)
    .eq("creator_id", creator.id)
    .single();

  if (eventError || !event) {
    throw new Error("약속을 찾을 수 없습니다.");
  }

  let voteDeadlineIso: string | null = null;

  if (voteDeadlineRaw) {
    const parsed = parseSeoulLocalDateTime(voteDeadlineRaw);

    if (!parsed) {
      throw new Error("투표 마감 일시 형식이 올바르지 않습니다.");
    }

    if (parsed.getTime() <= Date.now()) {
      throw new Error("투표 마감은 지금 이후로만 설정할 수 있습니다.");
    }

    voteDeadlineIso = parsed.toISOString();
  }

  const { error: updateError } = await adminClient
    .from("events")
    .update({
      vote_deadline: voteDeadlineIso,
      updated_at: new Date().toISOString()
    })
    .eq("id", event.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  redirect("/");
}

export async function signOutAction() {
  await deleteCurrentCreatorSession();
  redirect("/");
}

export async function updateCreatorProfileState(
  _prev: ProfileFormState | null,
  formData: FormData
): Promise<ProfileFormState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const creator = await getCurrentCreator();

  if (!creator) {
    redirect("/login");
  }

  if (!isValidDisplayName(displayName)) {
    return { error: "이름은 1자 이상 60자 이하로 입력해 주세요." };
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("creator_accounts")
    .update({
      display_name: displayName,
      updated_at: new Date().toISOString()
    })
    .eq("id", creator.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings/profile");
  return { ok: true };
}

export async function changeCreatorPasswordState(
  _prev: ProfileFormState | null,
  formData: FormData
): Promise<ProfileFormState> {
  const creator = await getCurrentCreator();

  if (!creator) {
    redirect("/login");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const newPasswordConfirm = String(formData.get("newPasswordConfirm") ?? "");

  if (!currentPassword) {
    return { error: "현재 비밀번호를 입력해 주세요." };
  }

  if (!isValidPassword(newPassword)) {
    return { error: "새 비밀번호는 8자 이상이어야 합니다." };
  }

  if (newPassword !== newPasswordConfirm) {
    return { error: "새 비밀번호 확인이 일치하지 않습니다." };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: row, error: fetchError } = await adminClient
    .from("creator_accounts")
    .select("password_hash")
    .eq("id", creator.id)
    .single();

  if (fetchError || !row || !verifyPassword(currentPassword, row.password_hash)) {
    return { error: "현재 비밀번호가 일치하지 않습니다." };
  }

  const { error: updateError } = await adminClient
    .from("creator_accounts")
    .update({
      password_hash: hashPassword(newPassword),
      updated_at: new Date().toISOString()
    })
    .eq("id", creator.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/settings/profile");
  return { ok: true };
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

export async function updateParticipantProfileState(
  _prev: ProfileFormState | null,
  formData: FormData
): Promise<ProfileFormState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const account = await getCurrentParticipantAccount();

  if (!account) {
    redirect("/participant/login");
  }

  if (!isValidDisplayName(displayName)) {
    return { error: "이름은 1자 이상 60자 이하로 입력해 주세요." };
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("participant_accounts")
    .update({
      display_name: displayName,
      updated_at: new Date().toISOString()
    })
    .eq("id", account.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/participant/settings");
  return { ok: true };
}

export async function changeParticipantPasswordState(
  _prev: ProfileFormState | null,
  formData: FormData
): Promise<ProfileFormState> {
  const account = await getCurrentParticipantAccount();

  if (!account) {
    redirect("/participant/login");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const newPasswordConfirm = String(formData.get("newPasswordConfirm") ?? "");

  if (!currentPassword) {
    return { error: "현재 비밀번호를 입력해 주세요." };
  }

  if (!isValidPassword(newPassword)) {
    return { error: "새 비밀번호는 8자 이상이어야 합니다." };
  }

  if (newPassword !== newPasswordConfirm) {
    return { error: "새 비밀번호 확인이 일치하지 않습니다." };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: row, error: fetchError } = await adminClient
    .from("participant_accounts")
    .select("password_hash")
    .eq("id", account.id)
    .single();

  if (fetchError || !row || !verifyPassword(currentPassword, row.password_hash)) {
    return { error: "현재 비밀번호가 일치하지 않습니다." };
  }

  const { error: updateError } = await adminClient
    .from("participant_accounts")
    .update({
      password_hash: hashPassword(newPassword),
      updated_at: new Date().toISOString()
    })
    .eq("id", account.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/participant/settings");
  return { ok: true };
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
