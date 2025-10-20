import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  size?: "sm" | "md" | "lg" | "xl"
  color?: "default" | "muted" | "brand" | "success" | "warning" | "danger"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5", 
  lg: "h-6 w-6",
  xl: "h-8 w-8",
}

const colorClasses = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  brand: "text-brand-500",
  success: "text-success",
  warning: "text-warning", 
  danger: "text-danger",
}

const Icon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ className, icon: IconComponent, size = "md", color = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <IconComponent 
          className={cn(
            sizeClasses[size],
            colorClasses[color],
            "stroke-current"
          )}
          strokeWidth={1.5}
        />
      </div>
    )
  }
)
Icon.displayName = "Icon"

export { Icon }
