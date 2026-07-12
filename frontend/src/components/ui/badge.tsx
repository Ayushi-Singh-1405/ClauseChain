import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "compliant" | "pending" | "under-review" | "at-risk" | "overdue" | "breach"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-bg-card-hover text-text-secondary",
    compliant: "bg-status-compliant/10 text-status-compliant",
    pending: "bg-status-pending/10 text-status-pending",
    "under-review": "bg-status-under-review/10 text-status-under-review",
    "at-risk": "bg-status-at-risk/10 text-status-at-risk",
    overdue: "bg-status-overdue/10 text-status-overdue",
    breach: "bg-status-breach/10 text-status-breach",
  }

  const dotStyles = {
    default: "bg-text-secondary",
    compliant: "bg-status-compliant",
    pending: "bg-status-pending",
    "under-review": "bg-status-under-review",
    "at-risk": "bg-status-at-risk",
    overdue: "bg-status-overdue",
    breach: "bg-status-breach",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[variant])} />
      {variant === "breach" ? (
        <span className="font-bold">{props.children}</span>
      ) : (
        props.children
      )}
    </div>
  )
}

export { Badge }