import {
  LayoutDashboard,
  Monitor,
  Moon,
  MousePointerClick,
  Palette,
  PanelTop,
  Rows3,
  SlidersHorizontal,
  SquareMousePointer,
  Sun,
} from "lucide-react"
import { type ComponentType, type SVGProps, useState } from "react"

import {
  type ColorPreset,
  type ContainerMode,
  type Density,
  type DirectionMode,
  type LayoutMode,
  type SubmenuMode,
  type Theme,
  useTheme,
} from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const themeOptions: Array<{
  value: Theme
  label: string
  icon: typeof Sun
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

const colorOptions: Array<{
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

const densityOptions: Array<{
  value: Density
  label: string
}> = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
]

const layoutOptions: Array<{
  value: LayoutMode
  label: string
  icon: typeof LayoutDashboard
}> = [
  { value: "sidebar", label: "Sidebar", icon: LayoutDashboard },
  { value: "top-nav", label: "Top Nav", icon: PanelTop },
]

const containerOptions: Array<{
  value: ContainerMode
  label: string
}> = [
  { value: "fluid", label: "Fluid" },
  { value: "boxed", label: "Boxed" },
]

const directionOptions: Array<{
  value: DirectionMode
  label: string
}> = [
  { value: "ltr", label: "LTR" },
  { value: "rtl", label: "RTL" },
]

const submenuOptions: Array<{
  value: SubmenuMode
  label: string
  icon: typeof MousePointerClick
}> = [
  { value: "click", label: "Click", icon: MousePointerClick },
  { value: "hover", label: "Hover", icon: SquareMousePointer },
]

interface OptionCardProps {
  label: string
  active: boolean
  onClick: () => void
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  swatchClassName?: string
  previewClassName?: string
}

function OptionCard({
  label,
  active,
  onClick,
  icon: Icon,
  swatchClassName,
  previewClassName,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "motion-control flex min-h-14 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-center text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:shadow-[0_10px_24px_-18px_color-mix(in_oklab,var(--foreground)_22%,transparent)]",
        active && "border-primary bg-primary/6 text-primary shadow-sm",
      )}
    >
      {previewClassName ? (
        <span
          className={cn(
            "relative flex h-8 w-full items-stretch overflow-hidden rounded-lg border bg-background shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
            previewClassName,
          )}
        >
          <span className="w-2.5 border-r border-black/6 bg-black/6" />
          <span className="flex flex-1 items-center gap-1.5 px-2">
            <span
              className={cn(
                "size-2 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.7)]",
                swatchClassName,
              )}
            />
            <span className="h-1.5 w-8 rounded-full bg-black/12" />
            <span className="ml-auto h-4 w-4 rounded-md bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]" />
          </span>
        </span>
      ) : swatchClassName ? (
        <span
          className={cn(
            "inline-flex size-5 rounded-full ring-1 ring-black/6 ring-offset-2",
            swatchClassName,
          )}
        />
      ) : Icon ? (
        <Icon className="size-4" />
      ) : (
        <Rows3 className="size-4" />
      )}
      <span>{label}</span>
    </button>
  )
}

export function ThemeCustomizer() {
  const { theme, preferences, resetPreferences, setTheme, updatePreference } =
    useTheme()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="motion-control rounded-full border-border/70 bg-card"
          aria-label="Open customizer"
        >
          <SlidersHorizontal className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="motion-fade-rise w-[92vw] border-l border-border/70 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/70 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle>Customize</SheetTitle>
              <SheetDescription>
                Personalize your dashboard experience.
              </SheetDescription>
            </div>
            <Palette className="mt-0.5 size-4 text-muted-foreground" />
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section className="space-y-3">
            <p className="text-sm font-medium">Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  active={theme === option.value}
                  onClick={() => setTheme(option.value)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3 border-t border-border/70 pt-5">
            <p className="text-sm font-medium">Theme Preset</p>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  previewClassName={option.previewClassName}
                  swatchClassName={option.accentClassName}
                  active={preferences.preset === option.value}
                  onClick={() => updatePreference("preset", option.value)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3 border-t border-border/70 pt-5">
            <p className="text-sm font-medium">Density</p>
            <div className="grid grid-cols-3 gap-3">
              {densityOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  active={preferences.density === option.value}
                  onClick={() => updatePreference("density", option.value)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3 border-t border-border/70 pt-5">
            <p className="text-sm font-medium">Layout</p>
            <div className="grid grid-cols-2 gap-3">
              {layoutOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  active={preferences.layout === option.value}
                  onClick={() => updatePreference("layout", option.value)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3 border-t border-border/70 pt-5">
            <p className="text-sm font-medium">Container</p>
            <div className="grid grid-cols-2 gap-3">
              {containerOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  active={preferences.container === option.value}
                  onClick={() => updatePreference("container", option.value)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3 border-t border-border/70 pt-5">
            <p className="text-sm font-medium">Direction</p>
            <div className="grid grid-cols-2 gap-3">
              {directionOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  active={preferences.direction === option.value}
                  onClick={() => updatePreference("direction", option.value)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3 border-t border-border/70 pt-5">
            <p className="text-sm font-medium">Menu Opening</p>
            <div className="grid grid-cols-2 gap-3">
              {submenuOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  active={preferences.submenuMode === option.value}
                  onClick={() => updatePreference("submenuMode", option.value)}
                />
              ))}
            </div>
          </section>
        </div>

        <SheetFooter className="border-t border-border/70 px-6 py-5">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setTheme("system")
              resetPreferences()
            }}
          >
            Reset to Defaults
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
