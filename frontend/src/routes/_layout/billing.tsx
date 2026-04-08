import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/billing")({
  component: lazyRouteComponent(
    () => import("@/route-pages/billing-page"),
    "BillingPage",
  ),
  head: () => ({
    meta: [{ title: "Billing - DRP Operations Console" }],
  }),
})
