import {
  DashboardCard,
  dashboardPanelClass,
  dashboardPanelCompactClass,
} from "@/components/Common/dashboard-surface"
import { PageHeader } from "@/components/Common/PageHeader"
import {
  profileActivity,
  profileHighlights,
  profilePermissions,
} from "@/components/Dashboard/demo-data"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"

export function ProfilePage() {
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
          <DashboardCard key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle>{item.value}</CardTitle>
            </CardHeader>
          </DashboardCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DashboardCard>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              A simple timeline-style module for operator context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileActivity.map((entry, index) => (
              <div key={entry} className={`flex gap-4 ${dashboardPanelClass}`}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {entry}
                </p>
              </div>
            ))}
          </CardContent>
        </DashboardCard>

        <DashboardCard>
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
                className={`flex items-center justify-between ${dashboardPanelCompactClass}`}
              >
                <span className="font-medium">{permission.area}</span>
                <span className="text-sm text-muted-foreground">
                  {permission.access}
                </span>
              </div>
            ))}
          </CardContent>
        </DashboardCard>
      </div>
    </div>
  )
}
