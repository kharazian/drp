import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/customers")({
  component: lazyRouteComponent(
    () => import("@/route-pages/customers-page"),
    "CustomersPage",
  ),
  head: () => ({
    meta: [{ title: "Customers - DRP Operations Console" }],
  }),
})
