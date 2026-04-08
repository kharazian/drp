import {
  createFileRoute,
  Outlet,
  Link as RouterLink,
  redirect,
  useRouterState,
} from "@tanstack/react-router"
import { Bell, Search, Sparkles } from "lucide-react"

import { Footer } from "@/components/Common/Footer"
import { HeaderUserMenu } from "@/components/Common/HeaderUserMenu"
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
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import { PAGE_META, TOP_NAV_ITEMS } from "@/routes/-_layout.config"

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

function Layout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { preferences } = useTheme()
  const { user } = useAuth()
  const currentPage = PAGE_META[pathname] ?? PAGE_META["/"]
  const isTopNav = preferences.layout === "top-nav"
  const contentWidth =
    preferences.container === "boxed" ? "max-w-6xl" : "max-w-[88rem]"

  return (
    <SidebarProvider>
      {!isTopNav ? <AppSidebar /> : null}
      <SidebarInset className="motion-surface-enter min-h-svh bg-transparent">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 px-4 backdrop-blur-xl">
          <div
            className={[
              "mx-auto flex h-[var(--density-header-height)] items-center gap-3",
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
                        "motion-control rounded-full px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "border border-primary/16 bg-primary/9 text-primary shadow-[0_12px_20px_-18px_color-mix(in_oklab,var(--primary)_62%,transparent)]"
                          : "text-muted-foreground hover:bg-accent/72 hover:text-foreground",
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
                  className="motion-control h-[var(--density-control-height-lg)] rounded-full border-border/70 bg-card/88 pl-9 shadow-[0_8px_20px_-18px_color-mix(in_oklab,var(--foreground)_22%,transparent),0_1px_0_0_color-mix(in_oklab,white_72%,transparent)_inset]"
                />
              </div>
              <Badge
                variant="outline"
                className="hidden rounded-full border-emerald-500/14 bg-emerald-500/10 px-3 py-1 text-emerald-700 shadow-[0_10px_20px_-18px_rgba(16,185,129,0.55)] md:inline-flex motion-fade-rise dark:text-emerald-300"
              >
                <Sparkles className="size-3.5" />
                Ready
              </Badge>
              <Button
                variant="outline"
                size="icon"
                className="motion-control rounded-full border-border/70 bg-card"
                asChild
              >
                <RouterLink to="/notifications" aria-label="Open notifications">
                  <Bell className="size-4" />
                </RouterLink>
              </Button>
              <ThemeCustomizer />
              <HeaderUserMenu
                fullName={user?.full_name}
                email={user?.email ?? undefined}
              />
            </div>
          </div>
        </header>
        <main className="flex-1 px-[var(--density-page-pad-x)] py-[var(--density-page-pad-y)] md:px-[var(--density-page-pad-x-md)] md:py-[var(--density-page-pad-y-md)]">
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
