import { createFileRoute } from "@tanstack/react-router"
import { CreditCard, Landmark, WalletCards } from "lucide-react"

import {
  DashboardCard,
  dashboardPanelClass,
} from "@/components/Common/dashboard-surface"
import { PageHeader } from "@/components/Common/PageHeader"
import { Badge } from "@/components/ui/badge"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const billingCards = [
  {
    label: "Current Plan",
    value: "Scale",
    hint: "Includes advanced admin workspaces",
    icon: WalletCards,
  },
  {
    label: "Monthly Spend",
    value: "$4,280",
    hint: "Projected usage and subscription cost",
    icon: CreditCard,
  },
  {
    label: "Next Renewal",
    value: "May 28",
    hint: "Auto-renews unless billing owner changes plan",
    icon: Landmark,
  },
] as const

const paymentMethods = [
  { name: "Visa ending 4821", status: "Primary" },
  { name: "Corporate ACH Transfer", status: "Backup" },
] as const

export const Route = createFileRoute("/_layout/billing")({
  component: BillingPage,
  head: () => ({
    meta: [{ title: "Billing - DRP Operations Console" }],
  }),
})

function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Finance"
        title="Billing"
        description="Manage plans, payment methods, and subscription status from a dedicated finance workspace."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {billingCards.map((card) => {
          const Icon = card.icon

          return (
            <DashboardCard key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="mt-1 text-3xl">{card.value}</CardTitle>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.hint}</p>
              </CardContent>
            </DashboardCard>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <DashboardCard>
          <CardHeader>
            <CardTitle>Usage Snapshot</CardTitle>
            <CardDescription>
              Current billing cycle usage and entitlement summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Workspace seats", usage: "18 / 25" },
              { label: "API environments", usage: "6 / 10" },
              { label: "Stored exports", usage: "184 GB / 250 GB" },
            ].map((item) => (
              <div key={item.label} className={dashboardPanelClass}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-medium">{item.label}</p>
                  <Badge variant="outline">{item.usage}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Saved billing instruments and fallback coverage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.name} className={dashboardPanelClass}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-medium">{method.name}</p>
                  <Badge variant="outline">{method.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Securely stored for recurring subscription payments.
                </p>
              </div>
            ))}
          </CardContent>
        </DashboardCard>
      </div>
    </div>
  )
}
