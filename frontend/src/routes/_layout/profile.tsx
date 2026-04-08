import { createFileRoute } from "@tanstack/react-router"
import { PageHeader } from "@/components/Common/PageHeader"
import {
  profileActivity,
  profileHighlights,
  profilePermissions,
} from "@/components/Dashboard/demo-data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [{ title: "Profile - DRP Operations Console" }],
  }),
})

function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Account"
        title={user?.full_name || "Profile"}
        description="A richer profile workspace with activity, highlights, and permissions helps the product feel broader and more complete."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {profileHighlights.map((item) => (
          <Card
            key={item.label}
            className="rounded-[28px] border-border/70 bg-card/90 shadow-sm"
          >
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle>{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              A simple timeline-style module for operator context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileActivity.map((entry, index) => (
              <div
                key={entry}
                className="flex gap-4 rounded-2xl border border-border/70 bg-background/70 p-4"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {entry}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Permissions Snapshot</CardTitle>
            <CardDescription>
              Role-based access details often appear in richer dashboard
              templates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profilePermissions.map((permission) => (
              <div
                key={permission.area}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
              >
                <span className="font-medium">{permission.area}</span>
                <span className="text-sm text-muted-foreground">
                  {permission.access}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
