"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Mode = "login" | "signup";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setMessage("");

      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const supabase = createSupabaseBrowserClient();
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      router.push("/events/new");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="form">
      <label className="field">
        <span>이메일</span>
        <input className="input" name="email" required type="email" />
      </label>
      <label className="field">
        <span>비밀번호</span>
        <input className="input" minLength={6} name="password" required type="password" />
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
