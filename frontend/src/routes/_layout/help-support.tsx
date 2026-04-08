import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/help-support")({
  component: lazyRouteComponent(
    () => import("@/route-pages/help-support-page"),
    "HelpSupportPage",
  ),
  head: () => ({
    meta: [{ title: "Help & Support - DRP Operations Console" }],
  }),
})
