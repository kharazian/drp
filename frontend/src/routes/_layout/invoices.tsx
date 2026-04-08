import { createFileRoute } from "@tanstack/react-router"
import { CreditCard, Receipt, Wallet } from "lucide-react"

import { DashboardCard } from "@/components/Common/dashboard-surface"
import { PageHeader } from "@/components/Common/PageHeader"
import { Badge } from "@/components/ui/badge"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const invoiceStats = [
  {
    label: "Open Invoices",
    value: "31",
    icon: Receipt,
    hint: "Awaiting collection or review",
  },
  {
    label: "Paid This Month",
    value: "$84.2K",
    icon: Wallet,
    hint: "Collected across active customer accounts",
  },
  {
    label: "Overdue",
    value: "7",
    icon: CreditCard,
    hint: "Require follow-up from finance or account owners",
  },
] as const

const invoices = [
  {
    id: "INV-2408",
    customer: "Northstar Labs",
    due: "May 08",
    status: "Open",
    amount: "$12,480",
  },
  {
    id: "INV-2407",
    customer: "Aether Health",
    due: "May 03",
    status: "Paid",
    amount: "$5,190",
  },
  {
    id: "INV-2406",
    customer: "Crest Retail",
    due: "Apr 28",
    status: "Overdue",
    amount: "$8,740",
  },
  {
    id: "INV-2405",
    customer: "Nova Foods",
    due: "Apr 24",
    status: "Paid",
    amount: "$2,890",
  },
] as const

export const Route = createFileRoute("/_layout/invoices")({
  component: InvoicesPage,
  head: () => ({
    meta: [{ title: "Invoices - DRP Operations Console" }],
  }),
})

function InvoicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Commerce"
        title="Invoices"
        description="Monitor outstanding balances, collections, and invoice activity across your accounts."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {invoiceStats.map((stat) => {
          const Icon = stat.icon
          return (
            <DashboardCard key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="mt-1 text-3xl">{stat.value}</CardTitle>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </DashboardCard>
          )
        })}
      </div>

      <DashboardCard>
        <CardHeader>
          <CardTitle>Invoice Queue</CardTitle>
          <CardDescription>
            Review due dates, payment status, and collection amounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>{invoice.due}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </DashboardCard>
    </div>
  )
}
