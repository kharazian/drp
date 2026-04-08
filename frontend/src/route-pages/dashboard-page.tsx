import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  KanbanSquare,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react"

import { ItemsService, UsersService } from "@/client"
import {
  DashboardCard,
  dashboardPanelClass,
} from "@/components/Common/dashboard-surface"
import { PageHeader } from "@/components/Common/PageHeader"
import { StatCard } from "@/components/Dashboard/StatCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"

export function DashboardPage() {
  const { user: currentUser } = useAuth()
  const itemsQuery = useQuery({
    queryKey: ["items", "dashboard-count"],
    queryFn: () => ItemsService.readItems({ skip: 0, limit: 100 }),
  })
  const usersQuery = useQuery({
    queryKey: ["users", "dashboard-count"],
    queryFn: () => UsersService.readUsers({ skip: 0, limit: 100 }),
    enabled: Boolean(currentUser?.is_superuser),
  })

  const itemCount = itemsQuery.data?.count ?? 0
  const userCount = usersQuery.data?.count ?? 0
  const displayName = currentUser?.full_name || currentUser?.email || "there"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Overview"
        title={`Welcome back, ${displayName}`}
        description="Start the shift with route health, depot readiness, and the exception queues that need attention before vehicles roll out."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/settings">Update shift prefs</Link>
            </Button>
            <Button asChild>
              <Link to="/items">
                Open route board
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open Routes"
          value={String(itemCount)}
          hint="Active route records currently in the control board."
          icon={Briefcase}
          tone="emerald"
        />
        <StatCard
          label="Control Access"
          value={currentUser?.is_superuser ? "Supervisor" : "Dispatcher"}
          hint="Current console permissions for this shift."
          icon={ShieldCheck}
          tone="blue"
        />
        <StatCard
          label="Operator Profile"
          value={currentUser?.full_name ? "Verified" : "Needs update"}
          hint="Keep supervisor and escalation details current."
          icon={UserRound}
          tone="violet"
        />
        <StatCard
          label="Driver Accounts"
          value={currentUser?.is_superuser ? String(userCount) : "Private"}
          hint={
            currentUser?.is_superuser
              ? "Visible because this console can manage driver access."
              : "Driver directory is only available to supervisors."
          }
          icon={Users}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <DashboardCard>
          <CardHeader>
            <CardTitle>What the control stack already supports</CardTitle>
            <CardDescription>
              The platform foundation is already in place for DRP’s operations
              workflows.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              "Protected control-tower shell for dispatch and supervisor roles",
              "Route board records with CRUD dialogs and table workflows",
              "Driver and staff access management for supervisor accounts",
              "Operator settings, password controls, and session maintenance",
            ].map((feature) => (
              <div
                key={feature}
                className={`${dashboardPanelClass} text-sm text-muted-foreground`}
              >
                <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                  <span className="size-2 rounded-full bg-primary" />
                  {feature}
                </div>
                <p className="leading-6">
                  That means the next product work can focus on routing clarity,
                  depot visibility, and dispatch speed instead of rebuilding
                  core admin plumbing.
                </p>
              </div>
            ))}
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader>
            <CardTitle>Shift Priorities</CardTitle>
            <CardDescription>
              Fast paths for the workflows dispatch leads reach for most.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              to="/analytics"
              className={`flex items-center justify-between ${dashboardPanelClass} transition-colors hover:bg-accent/50`}
            >
              <div className="flex items-start gap-3">
                <BarChart3 className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Review route health</p>
                  <p className="text-sm text-muted-foreground">
                    Check on-time delivery, exceptions, and depot trends.
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              to="/items"
              className={`flex items-center justify-between ${dashboardPanelClass} transition-colors hover:bg-accent/50`}
            >
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Open route board</p>
                  <p className="text-sm text-muted-foreground">
                    Browse, create, and update active route records.
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              to="/kanban"
              className={`flex items-center justify-between ${dashboardPanelClass} transition-colors hover:bg-accent/50`}
            >
              <div className="flex items-start gap-3">
                <KanbanSquare className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Plan service rollout</p>
                  <p className="text-sm text-muted-foreground">
                    Track hub launches, field changes, and exception fixes.
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            {currentUser?.is_superuser ? (
              <Link
                to="/admin"
                className={`flex items-center justify-between ${dashboardPanelClass} transition-colors hover:bg-accent/50`}
              >
                <div>
                  <p className="font-medium">Manage driver access</p>
                  <p className="text-sm text-muted-foreground">
                    Keep driver, dispatcher, and supervisor accounts current.
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ) : null}
            <Link
              to="/profile"
              className={`flex items-center justify-between ${dashboardPanelClass} transition-colors hover:bg-accent/50`}
            >
              <div>
                <p className="font-medium">Review operator profile</p>
                <p className="text-sm text-muted-foreground">
                  See shift coverage, permissions, and recent actions in one
                  view.
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <div className="rounded-2xl border border-primary/15 bg-primary/8 p-4">
              <Badge
                variant="outline"
                className="mb-3 border-primary/20 text-primary"
              >
                DRP Command Center
              </Badge>
              <p className="text-sm leading-6 text-muted-foreground">
                This workspace is now moving toward a real operations control
                surface for dispatch, exception response, and field readiness.
              </p>
            </div>
          </CardContent>
        </DashboardCard>
      </div>
    </div>
  )
}
