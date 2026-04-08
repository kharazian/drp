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
import { ThemeCustomizer } from "@/components/Common/ThemeCustomizer"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import { useTheme } from "@/components/theme-provider"
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

const TOP_NAV_ITEMS = [
  { label: "Dashboard", path: "/" },
  { label: "Analytics", path: "/analytics" },
  { label: "Items", path: "/items" },
  { label: "Kanban", path: "/kanban" },
  { label: "Profile", path: "/profile" },
] as const

function Layout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { preferences } = useTheme()
  const currentPage = PAGE_META[pathname] ?? PAGE_META["/"]
  const isTopNav = preferences.layout === "top-nav"
  const contentWidth =
    preferences.container === "boxed" ? "max-w-6xl" : "max-w-[88rem]"
  const contentPadding =
    preferences.density === "compact"
      ? "px-4 py-4 md:px-5 md:py-5"
      : preferences.density === "spacious"
        ? "px-5 py-8 md:px-8 md:py-10"
        : "px-4 py-6 md:px-6 md:py-8"

  return (
    <SidebarProvider>
      {!isTopNav ? <AppSidebar /> : null}
      <SidebarInset className="min-h-svh bg-transparent">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 px-4 backdrop-blur-xl">
          <div
            className={[
              "mx-auto flex h-20 items-center gap-3",
              contentWidth,
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              {!isTopNav ? (
                <SidebarTrigger className="-ml-1 text-muted-foreground" />
              ) : null}
              <div className="hidden md:block">
                <p className="text-sm font-semibold tracking-tight">
                  {currentPage.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentPage.description}
                </p>
              </div>
            </div>

            {isTopNav ? (
              <nav className="hidden items-center gap-2 xl:flex">
                {TOP_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.path

                  return (
                    <RouterLink
                      key={item.path}
                      to={item.path}
                      className={[
                        "rounded-full px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      ].join(" ")}
                    >
                      {item.label}
                    </RouterLink>
                  )
                })}
              </nav>
            ) : null}

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
              <ThemeCustomizer />
              <Appearance />
            </div>
          </div>
        </header>
        <main className={["flex-1", contentPadding].join(" ")}>
          <div className={["mx-auto", contentWidth].join(" ")}>
            <Outlet />
          </div>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout
