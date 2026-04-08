import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/notifications")({
  component: lazyRouteComponent(
    () => import("@/route-pages/notifications-page"),
    "NotificationsPage",
  ),
  head: () => ({
    meta: [{ title: "Notifications - DRP Operations Console" }],
  }),
})
