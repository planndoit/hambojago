"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PendingOverlay } from "@/components/pending-overlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  authApiPath?: string;
  redirectPath?: string;
  registerHref?: string;
  registerLabel?: string;
};

export function LoginForm({
  authApiPath = "/api/auth",
  redirectPath = "/",
  registerHref = "/register",
  registerLabel = "회원가입"
}: LoginFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setMessage("");

      const username = String(formData.get("username") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const response = await fetch(authApiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mode: "login", username, password })
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(result.message ?? "로그인하지 못했습니다.");
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
          placeholder="hambo_user"
          required
        />
      </Label>
      <Label>
        <span>비밀번호</span>
        <Input autoComplete="current-password" name="password" required type="password" />
      </Label>
      {message ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{message}</p> : null}
      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        로그인
      </Button>
      <p className="text-center text-sm text-stone-600">
        <Link className="font-bold text-orange-700 underline-offset-2 hover:underline" href={registerHref}>
          {registerLabel}
        </Link>
      </p>
    </form>
  );
}
