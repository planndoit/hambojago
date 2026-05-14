import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "hb-surface-inset text-stone-950 shadow-[0_18px_40px_-24px_rgb(28_25_23_/20%)]",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-2 p-5 pb-3 sm:p-6 sm:pb-4", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "text-[1.35rem] font-black leading-[1.15] tracking-[-0.035em] text-stone-950 sm:text-[1.5rem]",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm leading-relaxed text-stone-600", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-5 pt-2 sm:p-6 sm:pt-3", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
