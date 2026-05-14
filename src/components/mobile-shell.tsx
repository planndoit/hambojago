import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MobileShellProps = {
  children: ReactNode;
  className?: string;
};

export function MobileShell({ children, className }: MobileShellProps) {
  return (
    <div className="flex min-h-dvh justify-center px-3 py-4 sm:px-4 sm:py-6">
      <main
        className={cn(
          "flex w-full max-w-[430px] flex-col overflow-hidden rounded-[1.75rem] border border-stone-700/25 bg-gradient-to-b from-orange-50/98 via-orange-50 to-amber-50/90 shadow-[0_0_0_1px_rgb(28_25_23_/6%),0_25px_50px_-12px_rgb(0_0_0_/45%)]",
          "ring-1 ring-white/40"
        )}
      >
        <div className={cn("min-h-0 flex-1 px-4 py-5 sm:px-5 sm:py-6", className)}>{children}</div>
      </main>
    </div>
  );
}
