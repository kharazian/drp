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
        description="This workspace already has the right foundation in place. The next step is making the day-to-day experience feel faster, clearer, and more production-ready."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/settings">Update profile</Link>
            </Button>
            <Button asChild>
              <Link to="/items">
                Open items
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My Items"
          value={String(itemCount)}
          hint="Records currently available in your workspace."
          icon={Briefcase}
        />
        <StatCard
          label="Account Type"
          value={currentUser?.is_superuser ? "Admin" : "Member"}
          hint="Access level currently assigned to this session."
          icon={ShieldCheck}
        />
        <StatCard
          label="Profile"
          value={currentUser?.full_name ? "Complete" : "Basic"}
          hint="Add your full name to make collaboration clearer."
          icon={UserRound}
        />
        <StatCard
          label="Users"
          value={currentUser?.is_superuser ? String(userCount) : "Private"}
          hint={
            currentUser?.is_superuser
              ? "Visible because this account has administrator access."
              : "User directory is only available to administrators."
          }
          icon={Users}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <DashboardCard>
          <CardHeader>
            <CardTitle>What is already in this codebase</CardTitle>
            <CardDescription>
              The app already covers the key admin foundations we need.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              "Authenticated app shell with protected routes",
              "Item management with CRUD dialogs and tables",
              "Admin user management for superusers",
              "Account settings, password change, and deletion flow",
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
                  This means we can focus the redesign on UX and presentation
                  instead of rebuilding the underlying flows.
                </p>
              </div>
            ))}
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader>
            <CardTitle>Next Actions</CardTitle>
            <CardDescription>
              Quick paths that match the current structure of the app.
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
                  <p className="font-medium">Open analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Review KPIs and acquisition channel performance.
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
                  <p className="font-medium">Review items</p>
                  <p className="text-sm text-muted-foreground">
                    Browse, create, and update records.
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
                  <p className="font-medium">Plan with kanban</p>
                  <p className="text-sm text-muted-foreground">
                    Use a board view for broader product-work coverage.
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
                  <p className="font-medium">Manage users</p>
                  <p className="text-sm text-muted-foreground">
                    Adjust access and keep the directory tidy.
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
                <p className="font-medium">Review profile workspace</p>
                <p className="text-sm text-muted-foreground">
                  See highlights, permissions, and activity in one view.
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <div className="rounded-2xl border border-primary/15 bg-primary/8 p-4">
              <Badge
                variant="outline"
                className="mb-3 border-primary/20 text-primary"
              >
                Apex Direction
              </Badge>
              <p className="text-sm leading-6 text-muted-foreground">
                This first pass brings the app closer to a polished admin
                dashboard aesthetic while keeping your existing API-driven flows
                intact.
              </p>
            </div>
          </CardContent>
        </DashboardCard>
      </div>
    </div>
  )
}
