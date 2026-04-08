import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/mail")({
  component: lazyRouteComponent(
    () => import("@/route-pages/mail-page"),
    "MailPage",
  ),
  head: () => ({
    meta: [{ title: "Mail - DRP Operations Console" }],
  }),
})
