import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/forms-library")({
  component: lazyRouteComponent(
    () => import("@/route-pages/forms-library-page"),
    "FormsLibraryPage",
  ),
  head: () => ({
    meta: [
      {
        title: "Forms Library - DRP Operations Console",
      },
    ],
  }),
})
