import { Activity, BarChart3, DollarSign, Users } from "lucide-react"
import {
  DashboardCard,
  dashboardPanelClass,
} from "@/components/Common/dashboard-surface"
import { PageHeader } from "@/components/Common/PageHeader"
import {
  analyticsChannels,
  analyticsMetrics,
  roadmapCards,
} from "@/components/Dashboard/demo-data"
import { StatCard } from "@/components/Dashboard/StatCard"
import { Badge } from "@/components/ui/badge"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AnalyticsPage() {
  const icons = [DollarSign, Users, Activity, BarChart3]
  const tones = ["amber", "blue", "emerald", "violet"] as const

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Insights"
        title="Analytics"
        description="Track service reliability, route throughput, and depot-level exception trends across DRP operations."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsMetrics.map((metric, index) => {
          const Icon = icons[index]
          return (
            <StatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
              icon={Icon}
              tone={tones[index]}
            />
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard>
          <CardHeader>
            <CardTitle>Route Mix</CardTitle>
            <CardDescription>
              Delivery volume by route family, partner coverage, and service
              mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Share</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsChannels.map((channel) => (
                  <TableRow key={channel.channel}>
                    <TableCell className="font-medium">
                      {channel.channel}
                    </TableCell>
                    <TableCell>{channel.users}</TableCell>
                    <TableCell>{channel.share}</TableCell>
                    <TableCell>{channel.trend}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader>
            <CardTitle>Ops Reporting Blocks</CardTitle>
            <CardDescription>
              Suggested modules for turning the analytics workspace into a
              dispatch-ready command center.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roadmapCards.map((card) => (
              <div key={card.title} className={dashboardPanelClass}>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{card.title}</Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
              </div>
            ))}
          </CardContent>
        </DashboardCard>
      </div>
    </div>
  )
}
