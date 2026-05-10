import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { getCurrentCreator } from "@/lib/auth";
import { getSupabaseUrl } from "@/lib/env";
import { getCurrentParticipantAccount } from "@/lib/participant-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const maxBytes = 2 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionForMime(mime: string) {
  if (mime === "image/jpeg") {
    return "jpg";
  }

  if (mime === "image/png") {
    return "png";
  }

  if (mime === "image/webp") {
    return "webp";
  }

  return null;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const roleHint = typeof formData.get("role") === "string" ? String(formData.get("role")) : "";

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "이미지 파일이 필요합니다." }, { status: 400 });
  }

  if (file.size > maxBytes) {
    return NextResponse.json({ message: "파일 크기는 2MB 이하여야 합니다." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ message: "JPEG, PNG, WebP 이미지만 올릴 수 있습니다." }, { status: 400 });
  }

  const ext = extensionForMime(file.type);

  if (!ext) {
    return NextResponse.json({ message: "지원하지 않는 이미지 형식입니다." }, { status: 400 });
  }

  const creator = await getCurrentCreator();
  const participant = await getCurrentParticipantAccount();

  let useCreator: boolean;

  if (roleHint === "creator") {
    if (!creator) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    useCreator = true;
  } else if (roleHint === "participant") {
    if (!participant) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    useCreator = false;
  } else if (creator && !participant) {
    useCreator = true;
  } else if (participant && !creator) {
    useCreator = false;
  } else if (creator && participant) {
    return NextResponse.json(
      { message: "프로필 종류를 선택해 주세요." },
      { status: 400 }
    );
  } else {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const accountId = useCreator ? creator!.id : participant!.id;

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `${useCreator ? "creator" : "participant"}/${accountId}/${randomUUID()}.${ext}`;

  const supabase = createSupabaseAdminClient();
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, buffer, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type
  });

  if (uploadError) {
    return NextResponse.json({ message: uploadError.message }, { status: 500 });
  }

  const publicUrl = `${getSupabaseUrl()}/storage/v1/object/public/avatars/${path}`;

  const updateCreator = useCreator
    ? await supabase.from("creator_accounts").update({ avatar_url: publicUrl }).eq("id", accountId)
    : { error: null };

  const updateParticipant = !useCreator
    ? await supabase.from("participant_accounts").update({ avatar_url: publicUrl }).eq("id", accountId)
    : { error: null };

  const updateError = useCreator ? updateCreator.error : updateParticipant.error;

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ avatarUrl: publicUrl });
}
