import { NextResponse } from "next/server";

import {
  createCreatorSession,
  isValidDisplayName,
  isValidPassword,
  isValidUsername
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AuthRequest = {
  mode?: unknown;
  username?: unknown;
  password?: unknown;
  passwordConfirm?: unknown;
  displayName?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AuthRequest;
  const mode = body.mode === "signup" ? "signup" : "login";
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const passwordConfirm = typeof body.passwordConfirm === "string" ? body.passwordConfirm : "";
  const displayNameRaw = typeof body.displayName === "string" ? body.displayName.trim() : "";

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { message: "아이디는 영문, 숫자, 밑줄로 3~20자만 사용할 수 있습니다." },
      { status: 400 }
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { message: "비밀번호는 8자 이상이어야 합니다." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  if (mode === "signup") {
    if (password !== passwordConfirm) {
      return NextResponse.json(
        { message: "비밀번호 확인이 일치하지 않습니다." },
        { status: 400 }
      );
    }

    if (!isValidDisplayName(displayNameRaw)) {
      return NextResponse.json(
        { message: "이름은 1자 이상 60자 이하로 입력해 주세요." },
        { status: 400 }
      );
    }

    const displayName = displayNameRaw.slice(0, 60);

    const { data: creator, error } = await supabase
      .from("creator_accounts")
      .insert({
        username,
        password_hash: hashPassword(password),
        display_name: displayName
      })
      .select("id")
      .single();

    if (error || !creator) {
      return NextResponse.json(
        { message: error?.code === "23505" ? "이미 사용 중인 아이디입니다." : "가입하지 못했습니다." },
        { status: 400 }
      );
    }

    await createCreatorSession(creator.id);
    return NextResponse.json({ ok: true });
  }

  const { data: creator, error } = await supabase
    .from("creator_accounts")
    .select("id, password_hash")
    .eq("username", username)
    .single();

  if (error || !creator || !verifyPassword(password, creator.password_hash)) {
    return NextResponse.json(
      { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  await createCreatorSession(creator.id);
  return NextResponse.json({ ok: true });
}
