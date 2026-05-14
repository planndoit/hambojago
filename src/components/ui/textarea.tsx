import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-stone-200/90 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-[3px] focus:ring-orange-100",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
