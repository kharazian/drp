import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type IconTone =
  | "primary"
  | "emerald"
  | "blue"
  | "violet"
  | "amber"
  | "neutral"

const iconToneClasses: Record<IconTone, string> = {
  primary: "border-primary/15 bg-primary/10 text-primary",
  emerald:
    "border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  blue: "border-sky-500/15 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  violet:
    "border-violet-500/15 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  amber:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  neutral: "border-border/70 bg-accent/60 text-muted-foreground",
}

interface IconBadgeProps {
  icon: LucideIcon
  tone?: IconTone
  className?: string
  iconClassName?: string
}

export function IconBadge({
  icon: Icon,
  tone = "primary",
  className,
  iconClassName,
}: IconBadgeProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-[var(--density-stat-icon-pad)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
        iconToneClasses[tone],
        className,
      )}
    >
      <Icon className={cn("size-5", iconClassName)} />
    </div>
  )
}
