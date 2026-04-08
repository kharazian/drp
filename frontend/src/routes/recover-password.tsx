import {
  createFileRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router"

import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/recover-password")({
  component: lazyRouteComponent(
    () => import("@/route-pages/recover-password-page"),
    "RecoverPasswordPage",
  ),
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Recover Password - DRP Operations Console",
      },
    ],
  }),
})
