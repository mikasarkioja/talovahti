import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

interface ActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  title: string
  badgeText?: string
  badgeColor?: "amber" | "red" | "emerald" | "blue"
  onClick?: () => void
}

const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({ className, icon: Icon, title, badgeText, badgeColor = "amber", onClick, children, ...props }, ref) => {
    
    const badgeStyles = {
        amber: "bg-amber-100 text-amber-700 border-amber-200",
        red: "bg-red-100 text-red-700 border-red-200",
        emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
        blue: "bg-blue-100 text-blue-700 border-blue-200"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white border border-surface-greige rounded-xl p-4 shadow-sm transition-all hover:shadow-md hover:border-brand-emerald/30 cursor-pointer group",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-full bg-surface-lichen text-brand-navy group-hover:scale-110 transition-transform">
                <Icon size={24} />
            </div>
            {badgeText && (
                <Badge variant="outline" className={cn("uppercase text-[10px] font-bold tracking-wider", badgeStyles[badgeColor])}>
                    {badgeText}
                </Badge>
            )}
        </div>
        <h3 className="text-lg font-bold text-text-obsidian group-hover:text-brand-navy transition-colors">
            {title}
        </h3>
        {children && <div className="text-sm text-slate-500 mt-1">{children}</div>}
      </div>
    )
  }
)
ActionCard.displayName = "ActionCard"

export { ActionCard }
