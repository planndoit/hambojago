import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MobileShellProps = {
  children: ReactNode;
  className?: string;
};

export function MobileShell({ children, className }: MobileShellProps) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-[430px] bg-orange-50 shadow-2xl shadow-stone-950/10">
      <div className={cn("min-h-dvh px-4 py-5", className)}>{children}</div>
    </main>
  );
}
