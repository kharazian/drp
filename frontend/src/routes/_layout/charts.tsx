import { createFileRoute } from "@tanstack/react-router"
import { AreaChart, BarChart3, PieChart } from "lucide-react"

import { PageHeader } from "@/components/Common/PageHeader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const revenueBars = [42, 66, 58, 88, 74, 96, 83]
const channelSplit = [
  { label: "Direct", value: "34%" },
  { label: "Partner", value: "27%" },
  { label: "Marketplace", value: "21%" },
  { label: "Outbound", value: "18%" },
] as const

export const Route = createFileRoute("/_layout/charts")({
  component: ChartsPage,
  head: () => ({
    meta: [{ title: "Charts - DRP Operations Console" }],
  }),
})

function ChartsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Insights"
        title="Charts"
        description="A chart showcase page gives the product the broader demo coverage seen in premium dashboard templates."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              Revenue Trend
            </CardTitle>
            <CardDescription>
              Simple visual blocks standing in for a bar-chart style module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-3 rounded-2xl border border-border/70 bg-background/70 p-6">
              {revenueBars.map((value, index) => (
                <div
                  key={value}
                  className="flex flex-1 flex-col items-center gap-3"
                >
                  <div
                    className="w-full rounded-t-2xl bg-primary/75"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    W{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="size-4 text-primary" />
                Channel Split
              </CardTitle>
              <CardDescription>
                Breakdown blocks for traffic or revenue mix.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {channelSplit.map((item, index) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="size-3 rounded-full bg-primary"
                      style={{ opacity: 1 - index * 0.16 }}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AreaChart className="size-4 text-primary" />
                Pipeline Growth
              </CardTitle>
              <CardDescription>
                Layered display for trend-oriented chart storytelling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-40 overflow-hidden rounded-2xl border border-border/70 bg-background/70">
                <div className="absolute inset-x-4 bottom-4 h-20 rounded-[100%_100%_0_0] bg-primary/18" />
                <div className="absolute inset-x-8 bottom-4 h-14 rounded-[100%_100%_0_0] bg-primary/32" />
                <div className="absolute inset-x-12 bottom-4 h-10 rounded-[100%_100%_0_0] bg-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
