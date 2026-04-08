import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/orders")({
  component: lazyRouteComponent(
    () => import("@/route-pages/orders-page"),
    "OrdersPage",
  ),
  head: () => ({
    meta: [{ title: "Orders - DRP Operations Console" }],
  }),
})
