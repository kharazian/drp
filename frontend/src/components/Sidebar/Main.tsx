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
  showSectionDivider?: boolean
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

  return (
    <>
      {Object.entries(groupedItems).map(([section, sectionItems], index) => (
        <SidebarGroup
          key={section}
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
                            className="h-auto min-h-11 rounded-xl border border-transparent bg-sidebar-accent/25 px-3 py-2 text-sidebar-foreground/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0"
                          >
                            <item.icon className="size-[18px] text-sidebar-foreground/70" />
                            <div className="flex min-w-0 flex-1 flex-col items-start group-data-[collapsible=icon]:hidden">
                              <span className="font-medium">{item.title}</span>
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
                          className="min-w-64 rounded-2xl border border-border/70 p-2 shadow-xl"
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
                                    "rounded-xl px-3 py-2.5 text-sm",
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
                          className="h-auto min-h-11 rounded-xl border border-transparent bg-sidebar-accent/25 px-3 py-2 text-sidebar-foreground/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0"
                          onClick={() => {
                            if (!open && !isMobile) {
                              return
                            }
                            toggleItem(item.title)
                          }}
                        >
                          <item.icon className="size-[18px] text-sidebar-foreground/70" />
                          <div className="flex min-w-0 flex-1 flex-col items-start group-data-[collapsible=icon]:hidden">
                            <span className="font-medium">{item.title}</span>
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
                              {item.children?.map((child) => {
                                const isChildRouteActive =
                                  currentPath === child.path

                                return (
                                  <SidebarMenuItem key={child.title}>
                                    <SidebarMenuButton
                                      tooltip={child.title}
                                      isActive={isChildRouteActive}
                                      asChild
                                      className={[
                                        "h-auto min-h-9 rounded-lg px-3 py-2 text-[13px] text-sidebar-foreground/68 transition-all duration-200",
                                        "hover:translate-x-0.5 hover:bg-sidebar-accent/35 hover:text-sidebar-foreground",
                                        isChildRouteActive
                                          ? "bg-sidebar-accent/55 text-sidebar-primary shadow-sm"
                                          : "bg-transparent",
                                      ].join(" ")}
                                    >
                                      <RouterLink
                                        to={child.path}
                                        onClick={handleMenuClick}
                                      >
                                        <child.icon className="size-4 text-sidebar-foreground/55" />
                                        <span className="font-medium">
                                          {child.title}
                                        </span>
                                      </RouterLink>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                )
                              })}
                            </SidebarMenu>
                          </div>
                        </div>
                      </>
                    ) : (
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        asChild
                        size="lg"
                        className="h-auto min-h-10 rounded-lg px-3 py-2 text-sidebar-foreground/72 transition-all duration-200 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                      >
                        <RouterLink to={item.path} onClick={handleMenuClick}>
                          <item.icon className="size-[18px] text-sidebar-foreground/55" />
                          <div className="flex min-w-0 flex-col items-start group-data-[collapsible=icon]:hidden">
                            <span className="font-medium">{item.title}</span>
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
