import { Link as RouterLink } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ItemLabel } from "./ItemLabel"
import {
  childButtonClass,
  childIconClass,
  parentButtonClass,
  parentIconClass,
} from "./menu-styles"
import type { Item } from "./types"

export function SidebarParentItem({
  item,
  isActive,
  isExpanded,
  shouldHideTooltip,
  currentPath,
  open,
  isMobile,
  toggleItem,
  handleMenuClick,
}: {
  item: Item
  isActive: boolean
  isExpanded: boolean
  shouldHideTooltip: boolean
  currentPath: string
  open: boolean
  isMobile: boolean
  toggleItem: (title: string) => void
  handleMenuClick: () => void
}) {
  return (
    <>
      <SidebarMenuButton
        tooltip={shouldHideTooltip ? undefined : item.title}
        isActive={isActive}
        size="lg"
        className={parentButtonClass}
        onClick={() => {
          if (!open && !isMobile) {
            return
          }
          toggleItem(item.title)
        }}
      >
        <item.icon className={parentIconClass} />
        <ItemLabel title={item.title} description={item.description} />
        <ChevronRight
          className={[
            "ml-auto size-4 text-sidebar-foreground/65 transition-transform duration-300 ease-out group-data-[collapsible=icon]:hidden",
            isExpanded ? "rotate-90" : "",
          ].join(" ")}
        />
      </SidebarMenuButton>
      <div
        className={[
          "grid transition-all duration-300 ease-out group-data-[collapsible=icon]:hidden",
          isExpanded
            ? "mt-2 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div
          className={[
            "overflow-hidden transition-transform duration-300 ease-out",
            isExpanded ? "translate-y-0" : "-translate-y-1",
          ].join(" ")}
        >
          <SidebarMenu className="submenu-shell gap-1 border-l border-sidebar-border/70 pl-3">
            {item.children?.map((child) => (
              <SidebarMenuItem key={child.title}>
                <SidebarMenuButton
                  tooltip={child.title}
                  isActive={currentPath === child.path}
                  asChild
                  className={cn(
                    childButtonClass,
                    currentPath === child.path
                      ? "border-sidebar-border/70 bg-sidebar-accent/34 text-sidebar-primary shadow-[0_10px_18px_-18px_color-mix(in_oklab,var(--sidebar-primary)_70%,transparent)]"
                      : "bg-transparent",
                  )}
                >
                  <RouterLink to={child.path} onClick={handleMenuClick}>
                    <child.icon className={childIconClass} />
                    <span className="font-medium">{child.title}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </div>
    </>
  )
}
