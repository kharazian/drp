import { useRouterState } from "@tanstack/react-router"
import { useEffect, useMemo, useRef, useState } from "react"

import { useTheme } from "@/components/theme-provider"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { menuItemShellClass } from "./menu-styles"
import { SidebarFlyoutItem } from "./SidebarFlyoutItem"
import { SidebarLeafItem } from "./SidebarLeafItem"
import { SidebarParentItem } from "./SidebarParentItem"
import type { Item, SidebarItemContext, SidebarNavSection } from "./types"

interface MainProps {
  sections: SidebarNavSection[]
  showSectionDivider?: boolean
}

function SidebarSection({
  section,
  index,
  showSectionDivider,
  context,
}: {
  section: SidebarNavSection
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
        {section.key}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="mt-1 gap-1.5 group-data-[collapsible=icon]:items-center">
          {section.items.map((item) => (
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

export function Main({ sections, showSectionDivider = false }: MainProps) {
  const { isMobile, open, setOpenMobile } = useSidebar()
  const { preferences } = useTheme()
  const router = useRouterState()
  const currentPath = router.location.pathname
  const closeTimeoutRef = useRef<number | null>(null)
  const defaultExpanded = useMemo(() => {
    return Object.fromEntries(
      sections
        .flatMap((section) => section.items)
        .filter(
          (item) =>
            item.children?.some((child) => currentPath === child.path) ?? false,
        )
        .map((item) => [item.title, true]),
    )
  }, [sections, currentPath])
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
      {sections.map((section, index) => (
        <SidebarSection
          key={section.key}
          section={section}
          index={index}
          showSectionDivider={showSectionDivider}
          context={context}
        />
      ))}
    </>
  )
}
