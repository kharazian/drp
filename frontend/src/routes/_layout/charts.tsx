import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/charts")({
  component: lazyRouteComponent(
    () => import("@/route-pages/charts-page"),
    "ChartsPage",
  ),
  head: () => ({
    meta: [{ title: "Charts - DRP Operations Console" }],
  }),
})
