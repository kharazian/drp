import { cn } from "@/lib/utils"

export const menuItemShellClass =
  "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
const baseIconOnlyButtonClass =
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"

export const parentButtonClass = cn(
  "h-auto min-h-11 rounded-xl border border-transparent bg-sidebar-accent/25 px-3 py-2 text-sidebar-foreground/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
  baseIconOnlyButtonClass,
  "group-data-[collapsible=icon]:rounded-lg",
)

export const leafButtonClass = cn(
  "h-auto min-h-10 rounded-lg px-3 py-2 text-sidebar-foreground/72 transition-all duration-200 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground",
  baseIconOnlyButtonClass,
)

export const childButtonClass =
  "h-auto min-h-9 rounded-lg px-3 py-2 text-[13px] text-sidebar-foreground/68 transition-all duration-200 hover:translate-x-0.5 hover:bg-sidebar-accent/35 hover:text-sidebar-foreground"
export const parentIconClass = "size-[18px] text-sidebar-foreground/70"
export const leafIconClass = "size-[18px] text-sidebar-foreground/55"
export const childIconClass = "size-4 text-sidebar-foreground/55"
export const labelWrapClass =
  "flex min-w-0 flex-1 flex-col items-start group-data-[collapsible=icon]:hidden"
