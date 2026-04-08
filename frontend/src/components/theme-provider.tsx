import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

export type Theme = "dark" | "light" | "system"
export type ColorPreset =
  | "emerald"
  | "blue"
  | "violet"
  | "rose"
  | "orange"
  | "slate"
export type Density = "compact" | "comfortable" | "spacious"
export type LayoutMode = "sidebar" | "top-nav"
export type ContainerMode = "fluid" | "boxed"
export type DirectionMode = "ltr" | "rtl"
export type SubmenuMode = "click" | "hover"

export type DashboardPreferences = {
  preset: ColorPreset
  density: Density
  layout: LayoutMode
  container: ContainerMode
  direction: DirectionMode
  submenuMode: SubmenuMode
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "dark" | "light"
  preferences: DashboardPreferences
  setTheme: (theme: Theme) => void
  updatePreference: <K extends keyof DashboardPreferences>(
    key: K,
    value: DashboardPreferences[K],
  ) => void
  resetPreferences: () => void
}

const isBrowser = () =>
  typeof window !== "undefined" && typeof document !== "undefined"

const THEME_VALUES = ["dark", "light", "system"] as const
const PRESET_VALUES = [
  "emerald",
  "blue",
  "violet",
  "rose",
  "orange",
  "slate",
] as const
const DENSITY_VALUES = ["compact", "comfortable", "spacious"] as const
const LAYOUT_VALUES = ["sidebar", "top-nav"] as const
const CONTAINER_VALUES = ["fluid", "boxed"] as const
const DIRECTION_VALUES = ["ltr", "rtl"] as const
const SUBMENU_VALUES = ["click", "hover"] as const

const DEFAULT_PREFERENCES: DashboardPreferences = {
  preset: "emerald",
  density: "comfortable",
  layout: "sidebar",
  container: "fluid",
  direction: "ltr",
  submenuMode: "click",
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
)

function isOneOf<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
): value is T {
  return typeof value === "string" && allowedValues.includes(value as T)
}

function safeGetStorageItem(key: string) {
  if (!isBrowser()) {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetStorageItem(key: string, value: string) {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore restricted storage environments and keep in-memory state working.
  }
}

function sanitizePreferences(
  value: Partial<DashboardPreferences> | null | undefined,
): DashboardPreferences {
  return {
    preset: isOneOf(value?.preset, PRESET_VALUES)
      ? value.preset
      : DEFAULT_PREFERENCES.preset,
    density: isOneOf(value?.density, DENSITY_VALUES)
      ? value.density
      : DEFAULT_PREFERENCES.density,
    layout: isOneOf(value?.layout, LAYOUT_VALUES)
      ? value.layout
      : DEFAULT_PREFERENCES.layout,
    container: isOneOf(value?.container, CONTAINER_VALUES)
      ? value.container
      : DEFAULT_PREFERENCES.container,
    direction: isOneOf(value?.direction, DIRECTION_VALUES)
      ? value.direction
      : DEFAULT_PREFERENCES.direction,
    submenuMode: isOneOf(value?.submenuMode, SUBMENU_VALUES)
      ? value.submenuMode
      : DEFAULT_PREFERENCES.submenuMode,
  }
}

function readStoredTheme(storageKey: string, defaultTheme: Theme) {
  const storedTheme = safeGetStorageItem(storageKey)
  return isOneOf(storedTheme, THEME_VALUES) ? storedTheme : defaultTheme
}

function getStoredPreferences(storageKey: string) {
  const stored = safeGetStorageItem(`${storageKey}-prefs`)

  if (!stored) {
    return DEFAULT_PREFERENCES
  }

  try {
    return sanitizePreferences(
      JSON.parse(stored) as Partial<DashboardPreferences>,
    )
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function resolveTheme(theme: Theme): "dark" | "light" {
  if (theme !== "system") {
    return theme
  }

  if (!isBrowser()) {
    return "light"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() =>
    readStoredTheme(storageKey, defaultTheme),
  )
  const [preferences, setPreferences] = useState<DashboardPreferences>(() =>
    getStoredPreferences(storageKey),
  )

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() =>
    resolveTheme(theme),
  )

  const updateTheme = useCallback((newTheme: Theme) => {
    if (!isBrowser()) {
      return
    }

    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (newTheme === "system") {
      const systemTheme = resolveTheme("system")

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(newTheme)
  }, [])

  const applyPreferences = useCallback(
    (nextPreferences: DashboardPreferences) => {
      if (!isBrowser()) {
        return
      }

      const root = window.document.documentElement

      root.dataset.preset = nextPreferences.preset
      root.dataset.density = nextPreferences.density
      root.dataset.layout = nextPreferences.layout
      root.dataset.container = nextPreferences.container
      root.dataset.submenuMode = nextPreferences.submenuMode
      root.dir = nextPreferences.direction
    },
    [],
  )

  useEffect(() => {
    updateTheme(theme)
    setResolvedTheme(resolveTheme(theme))

    if (!isBrowser()) {
      return
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      if (theme === "system") {
        updateTheme("system")
        setResolvedTheme(resolveTheme("system"))
      }
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, updateTheme])

  useEffect(() => {
    applyPreferences(preferences)
  }, [preferences, applyPreferences])

  const value = useMemo<ThemeProviderState>(
    () => ({
      theme,
      resolvedTheme,
      preferences,
      setTheme: (theme) => {
        safeSetStorageItem(storageKey, theme)
        setTheme(theme)
      },
      updatePreference: (key, value) => {
        setPreferences((current) => {
          const next = sanitizePreferences({ ...current, [key]: value })
          safeSetStorageItem(`${storageKey}-prefs`, JSON.stringify(next))
          return next
        })
      },
      resetPreferences: () => {
        safeSetStorageItem(
          `${storageKey}-prefs`,
          JSON.stringify(DEFAULT_PREFERENCES),
        )
        setPreferences(DEFAULT_PREFERENCES)
      },
    }),
    [preferences, resolvedTheme, storageKey, theme],
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
