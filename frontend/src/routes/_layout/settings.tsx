import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/settings")({
  component: lazyRouteComponent(
    () => import("@/route-pages/settings-page"),
    "UserSettingsPage",
  ),
  head: () => ({
    meta: [
      {
        title: "Settings - DRP Operations Console",
      },
    ],
  }),
})
