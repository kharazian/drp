import {
  createFileRoute,
  Outlet,
  Link as RouterLink,
  redirect,
  useRouterState,
} from "@tanstack/react-router"
import { Bell, Search, Sparkles } from "lucide-react"

import { Appearance } from "@/components/Common/Appearance"
import { Footer } from "@/components/Common/Footer"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Dashboard",
    description:
      "Monitor platform activity, stay on top of operations, and move quickly into the workflows that matter.",
  },
  "/items": {
    title: "Items",
    description:
      "Manage inventory records, review changes, and keep your workspace organized.",
  },
  "/analytics": {
    title: "Analytics",
    description:
      "Track KPIs, traffic mix, and reporting modules across the workspace.",
  },
  "/kanban": {
    title: "Kanban",
    description:
      "Organize active initiatives with a board-style planning workflow.",
  },
  "/profile": {
    title: "Profile",
    description:
      "Review account highlights, recent activity, and permission coverage.",
  },
  "/admin": {
    title: "Administration",
    description:
      "Review users, permissions, and the operational health of your account directory.",
  },
  "/settings": {
    title: "Settings",
    description:
      "Update profile details, security controls, and day-to-day workspace preferences.",
  },
}

function Layout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const currentPage = PAGE_META[pathname] ?? PAGE_META["/"]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh bg-transparent">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 px-4 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center gap-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-muted-foreground" />
              <div className="hidden md:block">
                <p className="text-sm font-semibold tracking-tight">
                  {currentPage.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentPage.description}
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="relative hidden min-w-72 lg:block">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search"
                  placeholder="Search users, items, or settings"
                  className="h-10 rounded-full border-border/70 bg-card pl-9 shadow-none"
                />
              </div>
              <Badge
                variant="outline"
                className="hidden rounded-full border-primary/20 bg-primary/8 px-3 py-1 text-primary md:inline-flex"
              >
                <Sparkles className="size-3.5" />
                Ready
              </Badge>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-border/70 bg-card"
                asChild
              >
                <RouterLink to="/settings" aria-label="Open settings">
                  <Bell className="size-4" />
                </RouterLink>
              </Button>
              <Appearance />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout
