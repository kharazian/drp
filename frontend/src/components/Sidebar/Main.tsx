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
}

export function Main({ items }: MainProps) {
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
    setExpandedItems((current) => ({
      ...current,
      [title]: !current[title],
    }))
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
                const hasChildren = Boolean(item.children?.length)
                const isChildActive =
                  item.children?.some((child) => currentPath === child.path) ??
                  false
                const isActive = currentPath === item.path || isChildActive
                const isExpanded = expandedItems[item.title] || false
                const shouldHideTooltip = hasChildren && !open && !isMobile

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                    onMouseEnter={() => {
                      if (
                        preferences.submenuMode === "hover" &&
                        hasChildren &&
                        !open &&
                        !isMobile
                      ) {
                        clearCloseTimeout()
                        setHoveredFlyout(item.title)
                      }
                    }}
                    onMouseLeave={() => {
                      if (
                        preferences.submenuMode === "hover" &&
                        hasChildren &&
                        !open &&
                        !isMobile
                      ) {
                        scheduleHoverClose()
                      }
                    }}
                  >
                    {hasChildren && !open && !isMobile ? (
                      <DropdownMenu
                        modal={false}
                        open={
                          preferences.submenuMode === "hover"
                            ? hoveredFlyout === item.title
                            : undefined
                        }
                        onOpenChange={(nextOpen) => {
                          if (preferences.submenuMode !== "hover") {
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
                            className="h-auto min-h-12 px-3 py-3 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                          >
                            <item.icon />
                            <div className="flex min-w-0 flex-1 flex-col items-start group-data-[collapsible=icon]:hidden">
                              <span>{item.title}</span>
                              {item.description ? (
                                <span className="text-xs text-sidebar-foreground/65">
                                  {item.description}
                                </span>
                              ) : null}
                            </div>
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side="right"
                          align="start"
                          sideOffset={12}
                          className="min-w-64 rounded-2xl p-2"
                          onMouseEnter={() => {
                            if (preferences.submenuMode === "hover") {
                              clearCloseTimeout()
                              setHoveredFlyout(item.title)
                            }
                          }}
                          onMouseLeave={() => {
                            if (preferences.submenuMode === "hover") {
                              scheduleHoverClose()
                            }
                          }}
                        >
                          <DropdownMenuLabel className="px-3 py-2">
                            {item.title}
                          </DropdownMenuLabel>
                          {item.children?.map((child) => {
                            const isChildRouteActive =
                              currentPath === child.path

                            return (
                              <RouterLink key={child.title} to={child.path}>
                                <DropdownMenuItem
                                  className={[
                                    "rounded-xl px-3 py-2.5",
                                    isChildRouteActive
                                      ? "bg-accent text-accent-foreground"
                                      : "",
                                  ].join(" ")}
                                  onClick={handleMenuClick}
                                >
                                  <child.icon />
                                  {child.title}
                                </DropdownMenuItem>
                              </RouterLink>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : hasChildren ? (
                      <>
                        <SidebarMenuButton
                          tooltip={shouldHideTooltip ? undefined : item.title}
                          isActive={isActive}
                          size="lg"
                          className="h-auto min-h-12 px-3 py-3 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                          onClick={() => {
                            if (!open && !isMobile) {
                              return
                            }
                            toggleItem(item.title)
                          }}
                        >
                          <item.icon />
                          <div className="flex min-w-0 flex-1 flex-col items-start group-data-[collapsible=icon]:hidden">
                            <span>{item.title}</span>
                            {item.description ? (
                              <span className="text-xs text-sidebar-foreground/65">
                                {item.description}
                              </span>
                            ) : null}
                          </div>
                          <ChevronRight
                            className={[
                              "ml-auto size-4 text-sidebar-foreground/65 transition-transform group-data-[collapsible=icon]:hidden",
                              isExpanded ? "rotate-90" : "",
                            ].join(" ")}
                          />
                        </SidebarMenuButton>
                        {open && isExpanded ? (
                          <SidebarMenu className="mt-2 gap-1 border-l border-sidebar-border/70 pl-3 group-data-[collapsible=icon]:hidden">
                            {item.children?.map((child) => {
                              const isChildRouteActive =
                                currentPath === child.path

                              return (
                                <SidebarMenuItem key={child.title}>
                                  <SidebarMenuButton
                                    tooltip={child.title}
                                    isActive={isChildRouteActive}
                                    asChild
                                    className="h-auto min-h-10 px-3 py-2"
                                  >
                                    <RouterLink
                                      to={child.path}
                                      onClick={handleMenuClick}
                                    >
                                      <child.icon />
                                      <span>{child.title}</span>
                                    </RouterLink>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              )
                            })}
                          </SidebarMenu>
                        ) : null}
                      </>
                    ) : (
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
                    )}
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
