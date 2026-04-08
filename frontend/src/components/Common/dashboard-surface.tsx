import type * as React from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const dashboardCardClass =
  "motion-card-hover motion-surface-enter rounded-[28px] border-border/65 bg-card/97 shadow-[0_16px_40px_-26px_color-mix(in_oklab,var(--foreground)_18%,transparent),0_1px_0_0_color-mix(in_oklab,white_80%,transparent)_inset] backdrop-blur"
export const dashboardPanelClass =
  "motion-card-hover motion-fade-rise rounded-2xl border border-border/55 bg-card/84 p-[var(--density-panel-pad)] shadow-[0_10px_24px_-24px_color-mix(in_oklab,var(--foreground)_24%,transparent),0_1px_0_0_color-mix(in_oklab,white_72%,transparent)_inset]"
export const dashboardPanelDenseClass =
  "motion-card-hover motion-fade-rise rounded-2xl border border-border/55 bg-card/84 p-[var(--density-panel-pad-dense)] shadow-[0_10px_24px_-24px_color-mix(in_oklab,var(--foreground)_24%,transparent),0_1px_0_0_color-mix(in_oklab,white_72%,transparent)_inset]"
export const dashboardPanelCompactClass =
  "motion-card-hover motion-fade-rise rounded-2xl border border-border/55 bg-card/84 px-[var(--density-panel-pad-compact-x)] py-[var(--density-panel-pad-compact-y)] shadow-[0_10px_24px_-24px_color-mix(in_oklab,var(--foreground)_24%,transparent),0_1px_0_0_color-mix(in_oklab,white_72%,transparent)_inset]"
export const dashboardPanelSpaciousClass =
  "motion-card-hover motion-fade-rise rounded-2xl border border-border/55 bg-card/84 p-[var(--density-panel-pad-spacious)] shadow-[0_10px_24px_-24px_color-mix(in_oklab,var(--foreground)_24%,transparent),0_1px_0_0_color-mix(in_oklab,white_72%,transparent)_inset]"

export function DashboardCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <Card className={cn(dashboardCardClass, className)} {...props} />
}
