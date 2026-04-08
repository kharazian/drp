import type { LucideIcon } from "lucide-react"

export const sidebarSectionOrder = [
  "Overview",
  "Workspace",
  "Commerce",
  "Finance",
  "Account",
  "System",
] as const

export type SidebarSectionKey = (typeof sidebarSectionOrder)[number]

export type SidebarChildItem = {
  icon: LucideIcon
  title: string
  description?: string
  path: string
}

export type Item = SidebarChildItem & {
  children?: SidebarChildItem[]
}

export type SidebarNavSection = {
  key: SidebarSectionKey
  items: Item[]
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
