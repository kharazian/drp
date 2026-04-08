import { Link as RouterLink, useRouterState } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export type Item = {
  section?: string
  icon: LucideIcon
  title: string
  description?: string
  path: string
}

interface MainProps {
  items: Item[]
}

export function Main({ items }: MainProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const router = useRouterState()
  const currentPath = router.location.pathname
  const groupedItems = items.reduce<Record<string, Item[]>>((acc, item) => {
    const section = item.section ?? "Workspace"
    acc[section] ??= []
    acc[section].push(item)
    return acc
  }, {})

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <>
      {Object.entries(groupedItems).map(([section, sectionItems]) => (
        <SidebarGroup key={section} className="mb-4">
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/55">
            {section}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center">
              {sectionItems.map((item) => {
                const isActive = currentPath === item.path

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                  >
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      asChild
                      size="lg"
                      className="h-auto min-h-12 px-3 py-3 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                    >
                      <RouterLink to={item.path} onClick={handleMenuClick}>
                        <item.icon />
                        <div className="flex min-w-0 flex-col items-start group-data-[collapsible=icon]:hidden">
                          <span>{item.title}</span>
                          {item.description ? (
                            <span className="text-xs text-sidebar-foreground/65">
                              {item.description}
                            </span>
                          ) : null}
                        </div>
                      </RouterLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
