import type * as React from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const dashboardCardClass =
  "rounded-[28px] border-border/70 bg-card/90 shadow-sm"
export const dashboardPanelClass =
  "rounded-2xl border border-border/70 bg-background/70 p-4"
export const dashboardPanelDenseClass =
  "rounded-2xl border border-border/70 bg-background/70 p-3"
export const dashboardPanelCompactClass =
  "rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
export const dashboardPanelSpaciousClass =
  "rounded-2xl border border-border/70 bg-background/70 p-6"

export function DashboardCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <Card className={cn(dashboardCardClass, className)} {...props} />
}
