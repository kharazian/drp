import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/items")({
  component: lazyRouteComponent(
    () => import("@/route-pages/items-page"),
    "ItemsPage",
  ),
  head: () => ({
    meta: [
      {
        title: "Items - DRP Operations Console",
      },
    ],
  }),
})
