"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setMessage("");

      const username = String(formData.get("username") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const response = await fetch("/api/auth", {
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

      router.push("/events/new");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="form">
      <label className="field">
        <span>아이디</span>
        <input
          autoComplete="username"
          className="input"
          name="username"
          pattern="[a-zA-Z0-9_]{3,20}"
          placeholder="hambo_user"
          required
        />
      </label>
      <label className="field">
        <span>비밀번호</span>
        <input
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="input"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      {message ? <p className="muted">{message}</p> : null}
      <button className="button" disabled={isPending} type="submit">
        {mode === "login" ? "로그인" : "회원가입"}
      </button>
      <button
        className="button secondary"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        type="button"
      >
        {mode === "login" ? "회원가입으로 전환" : "로그인으로 전환"}
      </button>
    </form>
  );
}
