import type { LucideIcon } from "lucide-react"

export type Item = {
  section?: string
  icon: LucideIcon
  title: string
  description?: string
  path: string
  children?: Item[]
}

export interface SidebarItemContext {
  currentPath: string
  isMobile: boolean
  open: boolean
  submenuMode: "click" | "hover"
  hoveredFlyout: string | null
  setHoveredFlyout: (title: string | null) => void
  clearCloseTimeout: () => void
  scheduleHoverClose: () => void
  handleMenuClick: () => void
  toggleItem: (title: string) => void
  expandedItems: Record<string, boolean>
}
