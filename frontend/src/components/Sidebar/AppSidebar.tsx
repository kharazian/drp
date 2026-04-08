import {
  BarChart3,
  Briefcase,
  CalendarDays,
  ChartColumn,
  ContactRound,
  Home,
  KanbanSquare,
  Receipt,
  ReceiptText,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { type Item, Main } from "./Main"
import { User } from "./User"

const baseItems: Item[] = [
  {
    section: "Overview",
    icon: Home,
    title: "Dashboard",
    description: "Health, activity, and quick actions",
    path: "/",
  },
  {
    section: "Overview",
    icon: BarChart3,
    title: "Analytics",
    description: "KPIs, channels, and reporting blocks",
    path: "/analytics",
  },
  {
    section: "Overview",
    icon: ChartColumn,
    title: "Charts",
    description: "Showcase visual reporting blocks",
    path: "/charts",
  },
  {
    section: "Manage",
    icon: Briefcase,
    title: "Items",
    description: "Create, review, and update records",
    path: "/items",
  },
  {
    section: "Manage",
    icon: KanbanSquare,
    title: "Kanban",
    description: "Track product and delivery work",
    path: "/kanban",
  },
  {
    section: "Apps",
    icon: CalendarDays,
    title: "Calendar",
    description: "Plan meetings and team schedules",
    path: "/calendar",
  },
  {
    section: "Commerce",
    icon: ReceiptText,
    title: "Orders",
    description: "Track fulfillment and shipment flow",
    path: "/orders",
  },
  {
    section: "Commerce",
    icon: ContactRound,
    title: "Customers",
    description: "Review account health and ownership",
    path: "/customers",
  },
  {
    section: "Commerce",
    icon: Receipt,
    title: "Invoices",
    description: "Track billing and collection status",
    path: "/invoices",
  },
  {
    section: "Account",
    icon: UserRound,
    title: "Profile",
    description: "Highlights, activity, and permissions",
    path: "/profile",
  },
  {
    section: "Account",
    icon: Settings,
    title: "Settings",
    description: "Profile, security, and preferences",
    path: "/settings",
  },
]

export function AppSidebar() {
  const { user: currentUser } = useAuth()

  const items = currentUser?.is_superuser
    ? [
        ...baseItems,
        {
          section: "Administration",
          icon: Users,
          title: "Admin",
          description: "Users, permissions, and access",
          path: "/admin",
        },
      ]
    : baseItems

  return (
    <Sidebar
      collapsible="icon"
      className="p-3 group-data-[collapsible=icon]:p-2"
    >
      <SidebarHeader className="gap-4 rounded-[28px] border border-sidebar-border/70 bg-sidebar px-4 py-5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <Logo variant="responsive" />
        <div className="rounded-2xl border border-primary/12 bg-primary/8 p-3 text-sm group-data-[collapsible=icon]:hidden">
          <div className="mb-1 flex items-center gap-2 font-medium text-sidebar-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Control Center
          </div>
          <p className="text-xs leading-5 text-sidebar-foreground/70">
            Operational views for users, inventory, and account controls.
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent className="mt-4 rounded-[28px] border border-sidebar-border/70 bg-sidebar px-2 py-4 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-3">
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter className="mt-4 rounded-[28px] border border-sidebar-border/70 bg-sidebar p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
