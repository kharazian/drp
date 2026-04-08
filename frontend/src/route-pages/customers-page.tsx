import { Building2, Globe2, UsersRound } from "lucide-react"

import { DashboardCard } from "@/components/Common/dashboard-surface"
import { IconBadge } from "@/components/Common/icon-badge"
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

const customerStats = [
  {
    label: "Active Delivery Accounts",
    value: "248",
    icon: UsersRound,
    hint: "Accounts with completed stops in the last 30 days",
  },
  {
    label: "High-Volume Contracts",
    value: "42",
    icon: Building2,
    hint: "Accounts with dedicated route capacity",
  },
  {
    label: "Coverage Regions",
    value: "16",
    icon: Globe2,
    hint: "Markets currently supported by DRP operations",
  },
] as const

const customers = [
  {
    name: "Northstar Labs",
    segment: "Enterprise",
    manager: "A. Rivera",
    region: "USA",
    health: "On Track",
  },
  {
    name: "Aether Health",
    segment: "Mid-Market",
    manager: "S. Cole",
    region: "Canada",
    health: "Ramp Up",
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
    health: "On Track",
  },
] as const

export function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Commerce"
        title="Customers"
        description="Review service health, ownership, and delivery coverage across DRP customer accounts."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {customerStats.map((stat) => {
          const Icon = stat.icon
          return (
            <DashboardCard key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="mt-1 text-3xl">{stat.value}</CardTitle>
                </div>
                <IconBadge
                  icon={Icon}
                  tone={
                    stat.label === "Active Delivery Accounts"
                      ? "blue"
                      : stat.label === "High-Volume Contracts"
                        ? "violet"
                        : "emerald"
                  }
                />
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
          <CardTitle>Service Accounts</CardTitle>
          <CardDescription>
            Monitor account segment, owner, geography, and service health.
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
                <TableHead>Service Health</TableHead>
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
      </DashboardCard>
    </div>
  )
}
