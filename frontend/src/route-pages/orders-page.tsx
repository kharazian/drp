import { Clock3, PackageCheck, Truck } from "lucide-react"

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

const orderStats = [
  {
    label: "Routes Awaiting Dispatch",
    value: "124",
    icon: Clock3,
    hint: "Orders still waiting for vehicle assignment",
  },
  {
    label: "Loaded and Ready",
    value: "38",
    icon: PackageCheck,
    hint: "Stops packed and cleared for departure today",
  },
  {
    label: "Out for Delivery",
    value: "57",
    icon: Truck,
    hint: "Currently running through active routes",
  },
] as const

const orders = [
  {
    id: "#10482",
    customer: "Northstar Labs",
    status: "Awaiting dispatch",
    total: "$2,480",
    channel: "Urban Core",
  },
  {
    id: "#10481",
    customer: "Aether Health",
    status: "Loaded",
    total: "$1,190",
    channel: "Partner Carrier",
  },
  {
    id: "#10480",
    customer: "Crest Retail",
    status: "In transit",
    total: "$6,740",
    channel: "Suburban Loop",
  },
  {
    id: "#10479",
    customer: "Nova Foods",
    status: "Delivered",
    total: "$890",
    channel: "Rush Delivery",
  },
] as const

export function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Commerce"
        title="Orders"
        description="Track dispatch readiness, route assignment, and live delivery flow across active customer orders."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {orderStats.map((stat) => {
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
                    stat.label === "Routes Awaiting Dispatch"
                      ? "amber"
                      : stat.label === "Loaded and Ready"
                        ? "emerald"
                        : "blue"
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
          <CardTitle>Dispatch Queue</CardTitle>
          <CardDescription>
            Monitor the latest order flow by customer, route family, and
            dispatch status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Route Family</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.channel}</TableCell>
                  <TableCell>{order.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </DashboardCard>
    </div>
  )
}
