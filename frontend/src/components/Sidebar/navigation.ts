import {
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  ChartColumn,
  ContactRound,
  CreditCard,
  FolderKanban,
  Home,
  KanbanSquare,
  LifeBuoy,
  Mail,
  MessagesSquare,
  Receipt,
  ReceiptText,
  Settings,
  UserRound,
  Users,
} from "lucide-react"

import type { UserPublic } from "@/client"
import type { Item } from "./types"

const baseItems: Item[] = [
  {
    section: "Overview",
    icon: Home,
    title: "Dashboard",
    path: "/",
  },
  {
    section: "Overview",
    icon: BarChart3,
    title: "Analytics",
    path: "/analytics",
  },
  {
    section: "Overview",
    icon: ChartColumn,
    title: "Charts",
    path: "/charts",
  },
  {
    section: "Workspace",
    icon: Briefcase,
    title: "Operations",
    description: "Items, kanban, and scheduling",
    path: "/items",
    children: [
      { icon: Briefcase, title: "Items", path: "/items" },
      { icon: KanbanSquare, title: "Kanban", path: "/kanban" },
      { icon: CalendarDays, title: "Calendar", path: "/calendar" },
    ],
  },
  {
    section: "Workspace",
    icon: FolderKanban,
    title: "Apps",
    description: "Files, mail, and chat",
    path: "/files",
    children: [
      { icon: FolderKanban, title: "Files", path: "/files" },
      { icon: Mail, title: "Mail", path: "/mail" },
      { icon: MessagesSquare, title: "Chat", path: "/chat" },
    ],
  },
  {
    section: "Commerce",
    icon: ReceiptText,
    title: "Commerce",
    description: "Orders, customers, and invoices",
    path: "/orders",
    children: [
      { icon: ReceiptText, title: "Orders", path: "/orders" },
      { icon: ContactRound, title: "Customers", path: "/customers" },
      { icon: Receipt, title: "Invoices", path: "/invoices" },
    ],
  },
  {
    section: "Finance",
    icon: CreditCard,
    title: "Billing",
    description: "Plans, usage, and payment methods",
    path: "/billing",
  },
  {
    section: "Account",
    icon: UserRound,
    title: "Profile",
    description: "Personal account summary",
    path: "/profile",
  },
  {
    section: "System",
    icon: Bell,
    title: "Notifications",
    description: "Alerts and approvals",
    path: "/notifications",
  },
  {
    section: "System",
    icon: Settings,
    title: "Settings",
    description: "Workspace preferences",
    path: "/settings",
  },
  {
    section: "System",
    icon: LifeBuoy,
    title: "Help & Support",
    description: "Docs and support links",
    path: "/help-support",
  },
]

const superuserItems: Item[] = [
  {
    section: "System",
    icon: Users,
    title: "Users",
    description: "Access and administration",
    path: "/admin",
  },
]

export function getSidebarItems(user?: UserPublic | null): Item[] {
  if (user?.is_superuser) {
    return [...baseItems, ...superuserItems]
  }

  return baseItems
}
