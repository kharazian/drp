import { cn } from "@/lib/utils"

export const menuItemShellClass =
  "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
const baseIconOnlyButtonClass =
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-[var(--density-sidebar-collapsed-button)] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"

export const parentButtonClass = cn(
  "h-auto min-h-[var(--density-sidebar-parent-min-h)] rounded-xl border border-sidebar-border/40 bg-sidebar-accent/14 px-3 py-2 text-sidebar-foreground/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,background-color,color,transform,box-shadow] duration-200 hover:border-sidebar-border/70 hover:bg-sidebar-accent/26 hover:text-sidebar-foreground",
  baseIconOnlyButtonClass,
  "group-data-[collapsible=icon]:rounded-lg",
)

export const leafButtonClass = cn(
  "h-auto min-h-[var(--density-sidebar-leaf-min-h)] rounded-lg border border-transparent px-3 py-2 text-sidebar-foreground/72 transition-all duration-200 hover:border-sidebar-border/55 hover:bg-sidebar-accent/26 hover:text-sidebar-foreground",
  baseIconOnlyButtonClass,
)

export const childButtonClass =
  "h-auto min-h-[var(--density-sidebar-child-min-h)] rounded-lg border border-transparent px-3 py-2 text-[13px] text-sidebar-foreground/68 transition-all duration-200 hover:translate-x-0.5 hover:border-sidebar-border/45 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground"
export const parentIconClass = "size-[18px] shrink-0 text-current opacity-80"
export const leafIconClass = "size-[18px] shrink-0 text-current opacity-70"
export const childIconClass = "size-4 shrink-0 text-current opacity-70"
export const labelWrapClass =
  "flex min-w-0 flex-1 flex-col items-start group-data-[collapsible=icon]:hidden"
