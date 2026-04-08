import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string
  hint: string
  icon: LucideIcon
}

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/88 shadow-sm backdrop-blur">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
            {label}
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            {value}
          </CardTitle>
        </div>
        <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}
