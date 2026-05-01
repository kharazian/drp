import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router"
import { z } from "zod"

const searchSchema = z.object({
  formId: z.string().optional(),
  tab: z.enum(["builder", "preview", "submissions", "history"]).catch("builder"),
  newDraft: z.boolean().catch(false),
})

export const Route = createFileRoute("/_layout/forms")({
  component: lazyRouteComponent(
    () => import("@/route-pages/forms-page"),
    "FormsPage",
  ),
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      {
        title: "Forms - DRP Operations Console",
      },
    ],
  }),
})
