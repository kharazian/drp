import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/chat")({
  component: lazyRouteComponent(
    () => import("@/route-pages/chat-page"),
    "ChatPage",
  ),
  head: () => ({
    meta: [{ title: "Chat - DRP Operations Console" }],
  }),
})
