import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon?: LucideIcon
  description?: string
}

const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ className, label, value, icon: Icon, description, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center space-y-1 p-3 rounded-lg bg-muted/50 focus-ring",
          className
        )}
        role="region"
        aria-label={`${label}: ${value}${description ? `, ${description}` : ''}`}
        tabIndex={0}
        {...props}
      >
        {Icon && (
          <Icon 
            className="h-4 w-4 text-muted-foreground" 
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
        <div className="text-2xl font-bold tabular-nums" aria-label={String(value)}>
          {value}
        </div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
    )
  }
)
Stat.displayName = "Stat"

export { Stat }
