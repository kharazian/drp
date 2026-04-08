import { Link as RouterLink } from "@tanstack/react-router"
import { BookOpen } from "lucide-react"
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
import { Main } from "./Main"
import { getSidebarItems } from "./navigation"
import { User } from "./User"

export function AppSidebar() {
  const { user: currentUser } = useAuth()
  const items = getSidebarItems(currentUser)

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/80">
      <SidebarHeader className="h-16 border-b border-sidebar-border/80 px-4 group-data-[collapsible=icon]:px-2">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent className="px-3 py-4 group-data-[collapsible=icon]:px-2">
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
      <SidebarFooter className="mt-auto border-t border-sidebar-border/80 bg-sidebar/95 p-3 backdrop-blur-sm group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
