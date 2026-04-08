import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/calendar")({
  component: lazyRouteComponent(
    () => import("@/route-pages/calendar-page"),
    "CalendarPage",
  ),
  head: () => ({
    meta: [{ title: "Calendar - DRP Operations Console" }],
  }),
})
