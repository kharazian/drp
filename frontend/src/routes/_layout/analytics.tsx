import { createFileRoute } from "@tanstack/react-router"
import { Activity, BarChart3, DollarSign, Users } from "lucide-react"
import { PageHeader } from "@/components/Common/PageHeader"
import {
  analyticsChannels,
  analyticsMetrics,
  roadmapCards,
} from "@/components/Dashboard/demo-data"
import { StatCard } from "@/components/Dashboard/StatCard"
import { Badge } from "@/components/ui/badge"
import {
  Card,
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

export const Route = createFileRoute("/_layout/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [{ title: "Analytics - DRP Operations Console" }],
  }),
})

function AnalyticsPage() {
  const icons = [DollarSign, Users, Activity, BarChart3]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Insights"
        title="Analytics"
        description="A broader analytics surface with KPI cards, channel breakdowns, and reporting blocks that make the app feel closer to a fuller admin product."
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
            />
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Acquisition Channels</CardTitle>
            <CardDescription>
              A table-style breakdown for channel performance.
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
        </Card>

        <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Reporting Blocks</CardTitle>
            <CardDescription>
              Suggested modules for expanding the suite beyond the base
              template.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roadmapCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-border/70 bg-background/70 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{card.title}</Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
