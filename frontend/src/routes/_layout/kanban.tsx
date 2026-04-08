import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/kanban")({
  component: lazyRouteComponent(
    () => import("@/route-pages/kanban-page"),
    "KanbanPage",
  ),
  head: () => ({
    meta: [{ title: "Kanban - DRP Operations Console" }],
  }),
})
