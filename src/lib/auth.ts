import { cookies } from "next/headers";
import { randomBytes } from "crypto";

import { hashSecret } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const creatorSessionCookie = "hambojago_creator_session";
const sessionDays = 30;

export function isValidUsername(username: string) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export function isValidPassword(password: string) {
  return password.length >= 8;
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function createCreatorSession(creatorId: string) {
  const token = createSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + sessionDays);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("creator_sessions").insert({
    creator_id: creatorId,
    token_hash: hashSecret(token),
    expires_at: expiresAt.toISOString()
  });

  if (error) {
    throw new Error(error.message);
  }

  const cookieStore = await cookies();
  cookieStore.set(creatorSessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function getCurrentCreator() {
  const cookieStore = await cookies();
  const token = cookieStore.get(creatorSessionCookie)?.value;

  if (!token) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data: session, error: sessionError } = await supabase
    .from("creator_sessions")
    .select("creator_id, expires_at")
    .eq("token_hash", hashSecret(token))
    .single();

  if (sessionError || !session || new Date(session.expires_at) <= new Date()) {
    return null;
  }

  const { data: creator, error: creatorError } = await supabase
    .from("creator_accounts")
    .select("id, username")
    .eq("id", session.creator_id)
    .single();

  if (creatorError || !creator) {
    return null;
  }

  return creator;
}

export async function deleteCurrentCreatorSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(creatorSessionCookie)?.value;

  if (token) {
    const supabase = createSupabaseAdminClient();
    await supabase.from("creator_sessions").delete().eq("token_hash", hashSecret(token));
  }

  cookieStore.delete(creatorSessionCookie);
}
