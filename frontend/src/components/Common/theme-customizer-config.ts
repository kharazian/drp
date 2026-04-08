import {
  LayoutDashboard,
  Monitor,
  Moon,
  MousePointerClick,
  PanelTop,
  SquareMousePointer,
  Sun,
} from "lucide-react"

import type {
  ColorPreset,
  ContainerMode,
  Density,
  DirectionMode,
  LayoutMode,
  SubmenuMode,
  Theme,
} from "@/components/theme-provider"

export const themeOptions: Array<{
  value: Theme
  label: string
  icon: typeof Sun
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export const colorOptions: Array<{
  value: ColorPreset
  label: string
  previewClassName: string
  accentClassName: string
}> = [
  {
    value: "emerald",
    label: "Emerald",
    previewClassName:
      "border-emerald-200/80 bg-[linear-gradient(180deg,rgba(244,253,247,1)_0%,rgba(234,250,239,1)_100%)]",
    accentClassName: "bg-emerald-500",
  },
  {
    value: "blue",
    label: "Blue",
    previewClassName:
      "border-blue-200/80 bg-[linear-gradient(180deg,rgba(243,248,255,1)_0%,rgba(233,242,255,1)_100%)]",
    accentClassName: "bg-blue-500",
  },
  {
    value: "violet",
    label: "Violet",
    previewClassName:
      "border-violet-200/80 bg-[linear-gradient(180deg,rgba(248,245,255,1)_0%,rgba(238,233,255,1)_100%)]",
    accentClassName: "bg-violet-500",
  },
  {
    value: "rose",
    label: "Rose",
    previewClassName:
      "border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,246,247,1)_0%,rgba(255,237,240,1)_100%)]",
    accentClassName: "bg-rose-500",
  },
  {
    value: "orange",
    label: "Orange",
    previewClassName:
      "border-orange-200/80 bg-[linear-gradient(180deg,rgba(255,249,241,1)_0%,rgba(255,240,222,1)_100%)]",
    accentClassName: "bg-orange-500",
  },
  {
    value: "slate",
    label: "Slate",
    previewClassName:
      "border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(239,244,249,1)_100%)]",
    accentClassName: "bg-slate-500",
  },
]

export const densityOptions: Array<{
  value: Density
  label: string
}> = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
]

export const layoutOptions: Array<{
  value: LayoutMode
  label: string
  icon: typeof LayoutDashboard
}> = [
  { value: "sidebar", label: "Sidebar", icon: LayoutDashboard },
  { value: "top-nav", label: "Top Nav", icon: PanelTop },
]

export const containerOptions: Array<{
  value: ContainerMode
  label: string
}> = [
  { value: "fluid", label: "Fluid" },
  { value: "boxed", label: "Boxed" },
]

export const directionOptions: Array<{
  value: DirectionMode
  label: string
}> = [
  { value: "ltr", label: "LTR" },
  { value: "rtl", label: "RTL" },
]

export const submenuOptions: Array<{
  value: SubmenuMode
  label: string
  icon: typeof MousePointerClick
}> = [
  { value: "click", label: "Click", icon: MousePointerClick },
  { value: "hover", label: "Hover", icon: SquareMousePointer },
]
