import { createFileRoute } from "@tanstack/react-router"
import { BookOpenText, LifeBuoy, MessageSquareText } from "lucide-react"

import {
  DashboardCard,
  dashboardPanelClass,
} from "@/components/Common/dashboard-surface"
import { PageHeader } from "@/components/Common/PageHeader"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const supportCards = [
  {
    title: "Documentation",
    description:
      "Browse onboarding guides, platform policies, and implementation notes.",
    icon: BookOpenText,
  },
  {
    title: "Open a Ticket",
    description:
      "Share incidents, blockers, or product questions with the support team.",
    icon: LifeBuoy,
  },
  {
    title: "Live Guidance",
    description:
      "Coordinate with operations leads on active workflows and escalations.",
    icon: MessageSquareText,
  },
] as const

export const Route = createFileRoute("/_layout/help-support")({
  component: HelpSupportPage,
  head: () => ({
    meta: [{ title: "Help & Support - DRP Operations Console" }],
  }),
})

function HelpSupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="System"
        title="Help & Support"
        description="Support, documentation, and escalation paths for operators and administrators."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {supportCards.map((card) => {
          const Icon = card.icon
          return (
            <DashboardCard key={card.title}>
              <CardHeader>
                <div className="mb-3 rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary w-fit">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </DashboardCard>
          )
        })}
      </div>

      <DashboardCard>
        <CardHeader>
          <CardTitle>Support Workflow</CardTitle>
          <CardDescription>
            Suggested process for common questions and incidents.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[
            "Search internal docs and known-issue notes first.",
            "Escalate operational blockers to the support queue with context.",
            "Loop in product or finance owners when the issue crosses teams.",
          ].map((step, index) => (
            <div key={step} className={dashboardPanelClass}>
              <p className="mb-2 text-sm font-semibold text-primary">
                Step {index + 1}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">{step}</p>
            </div>
          ))}
        </CardContent>
      </DashboardCard>
    </div>
  )
}
