import { createFileRoute } from "@tanstack/react-router"
import { Building2, Globe2, UsersRound } from "lucide-react"

import { PageHeader } from "@/components/Common/PageHeader"
import { Badge } from "@/components/ui/badge"
import {
  Card,
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

const customerStats = [
  {
    label: "Active Accounts",
    value: "248",
    icon: UsersRound,
    hint: "Customers with activity in the last 30 days",
  },
  {
    label: "Enterprise",
    value: "42",
    icon: Building2,
    hint: "High-value accounts with annual contracts",
  },
  {
    label: "Regions",
    value: "16",
    icon: Globe2,
    hint: "Active customer footprint across markets",
  },
] as const

const customers = [
  {
    name: "Northstar Labs",
    segment: "Enterprise",
    manager: "A. Rivera",
    region: "USA",
    health: "Healthy",
  },
  {
    name: "Aether Health",
    segment: "Mid-Market",
    manager: "S. Cole",
    region: "Canada",
    health: "Growing",
  },
  {
    name: "Crest Retail",
    segment: "Enterprise",
    manager: "P. Patel",
    region: "Germany",
    health: "At Risk",
  },
  {
    name: "Nova Foods",
    segment: "SMB",
    manager: "J. Walker",
    region: "France",
    health: "Healthy",
  },
] as const

export const Route = createFileRoute("/_layout/customers")({
  component: CustomersPage,
  head: () => ({
    meta: [{ title: "Customers - DRP Operations Console" }],
  }),
})

function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Commerce"
        title="Customers"
        description="Review account health, ownership, and regional coverage across your customer base."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {customerStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className="rounded-[28px] border-border/70 bg-card/90 shadow-sm"
            >
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
            </Card>
          )
        })}
      </div>

      <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>
            Monitor account segment, owner, geography, and overall account
            health.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.name}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.segment}</TableCell>
                  <TableCell>{customer.manager}</TableCell>
                  <TableCell>{customer.region}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.health}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
