import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none min-h-11 px-5 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:bg-accent-hover active:bg-accent-hover",
        secondary:
          "bg-bg-elevated-2 text-fg border border-border-strong hover:bg-bg-elevated",
        ghost: "text-fg-muted hover:text-fg hover:bg-bg-elevated",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        default: "min-h-11 px-5",
        sm: "min-h-9 px-3.5 text-sm rounded-lg",
        full: "min-h-12 w-full px-5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
