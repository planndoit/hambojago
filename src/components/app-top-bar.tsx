import Link from "next/link";
import { Home, LogOut, Menu } from "lucide-react";

import { signOutAction } from "@/app/actions";
import { getCurrentCreator } from "@/lib/auth";

type AppTopBarProps = {
  title: string;
};

export async function AppTopBar({ title }: AppTopBarProps) {
  const creator = await getCurrentCreator();

  return (
    <header className="sticky top-0 z-20 -mx-4 bg-orange-50/95 px-4 py-3 backdrop-blur">
      <div className="flex h-12 items-center justify-between rounded-full border border-orange-100 bg-white/95 px-2 shadow-lg shadow-orange-950/5">
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-black text-stone-900 transition hover:bg-orange-50"
          href="/"
        >
          <Home className="size-4 text-orange-500" />
          홈
        </Link>
        <p className="max-w-36 truncate text-sm font-black text-stone-700">{title}</p>
        {creator ? (
          <details className="relative">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full text-stone-700 transition hover:bg-orange-50 [&::-webkit-details-marker]:hidden">
              <Menu className="size-5" />
            </summary>
            <div className="absolute right-0 top-12 w-44 rounded-3xl border border-orange-100 bg-white p-2 shadow-xl shadow-stone-950/10">
              <Link
                className="flex h-11 w-full items-center gap-2 rounded-2xl px-3 text-sm font-bold text-stone-700 transition hover:bg-orange-50"
                href="/settings/profile"
              >
                회원정보 수정
              </Link>
              <form action={signOutAction}>
                <button
                  className="flex h-11 w-full items-center gap-2 rounded-2xl px-3 text-left text-sm font-bold text-stone-700 transition hover:bg-orange-50"
                  type="submit"
                >
                  <LogOut className="size-4 text-orange-500" />
                  로그아웃
                </button>
              </form>
            </div>
          </details>
        ) : (
          <div className="size-10" aria-hidden="true" />
        )}
      </div>
    </header>
  );
}
