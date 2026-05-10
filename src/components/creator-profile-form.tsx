"use client";

import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  clearCreatorAvatarAction,
  updateCreatorProfileAction
} from "@/app/actions";
import { ParticipantAvatar } from "@/components/participant-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreatorProfileFormProps = {
  username: string;
  initialDisplayName: string;
  initialAvatarUrl: string | null;
};

export function CreatorProfileForm({
  username,
  initialDisplayName,
  initialAvatarUrl
}: CreatorProfileFormProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarError, setAvatarError] = useState("");

  const labelName = initialDisplayName.trim() ? initialDisplayName.trim() : username;

  async function onAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", "creator");

    const response = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData
    });
    const data = (await response.json()) as { avatarUrl?: string; message?: string };

    if (!response.ok || !data.avatarUrl) {
      setAvatarError(data.message ?? "사진을 올리지 못했습니다.");
      return;
    }

    setAvatarUrl(data.avatarUrl);
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col items-center gap-3 rounded-[1.75rem] border border-orange-100 bg-white p-6">
        <ParticipantAvatar avatarUrl={avatarUrl} name={labelName} size={96} />
        <Label className="grid w-full max-w-xs gap-2 text-center">
          <span className="text-xs font-bold text-stone-500">프로필 사진</span>
          <Input accept="image/jpeg,image/png,image/webp" onChange={onAvatarFileChange} type="file" />
        </Label>
        {avatarError ? (
          <p className="text-center text-sm text-red-600">{avatarError}</p>
        ) : null}
        {avatarUrl ? (
          <form action={clearCreatorAvatarAction}>
            <Button type="submit" variant="outline">
              사진 삭제
            </Button>
          </form>
        ) : null}
      </div>

      <form action={updateCreatorProfileAction} className="grid gap-4">
        <Label>
          <span>표시 이름</span>
          <Input
            defaultValue={initialDisplayName}
            name="displayName"
            placeholder={username}
          />
        </Label>
        <p className="text-xs text-stone-500">
          비워 두면 약속 목록 등에서는 아이디({username})로 표시됩니다.
        </p>
        <Button className="w-full" size="lg" type="submit">
          이름 저장
        </Button>
      </form>
    </div>
  );
}
