import { cookies } from "next/headers";
import { randomBytes } from "crypto";

import { hashSecret } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const participantSessionCookie = "hambojago_participant_session";
const sessionDays = 30;

export function createParticipantSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function createParticipantAccountSession(participantAccountId: string) {
  const token = createParticipantSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + sessionDays);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("participant_sessions").insert({
    participant_account_id: participantAccountId,
    token_hash: hashSecret(token),
    expires_at: expiresAt.toISOString()
  });

  if (error) {
    throw new Error(error.message);
  }

  const cookieStore = await cookies();
  cookieStore.set(participantSessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function getCurrentParticipantAccount() {
  const cookieStore = await cookies();
  const token = cookieStore.get(participantSessionCookie)?.value;

  if (!token) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data: session, error: sessionError } = await supabase
    .from("participant_sessions")
    .select("participant_account_id, expires_at")
    .eq("token_hash", hashSecret(token))
    .single();

  if (sessionError || !session || new Date(session.expires_at) <= new Date()) {
    return null;
  }

  const { data: account, error: accountError } = await supabase
    .from("participant_accounts")
    .select("id, username, display_name, avatar_url")
    .eq("id", session.participant_account_id)
    .single();

  if (accountError || !account) {
    return null;
  }

  return account;
}

export async function deleteCurrentParticipantSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(participantSessionCookie)?.value;

  if (token) {
    const supabase = createSupabaseAdminClient();
    await supabase.from("participant_sessions").delete().eq("token_hash", hashSecret(token));
  }

  cookieStore.delete(participantSessionCookie);
}
