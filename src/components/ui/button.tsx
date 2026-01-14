import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-emerald/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-brand-navy text-white hover:bg-brand-navy/90 shadow-sm",
        success: "bg-brand-emerald text-white hover:bg-brand-emerald/90 shadow-sm",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        outline: "border border-surface-greige bg-white hover:bg-surface-lichen text-text-obsidian",
        ghost: "hover:bg-surface-lichen text-text-obsidian border border-transparent hover:border-surface-greige",
        link: "text-brand-navy underline-offset-4 hover:underline",
        // Backward compatibility
        default: "bg-brand-navy text-white hover:bg-brand-navy/90 shadow-sm",
        secondary: "bg-surface-lichen text-brand-navy hover:bg-surface-greige/50",
      },
      size: {
        default: "h-[44px] px-4 py-2", // Senior-friendly 44px
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-[44px] w-[44px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
