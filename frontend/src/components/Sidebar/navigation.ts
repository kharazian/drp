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
import type { Item, SidebarNavSection } from "./types"

const systemItems: Item[] = [
  {
    icon: Bell,
    title: "Notifications",
    description: "Alerts and approvals",
    path: "/notifications",
  },
  {
    icon: Settings,
    title: "Settings",
    description: "Workspace preferences",
    path: "/settings",
  },
  {
    icon: LifeBuoy,
    title: "Help & Support",
    description: "Docs and support links",
    path: "/help-support",
  },
]

const superuserItem: Item = {
  icon: Users,
  title: "Users",
  description: "Access and administration",
  path: "/admin",
}

const baseSections: SidebarNavSection[] = [
  {
    key: "Overview",
    items: [
      {
        icon: Home,
        title: "Dashboard",
        path: "/",
      },
      {
        icon: BarChart3,
        title: "Analytics",
        path: "/analytics",
      },
      {
        icon: ChartColumn,
        title: "Charts",
        path: "/charts",
      },
    ],
  },
  {
    key: "Workspace",
    items: [
      {
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
    ],
  },
  {
    key: "Commerce",
    items: [
      {
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
    ],
  },
  {
    key: "Finance",
    items: [
      {
        icon: CreditCard,
        title: "Billing",
        description: "Plans, usage, and payment methods",
        path: "/billing",
      },
    ],
  },
  {
    key: "Account",
    items: [
      {
        icon: UserRound,
        title: "Profile",
        description: "Personal account summary",
        path: "/profile",
      },
    ],
  },
  {
    key: "System",
    items: systemItems,
  },
]

export function getSidebarSections(
  user?: UserPublic | null,
): SidebarNavSection[] {
  if (user?.is_superuser) {
    return baseSections.map((section) =>
      section.key === "System"
        ? { ...section, items: [...section.items, superuserItem] }
        : section,
    )
  }

  return baseSections
}

export function flattenSidebarSections(sections: SidebarNavSection[]): Item[] {
  return sections.flatMap((section) => section.items)
}

export function getSidebarItems(user?: UserPublic | null): Item[] {
  return flattenSidebarSections(getSidebarSections(user))
}
