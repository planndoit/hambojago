"use client";

import { Loader2 } from "lucide-react";

export function PendingOverlay({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/40 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-2xl shadow-stone-950/20">
        <Loader2 aria-hidden className="size-10 animate-spin text-orange-500" />
      </div>
    </div>
  );
}
