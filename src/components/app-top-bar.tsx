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
    <header className="sticky top-0 z-20 -mx-4 mb-1 sm:-mx-5">
      <div className="rounded-2xl border border-orange-100/90 bg-white/90 px-2 py-2 shadow-[0_8px_30px_-12px_rgb(28_25_23_/18%)] backdrop-blur-md sm:px-3">
        <div className="flex h-11 items-center justify-between sm:h-12">
          <Link
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-bold text-stone-800 transition hover:bg-orange-50/90"
            href="/"
          >
            <Home className="size-4 text-orange-500" />
            홈
          </Link>
          <p className="min-w-0 max-w-[46%] truncate text-center text-sm font-black tracking-[-0.02em] text-stone-900 sm:max-w-[50%]">
            {title}
          </p>
          {creator ? (
            <details className="relative shrink-0">
              <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full text-stone-600 transition hover:bg-orange-50/90 [&::-webkit-details-marker]:hidden">
                <Menu className="size-5" />
              </summary>
              <div className="absolute right-0 top-12 z-30 w-48 rounded-2xl border border-orange-100 bg-white/98 p-1.5 shadow-[0_20px_40px_-16px_rgb(0_0_0_/28%)]">
                <Link
                  className="flex h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-bold text-stone-700 transition hover:bg-orange-50"
                  href="/settings/profile"
                >
                  회원정보 수정
                </Link>
                <form action={signOutAction}>
                  <button
                    className="flex h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-bold text-stone-700 transition hover:bg-orange-50"
                    type="submit"
                  >
                    <LogOut className="size-4 text-orange-500" />
                    로그아웃
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <div className="size-10 shrink-0" aria-hidden="true" />
          )}
        </div>
      </div>
    </header>
  );
}
