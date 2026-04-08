import { Link as RouterLink, useRouterState } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { useTheme } from "@/components/theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export type Item = {
  section?: string
  icon: LucideIcon
  title: string
  description?: string
  path: string
  children?: Item[]
}

interface MainProps {
  items: Item[]
  showSectionDivider?: boolean
}

interface SidebarItemContext {
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

const menuItemShellClass =
  "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
const baseIconOnlyButtonClass =
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
const parentButtonClass = cn(
  "h-auto min-h-11 rounded-xl border border-transparent bg-sidebar-accent/25 px-3 py-2 text-sidebar-foreground/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
  baseIconOnlyButtonClass,
  "group-data-[collapsible=icon]:rounded-lg",
)
const leafButtonClass = cn(
  "h-auto min-h-10 rounded-lg px-3 py-2 text-sidebar-foreground/72 transition-all duration-200 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground",
  baseIconOnlyButtonClass,
)
const childButtonClass =
  "h-auto min-h-9 rounded-lg px-3 py-2 text-[13px] text-sidebar-foreground/68 transition-all duration-200 hover:translate-x-0.5 hover:bg-sidebar-accent/35 hover:text-sidebar-foreground"
const parentIconClass = "size-[18px] text-sidebar-foreground/70"
const leafIconClass = "size-[18px] text-sidebar-foreground/55"
const childIconClass = "size-4 text-sidebar-foreground/55"
const labelWrapClass =
  "flex min-w-0 flex-1 flex-col items-start group-data-[collapsible=icon]:hidden"

function ItemLabel({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className={labelWrapClass}>
      <span className="font-medium">{title}</span>
      {description ? (
        <span className="text-xs text-sidebar-foreground/65">
          {description}
        </span>
      ) : null}
    </div>
  )
}

function SidebarSection({
  section,
  sectionItems,
  index,
  showSectionDivider,
  context,
}: {
  section: string
  sectionItems: Item[]
  index: number
  showSectionDivider: boolean
  context: SidebarItemContext
}) {
  return (
    <SidebarGroup
      className={[
        "px-0",
        index > 0 && showSectionDivider
          ? "border-t border-sidebar-border/80 pt-3"
          : "",
        index > 0 ? "mt-3" : "",
      ].join(" ")}
    >
      <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/35">
        {section}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="mt-1 gap-1.5 group-data-[collapsible=icon]:items-center">
          {sectionItems.map((item) => (
            <SidebarItemRow key={item.title} item={item} context={context} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function SidebarItemRow({
  item,
  context,
}: {
  item: Item
  context: SidebarItemContext
}) {
  const {
    currentPath,
    isMobile,
    open,
    submenuMode,
    hoveredFlyout,
    setHoveredFlyout,
    clearCloseTimeout,
    scheduleHoverClose,
    handleMenuClick,
    toggleItem,
    expandedItems,
  } = context
  const hasChildren = Boolean(item.children?.length)
  const isChildActive =
    item.children?.some((child) => currentPath === child.path) ?? false
  const isActive = currentPath === item.path || isChildActive
  const isExpanded = expandedItems[item.title] || false
  const shouldHideTooltip = hasChildren && !open && !isMobile

  const enableHoverFlyout =
    submenuMode === "hover" && hasChildren && !open && !isMobile

  return (
    <SidebarMenuItem
      className={menuItemShellClass}
      onMouseEnter={() => {
        if (!enableHoverFlyout) {
          return
        }

        clearCloseTimeout()
        setHoveredFlyout(item.title)
      }}
      onMouseLeave={() => {
        if (!enableHoverFlyout) {
          return
        }

        scheduleHoverClose()
      }}
    >
      {hasChildren && !open && !isMobile ? (
        <SidebarFlyoutItem
          item={item}
          isActive={isActive}
          shouldHideTooltip={shouldHideTooltip}
          currentPath={currentPath}
          submenuMode={submenuMode}
          hoveredFlyout={hoveredFlyout}
          setHoveredFlyout={setHoveredFlyout}
          clearCloseTimeout={clearCloseTimeout}
          scheduleHoverClose={scheduleHoverClose}
          handleMenuClick={handleMenuClick}
        />
      ) : hasChildren ? (
        <SidebarParentItem
          item={item}
          isActive={isActive}
          isExpanded={isExpanded}
          shouldHideTooltip={shouldHideTooltip}
          currentPath={currentPath}
          open={open}
          isMobile={isMobile}
          toggleItem={toggleItem}
          handleMenuClick={handleMenuClick}
        />
      ) : (
        <SidebarLeafItem
          item={item}
          isActive={isActive}
          handleMenuClick={handleMenuClick}
        />
      )}
    </SidebarMenuItem>
  )
}

function SidebarLeafItem({
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

function SidebarParentItem({
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
            "ml-auto size-4 text-sidebar-foreground/65 transition-transform group-data-[collapsible=icon]:hidden",
            isExpanded ? "rotate-90" : "",
          ].join(" ")}
        />
      </SidebarMenuButton>
      <SidebarSubmenu
        item={item}
        isExpanded={isExpanded}
        currentPath={currentPath}
        handleMenuClick={handleMenuClick}
      />
    </>
  )
}

function SidebarSubmenu({
  item,
  isExpanded,
  currentPath,
  handleMenuClick,
}: {
  item: Item
  isExpanded: boolean
  currentPath: string
  handleMenuClick: () => void
}) {
  return (
    <div
      className={[
        "grid transition-all duration-300 ease-out group-data-[collapsible=icon]:hidden",
        isExpanded
          ? "mt-2 grid-rows-[1fr] opacity-100"
          : "grid-rows-[0fr] opacity-0",
      ].join(" ")}
    >
      <div className="overflow-hidden">
        <SidebarMenu className="submenu-shell gap-1 border-l border-sidebar-border/70 pl-3">
          {item.children?.map((child) => (
            <SidebarSubmenuItem
              key={child.title}
              item={child}
              isActive={currentPath === child.path}
              handleMenuClick={handleMenuClick}
            />
          ))}
        </SidebarMenu>
      </div>
    </div>
  )
}

function SidebarSubmenuItem({
  item,
  isActive,
  handleMenuClick,
}: {
  item: Item
  isActive: boolean
  handleMenuClick: () => void
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={isActive}
        asChild
        className={cn(
          childButtonClass,
          isActive
            ? "bg-sidebar-accent/55 text-sidebar-primary shadow-sm"
            : "bg-transparent",
        )}
      >
        <RouterLink to={item.path} onClick={handleMenuClick}>
          <item.icon className={childIconClass} />
          <span className="font-medium">{item.title}</span>
        </RouterLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarFlyoutItem({
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
          <SidebarFlyoutMenuItem
            key={child.title}
            item={child}
            isActive={currentPath === child.path}
            handleMenuClick={handleMenuClick}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SidebarFlyoutMenuItem({
  item,
  isActive,
  handleMenuClick,
}: {
  item: Item
  isActive: boolean
  handleMenuClick: () => void
}) {
  return (
    <RouterLink to={item.path}>
      <DropdownMenuItem
        className={[
          "rounded-xl px-3 py-2.5 text-sm",
          isActive ? "bg-accent text-accent-foreground" : "",
        ].join(" ")}
        onClick={handleMenuClick}
      >
        <item.icon />
        {item.title}
      </DropdownMenuItem>
    </RouterLink>
  )
}

export function Main({ items, showSectionDivider = false }: MainProps) {
  const { isMobile, open, setOpenMobile } = useSidebar()
  const { preferences } = useTheme()
  const router = useRouterState()
  const currentPath = router.location.pathname
  const closeTimeoutRef = useRef<number | null>(null)
  const groupedItems = items.reduce<Record<string, Item[]>>((acc, item) => {
    const section = item.section ?? "Workspace"
    acc[section] ??= []
    acc[section].push(item)
    return acc
  }, {})
  const defaultExpanded = useMemo(() => {
    return Object.fromEntries(
      items
        .filter(
          (item) =>
            item.children?.some((child) => currentPath === child.path) ?? false,
        )
        .map((item) => [item.title, true]),
    ) as Record<string, boolean>
  }, [items, currentPath])
  const [expandedItems, setExpandedItems] =
    useState<Record<string, boolean>>(defaultExpanded)
  const [hoveredFlyout, setHoveredFlyout] = useState<string | null>(null)

  useEffect(() => {
    setExpandedItems((current) => ({ ...defaultExpanded, ...current }))
  }, [defaultExpanded])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const scheduleHoverClose = () => {
    clearCloseTimeout()
    closeTimeoutRef.current = window.setTimeout(() => {
      setHoveredFlyout(null)
    }, 140)
  }

  const toggleItem = (title: string) => {
    setExpandedItems((current) => {
      const nextValue = !current[title]
      const resetState = Object.fromEntries(
        Object.keys(current).map((key) => [key, false]),
      ) as Record<string, boolean>

      return {
        ...resetState,
        ...defaultExpanded,
        [title]: nextValue,
      }
    })
  }

  const context: SidebarItemContext = {
    currentPath,
    isMobile,
    open,
    submenuMode: preferences.submenuMode,
    hoveredFlyout,
    setHoveredFlyout,
    clearCloseTimeout,
    scheduleHoverClose,
    handleMenuClick,
    toggleItem,
    expandedItems,
  }

  return (
    <>
      {Object.entries(groupedItems).map(([section, sectionItems], index) => (
        <SidebarSection
          key={section}
          section={section}
          sectionItems={sectionItems}
          index={index}
          showSectionDivider={showSectionDivider}
          context={context}
        />
      ))}
    </>
  )
}
