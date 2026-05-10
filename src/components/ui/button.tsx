import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600",
        secondary: "bg-orange-50 text-orange-700 hover:bg-orange-100",
        outline: "border border-orange-200 bg-white text-stone-800 hover:bg-orange-50",
        ghost: "text-stone-600 hover:bg-stone-100"
      },
      size: {
        default: "h-12 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-6 text-base",
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
