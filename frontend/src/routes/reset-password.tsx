import {
  createFileRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router"
import { z } from "zod"

import { isLoggedIn } from "@/hooks/useAuth"

const searchSchema = z.object({
  token: z.string().catch(""),
})

export const Route = createFileRoute("/reset-password")({
  component: lazyRouteComponent(
    () => import("@/route-pages/reset-password-page"),
    "ResetPasswordPage",
  ),
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    if (isLoggedIn()) {
      throw redirect({ to: "/" })
    }
    if (!search.token) {
      throw redirect({ to: "/login" })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Reset Password - DRP Operations Console",
      },
    ],
  }),
})
