import * as React from "react";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("grid gap-2 text-sm font-bold tracking-[-0.01em] text-stone-800", className)}
      {...props}
    />
  );
}

export { Label };
