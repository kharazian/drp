import {
  DashboardCard,
  dashboardPanelClass,
  dashboardPanelCompactClass,
} from "@/components/Common/dashboard-surface"
import { PageHeader } from "@/components/Common/PageHeader"
import { Badge } from "@/components/ui/badge"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const folders = [
  { label: "Inbox", count: 24 },
  { label: "Starred", count: 7 },
  { label: "Drafts", count: 3 },
  { label: "Archived", count: 18 },
] as const

const threads = [
  {
    sender: "Northstar Labs",
    subject: "Q2 operations review",
    preview:
      "Attached is the updated order forecast and customer expansion plan.",
    unread: true,
  },
  {
    sender: "Finance Team",
    subject: "Invoice exception request",
    preview: "Please review the adjustment request before Thursday close.",
    unread: false,
  },
  {
    sender: "Product Ops",
    subject: "Launch readiness follow-up",
    preview:
      "We need final confirmation on the rollout checklist and support handoff.",
    unread: true,
  },
] as const

export function MailPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Apps"
        title="Mail"
        description="A lightweight inbox page helps the suite feel more like a complete admin workspace."
      />

      <div className="grid gap-6 xl:grid-cols-[0.35fr_1fr]">
        <DashboardCard>
          <CardHeader>
            <CardTitle>Folders</CardTitle>
            <CardDescription>
              Mailbox categories and activity counts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {folders.map((folder) => (
              <div
                key={folder.label}
                className={`flex items-center justify-between ${dashboardPanelCompactClass}`}
              >
                <span className="font-medium">{folder.label}</span>
                <Badge variant="outline">{folder.count}</Badge>
              </div>
            ))}
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>
              Important operational and customer-facing threads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {threads.map((thread) => (
              <div key={thread.subject} className={dashboardPanelClass}>
                <div className="mb-2 flex items-center gap-2">
                  <p className="font-medium">{thread.sender}</p>
                  {thread.unread ? <Badge>Unread</Badge> : null}
                </div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  {thread.subject}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {thread.preview}
                </p>
              </div>
            ))}
          </CardContent>
        </DashboardCard>
      </div>
    </div>
  )
}
