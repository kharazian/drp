import { Clock3, PackageCheck, Truck } from "lucide-react"

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

const orderStats = [
  {
    label: "Open Orders",
    value: "124",
    icon: Clock3,
    hint: "Awaiting review or fulfillment",
  },
  {
    label: "Ready to Ship",
    value: "38",
    icon: PackageCheck,
    hint: "Prepared for dispatch today",
  },
  {
    label: "In Transit",
    value: "57",
    icon: Truck,
    hint: "Currently moving through carriers",
  },
] as const

const orders = [
  {
    id: "#10482",
    customer: "Northstar Labs",
    status: "Processing",
    total: "$2,480",
    channel: "Direct",
  },
  {
    id: "#10481",
    customer: "Aether Health",
    status: "Packed",
    total: "$1,190",
    channel: "Partner",
  },
  {
    id: "#10480",
    customer: "Crest Retail",
    status: "Shipped",
    total: "$6,740",
    channel: "Marketplace",
  },
  {
    id: "#10479",
    customer: "Nova Foods",
    status: "Delivered",
    total: "$890",
    channel: "Direct",
  },
] as const

export function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Commerce"
        title="Orders"
        description="Track fulfillment activity, shipping readiness, and order flow across your workspace."
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
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Monitor the latest order activity by customer, channel, and shipment
            status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
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
