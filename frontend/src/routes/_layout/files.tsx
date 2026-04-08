import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/files")({
  component: lazyRouteComponent(
    () => import("@/route-pages/files-page"),
    "FilesPage",
  ),
  head: () => ({
    meta: [{ title: "Files - DRP Operations Console" }],
  }),
})
