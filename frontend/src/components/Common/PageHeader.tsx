import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  badge?: string
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({
  badge,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-[var(--density-page-header-gap)] rounded-[28px] border border-border/70 bg-card/85 p-[var(--density-page-header-pad)] shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between">
      <div className="space-y-[calc(var(--density-page-header-gap)*0.75)]">
        {badge ? (
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary"
          >
            {badge}
          </Badge>
        ) : null}
        <div className="space-y-[calc(var(--density-page-header-gap)*0.5)]">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div className="flex items-center gap-[calc(var(--density-page-header-gap)*0.75)]">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
