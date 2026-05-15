"use client";

import type { ChangeEvent } from "react";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  changeParticipantPasswordState,
  clearParticipantAvatarAction,
  participantSignOutAction,
  updateParticipantProfileState
} from "@/app/actions";
import { ParticipantAvatar } from "@/components/participant-avatar";
import { FormStatusOverlay } from "@/components/form-status-overlay";
import { PendingOverlay } from "@/components/pending-overlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ParticipantProfileFormProps = {
  username: string;
  initialDisplayName: string;
  initialAvatarUrl: string | null;
};

export function ParticipantProfileForm({
  username,
  initialDisplayName,
  initialAvatarUrl
}: ParticipantProfileFormProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarError, setAvatarError] = useState("");
  const [avatarPending, startAvatarTransition] = useTransition();
  const [profileState, profileAction, profilePending] = useActionState(
    updateParticipantProfileState,
    null
  );
  const [pwdState, pwdAction, pwdPending] = useActionState(changeParticipantPasswordState, null);
  const pwdFormRef = useRef<HTMLFormElement>(null);

  const labelName = initialDisplayName.trim() ? initialDisplayName.trim() : username;

  useEffect(() => {
    if (pwdState?.ok) {
      pwdFormRef.current?.reset();
    }
  }, [pwdState?.ok]);

  function onAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", "participant");

    startAvatarTransition(async () => {
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
    });
  }

  return (
    <div className="relative grid gap-5">
      <PendingOverlay show={avatarPending || profilePending || pwdPending} />
      <div className="hb-calendar-surface flex flex-col items-center gap-3 p-6">
        <ParticipantAvatar avatarUrl={avatarUrl} name={labelName} size={96} />
        <Label className="grid w-full max-w-xs gap-2 text-center">
          <span className="text-xs font-bold text-stone-500">프로필 사진</span>
          <Input accept="image/jpeg,image/png,image/webp" onChange={onAvatarFileChange} type="file" />
        </Label>
        {avatarError ? (
          <p className="text-center text-sm text-red-600">{avatarError}</p>
        ) : null}
        {avatarUrl ? (
          <form action={clearParticipantAvatarAction} className="relative">
            <FormStatusOverlay />
            <Button type="submit" variant="outline">
              사진 삭제
            </Button>
          </form>
        ) : null}
      </div>

      <form action={profileAction} className="relative grid gap-4">
        <div className="grid gap-2">
          <Label>
            <span>아이디</span>
            <Input className="bg-stone-50" readOnly value={username} />
          </Label>
          <p className="text-xs text-stone-500">아이디는 변경할 수 없습니다.</p>
        </div>
        <Label>
          <span>이름</span>
          <Input
            autoComplete="name"
            defaultValue={initialDisplayName}
            maxLength={60}
            minLength={1}
            name="displayName"
            placeholder="이름을 입력해 주세요"
            required
          />
        </Label>
        <p className="text-xs text-stone-500">
          이름은 필수이며, 약속 참여·결과 화면 등에 사용됩니다.
        </p>
        {profileState?.error ? (
          <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{profileState.error}</p>
        ) : null}
        {profileState?.ok ? (
          <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">저장되었습니다.</p>
        ) : null}
        <Button className="w-full" size="lg" type="submit">
          저장
        </Button>
      </form>

      <div className="border-t border-stone-200 pt-5">
        <h3 className="mb-3 text-sm font-bold text-stone-800">비밀번호 변경</h3>
        <form action={pwdAction} className="relative grid gap-4" ref={pwdFormRef}>
          <Label>
            <span>현재 비밀번호</span>
            <Input autoComplete="current-password" name="currentPassword" required type="password" />
          </Label>
          <Label>
            <span>새 비밀번호 (8자 이상)</span>
            <Input autoComplete="new-password" minLength={8} name="newPassword" required type="password" />
          </Label>
          <Label>
            <span>새 비밀번호 확인</span>
            <Input autoComplete="new-password" minLength={8} name="newPasswordConfirm" required type="password" />
          </Label>
          {pwdState?.error ? (
            <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{pwdState.error}</p>
          ) : null}
          {pwdState?.ok ? (
            <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
              비밀번호가 변경되었습니다.
            </p>
          ) : null}
          <Button className="w-full" size="lg" type="submit" variant="secondary">
            비밀번호 변경
          </Button>
        </form>
      </div>

      <form action={participantSignOutAction} className="relative">
        <FormStatusOverlay />
        <Button className="w-full" type="submit" variant="outline">
          로그아웃
        </Button>
      </form>
    </div>
  );
}
