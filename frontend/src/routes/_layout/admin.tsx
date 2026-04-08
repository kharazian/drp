import {
  createFileRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router"

import { UsersService } from "@/client"

export const Route = createFileRoute("/_layout/admin")({
  component: lazyRouteComponent(
    () => import("@/route-pages/admin-page"),
    "AdminPage",
  ),
  beforeLoad: async () => {
    const user = await UsersService.readUserMe()
    if (!user.is_superuser) {
      throw redirect({
        to: "/",
      })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Administration - DRP Operations Console",
      },
    ],
  }),
})
