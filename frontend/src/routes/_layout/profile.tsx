import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/profile")({
  component: lazyRouteComponent(
    () => import("@/route-pages/profile-page"),
    "ProfilePage",
  ),
  head: () => ({
    meta: [{ title: "Profile - DRP Operations Console" }],
  }),
})
