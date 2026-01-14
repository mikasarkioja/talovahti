import * as React from "react"
import { cn } from "@/lib/utils"

interface HudCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
}

const HudCard = React.forwardRef<HTMLDivElement, HudCardProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white/70 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-soft text-text-obsidian",
          className
        )}
        {...props}
      >
        {title && <div className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 opacity-80">{title}</div>}
        {children}
      </div>
    )
  }
)
HudCard.displayName = "HudCard"

export { HudCard }
