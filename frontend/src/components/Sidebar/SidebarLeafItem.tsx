import { Link as RouterLink } from "@tanstack/react-router"

import { SidebarMenuButton } from "@/components/ui/sidebar"
import { ItemLabel } from "./ItemLabel"
import { leafButtonClass, leafIconClass } from "./menu-styles"
import type { Item } from "./types"

export function SidebarLeafItem({
  item,
  isActive,
  handleMenuClick,
}: {
  item: Item
  isActive: boolean
  handleMenuClick: () => void
}) {
  return (
    <SidebarMenuButton
      tooltip={item.title}
      isActive={isActive}
      asChild
      size="lg"
      className={leafButtonClass}
    >
      <RouterLink to={item.path} onClick={handleMenuClick}>
        <item.icon className={leafIconClass} />
        <ItemLabel title={item.title} description={item.description} />
      </RouterLink>
    </SidebarMenuButton>
  )
}
