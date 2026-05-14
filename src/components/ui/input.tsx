import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-stone-200/90 bg-white px-4 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-[3px] focus:ring-orange-100",
        className
      )}
      type={type}
      {...props}
    />
  );
}

export { Input };
