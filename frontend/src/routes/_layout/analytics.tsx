import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/analytics")({
  component: lazyRouteComponent(
    () => import("@/route-pages/analytics-page"),
    "AnalyticsPage",
  ),
  head: () => ({
    meta: [{ title: "Analytics - DRP Operations Console" }],
  }),
})
