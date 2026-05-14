"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PendingOverlay } from "@/components/pending-overlay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup";

type AuthFormProps = {
  authApiPath?: string;
  redirectPath?: string;
  initialMode?: Mode;
};

export function AuthForm({
  authApiPath = "/api/auth",
  redirectPath = "/",
  initialMode = "login"
}: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
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
        body: JSON.stringify({ mode, username, password })
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
        <Input
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </Label>
      {message ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{message}</p> : null}
      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {mode === "login" ? "로그인" : "회원가입"}
      </Button>
      <Button
        className="w-full"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        type="button"
        variant="outline"
      >
        {mode === "login" ? "회원가입으로 전환" : "로그인으로 전환"}
      </Button>
    </form>
  );
}
