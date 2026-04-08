import {
  Globe,
  LayoutDashboard,
  Monitor,
  Moon,
  Palette,
  PanelTop,
  Rows3,
  SlidersHorizontal,
  Sun,
} from "lucide-react"
import { type ComponentType, type SVGProps, useState } from "react"

import {
  type ColorPreset,
  type ContainerMode,
  type Density,
  type DirectionMode,
  type Language,
  type LayoutMode,
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
  swatch: string
}> = [
  { value: "emerald", label: "Emerald", swatch: "bg-emerald-500" },
  { value: "blue", label: "Blue", swatch: "bg-blue-500" },
  { value: "violet", label: "Violet", swatch: "bg-violet-500" },
  { value: "rose", label: "Rose", swatch: "bg-rose-500" },
  { value: "orange", label: "Orange", swatch: "bg-orange-500" },
  { value: "slate", label: "Slate", swatch: "bg-slate-500" },
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

const languageOptions: Array<{
  value: Language
  label: string
}> = [
  { value: "english", label: "English" },
  { value: "deutsch", label: "Deutsch" },
  { value: "francais", label: "Français" },
]

interface OptionCardProps {
  label: string
  active: boolean
  onClick: () => void
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  swatchClassName?: string
}

function OptionCard({
  label,
  active,
  onClick,
  icon: Icon,
  swatchClassName,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-center text-xs font-medium text-foreground transition-colors hover:border-primary/40",
        active && "border-primary bg-primary/6 text-primary shadow-sm",
      )}
    >
      {swatchClassName ? (
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
          className="rounded-full border-border/70 bg-card"
          aria-label="Open customizer"
        >
          <SlidersHorizontal className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[92vw] border-l border-border/70 p-0 sm:max-w-md"
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
            <p className="text-sm font-medium">Color</p>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  swatchClassName={option.swatch}
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
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">Language</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {languageOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  icon={Globe}
                  active={preferences.language === option.value}
                  onClick={() => updatePreference("language", option.value)}
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
