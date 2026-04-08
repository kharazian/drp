import {
  createFileRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/login")({
  component: lazyRouteComponent(
    () => import("@/route-pages/login-page"),
    "LoginPage",
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
        title: "Log In - DRP Operations Console",
      },
    ],
  }),
})
