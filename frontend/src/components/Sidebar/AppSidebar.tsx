import { Link as RouterLink } from "@tanstack/react-router"
import {
  BarChart3,
  Bell,
  BookOpen,
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
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { type Item, Main } from "./Main"
import { User } from "./User"

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

export function AppSidebar() {
  const { user: currentUser } = useAuth()

  const items = currentUser?.is_superuser
    ? [
        ...baseItems,
        {
          section: "System",
          icon: Users,
          title: "Users",
          description: "Access and administration",
          path: "/admin",
        },
      ]
    : baseItems

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/80">
      <SidebarHeader className="h-16 border-b border-sidebar-border/80 px-4 group-data-[collapsible=icon]:px-2">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent className="px-3 py-4 pb-28 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pb-24">
        <Main items={items} showSectionDivider />
        <div className="my-3 border-t border-sidebar-border/80" />
        <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              asChild
              tooltip="Documentation"
              size="lg"
              className="h-auto min-h-11 rounded-lg px-3 py-2 text-sidebar-foreground/72 transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <RouterLink to="/help-support" aria-label="Open documentation">
                <BookOpen className="size-[18px] shrink-0 text-sidebar-foreground/50" />
                <span className="flex-1 group-data-[collapsible=icon]:hidden">
                  Documentation
                </span>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="absolute right-0 bottom-0 left-0 z-20 border-t border-sidebar-border/80 bg-sidebar/95 p-3 backdrop-blur-sm group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
