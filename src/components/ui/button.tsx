import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold tracking-[-0.01em] transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default:
          "bg-orange-500 text-white shadow-[0_10px_28px_-8px_rgb(234_88_12_/55%)] hover:bg-orange-600",
        secondary:
          "border border-orange-100/80 bg-white text-orange-800 shadow-sm hover:border-orange-200 hover:bg-orange-50/80",
        outline:
          "border border-stone-200 bg-white/90 text-stone-800 shadow-sm hover:border-orange-200 hover:bg-orange-50/60",
        ghost: "text-stone-600 hover:bg-stone-100/80"
      },
      size: {
        default: "h-12 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-6 text-[0.95rem]",
        icon: "h-11 w-11 px-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
