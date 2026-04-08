import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/invoices")({
  component: lazyRouteComponent(
    () => import("@/route-pages/invoices-page"),
    "InvoicesPage",
  ),
  head: () => ({
    meta: [{ title: "Invoices - DRP Operations Console" }],
  }),
})
