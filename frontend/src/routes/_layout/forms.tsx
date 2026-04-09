import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/forms")({
  component: lazyRouteComponent(
    () => import("@/route-pages/forms-page"),
    "FormsPage",
  ),
  head: () => ({
    meta: [
      {
        title: "Forms - DRP Operations Console",
      },
    ],
  }),
})
