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
import { getSidebarSections } from "./navigation"
import { User } from "./User"

export function AppSidebar() {
  const { user: currentUser } = useAuth()
  const sections = getSidebarSections(currentUser)

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/80">
      <SidebarHeader className="h-[var(--density-sidebar-header-height)] border-b border-sidebar-border/80 px-4 group-data-[collapsible=icon]:px-2">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent className="px-[var(--density-sidebar-pad-x)] py-[var(--density-sidebar-pad-y)] group-data-[collapsible=icon]:px-[var(--density-sidebar-pad-collapsed-x)]">
        <Main sections={sections} showSectionDivider />
        <div className="my-3 border-t border-sidebar-border/80" />
        <SidebarMenu className="gap-[var(--density-sidebar-menu-gap)] group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              asChild
              tooltip="Documentation"
              size="lg"
              className="h-auto min-h-[var(--density-sidebar-parent-min-h)] rounded-lg px-3 py-2 text-sidebar-foreground/72 transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-[var(--density-sidebar-collapsed-button)] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
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
      <SidebarFooter className="mt-auto border-t border-sidebar-border/80 bg-sidebar/95 p-[var(--density-sidebar-footer-pad)] backdrop-blur-sm group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-[var(--density-sidebar-footer-pad-collapsed)]">
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
