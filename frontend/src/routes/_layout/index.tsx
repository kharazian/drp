import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/")({
  component: lazyRouteComponent(
    () => import("@/route-pages/dashboard-page"),
    "DashboardPage",
  ),
  head: () => ({
    meta: [
      {
        title: "Dashboard - DRP Operations Console",
      },
    ],
  }),
})
