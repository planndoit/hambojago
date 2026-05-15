"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PendingOverlay } from "@/components/pending-overlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ParticipantSignupFormProps = {
  redirectPath: string;
};

export function ParticipantSignupForm({ redirectPath }: ParticipantSignupFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setMessage("");

      const username = String(formData.get("username") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
      const displayName = String(formData.get("displayName") ?? "").trim();

      if (password !== passwordConfirm) {
        setMessage("비밀번호 확인이 일치하지 않습니다.");
        return;
      }

      if (!displayName) {
        setMessage("이름을 입력해 주세요.");
        return;
      }

      const response = await fetch("/api/participant-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode: "signup",
          username,
          password,
          passwordConfirm,
          displayName
        })
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(result.message ?? "가입하지 못했습니다.");
        return;
      }

      router.push(redirectPath);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="relative grid gap-5">
      <PendingOverlay show={isPending} />
      <Label>
        <span>아이디</span>
        <Input
          autoComplete="username"
          name="username"
          pattern="[a-zA-Z0-9_]{3,20}"
          placeholder="participant_id"
          required
        />
      </Label>
      <Label>
        <span>비밀번호 (8자 이상)</span>
        <Input autoComplete="new-password" minLength={8} name="password" required type="password" />
      </Label>
      <Label>
        <span>비밀번호 확인</span>
        <Input autoComplete="new-password" minLength={8} name="passwordConfirm" required type="password" />
      </Label>
      <Label>
        <span>이름</span>
        <Input
          autoComplete="name"
          maxLength={60}
          minLength={1}
          name="displayName"
          placeholder="홍길동"
          required
        />
      </Label>
      {message ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{message}</p> : null}
      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        회원가입
      </Button>
      <p className="text-center text-sm text-stone-600">
        이미 계정이 있나요?{" "}
        <Link
          className="font-bold text-orange-700 underline-offset-2 hover:underline"
          href={`/participant/login?next=${encodeURIComponent(redirectPath)}`}
        >
          로그인
        </Link>
      </p>
    </form>
  );
}
