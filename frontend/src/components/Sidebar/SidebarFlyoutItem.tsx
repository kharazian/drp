import { Link as RouterLink } from "@tanstack/react-router"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { ItemLabel } from "./ItemLabel"
import { parentButtonClass, parentIconClass } from "./menu-styles"
import type { Item } from "./types"

export function SidebarFlyoutItem({
  item,
  isActive,
  shouldHideTooltip,
  currentPath,
  submenuMode,
  hoveredFlyout,
  setHoveredFlyout,
  clearCloseTimeout,
  scheduleHoverClose,
  handleMenuClick,
}: {
  item: Item
  isActive: boolean
  shouldHideTooltip: boolean
  currentPath: string
  submenuMode: "click" | "hover"
  hoveredFlyout: string | null
  setHoveredFlyout: (title: string | null) => void
  clearCloseTimeout: () => void
  scheduleHoverClose: () => void
  handleMenuClick: () => void
}) {
  return (
    <DropdownMenu
      modal={false}
      open={submenuMode === "hover" ? hoveredFlyout === item.title : undefined}
      onOpenChange={(nextOpen) => {
        if (submenuMode !== "hover") {
          return
        }

        clearCloseTimeout()
        setHoveredFlyout(nextOpen ? item.title : null)
      }}
    >
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          tooltip={shouldHideTooltip ? undefined : item.title}
          isActive={isActive}
          size="lg"
          className={parentButtonClass}
        >
          <item.icon className={parentIconClass} />
          <ItemLabel title={item.title} description={item.description} />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={12}
        className="min-w-64 rounded-2xl border border-border/70 p-2 shadow-xl"
        onMouseEnter={() => {
          if (submenuMode === "hover") {
            clearCloseTimeout()
            setHoveredFlyout(item.title)
          }
        }}
        onMouseLeave={() => {
          if (submenuMode === "hover") {
            scheduleHoverClose()
          }
        }}
      >
        <DropdownMenuLabel className="px-3 py-2">
          {item.title}
        </DropdownMenuLabel>
        {item.children?.map((child) => (
          <RouterLink key={child.title} to={child.path}>
            <DropdownMenuItem
              className={[
                "rounded-xl px-3 py-2.5 text-sm",
                currentPath === child.path
                  ? "bg-accent text-accent-foreground"
                  : "",
              ].join(" ")}
              onClick={handleMenuClick}
            >
              <child.icon />
              {child.title}
            </DropdownMenuItem>
          </RouterLink>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
