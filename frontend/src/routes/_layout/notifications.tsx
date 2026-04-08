import { createFileRoute } from "@tanstack/react-router"
import { BellRing, CheckCircle2, TriangleAlert } from "lucide-react"

import { PageHeader } from "@/components/Common/PageHeader"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const notifications = [
  {
    title: "Quarterly summary is ready",
    detail: "The operations dashboard summary was generated 12 minutes ago.",
    type: "report",
    icon: CheckCircle2,
  },
  {
    title: "New user requested elevated access",
    detail: "Review the permissions request from support-team@example.com.",
    type: "admin",
    icon: BellRing,
  },
  {
    title: "Billing reminder due tomorrow",
    detail:
      "A finance workflow still needs approval before the billing cycle closes.",
    type: "finance",
    icon: TriangleAlert,
  },
] as const

export const Route = createFileRoute("/_layout/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [{ title: "Notifications - DRP Operations Console" }],
  }),
})

function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="System"
        title="Notifications"
        description="Keep track of important updates, approval requests, and workflow alerts."
      />

      <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            A lightweight system inbox for updates across the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon

            return (
              <div
                key={notification.title}
                className="flex items-start gap-4 rounded-2xl border border-border/70 bg-background/70 p-4"
              >
                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    <Badge variant="outline">{notification.type}</Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {notification.detail}
                  </p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
