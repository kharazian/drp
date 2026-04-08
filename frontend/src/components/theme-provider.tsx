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

function readStoredTheme(storageKey: string, defaultTheme: Theme) {
  if (!isBrowser()) {
    return defaultTheme
  }

  const storedTheme = window.localStorage.getItem(storageKey)
  return storedTheme === "light" ||
    storedTheme === "dark" ||
    storedTheme === "system"
    ? storedTheme
    : defaultTheme
}

function getStoredPreferences(storageKey: string) {
  if (!isBrowser()) {
    return DEFAULT_PREFERENCES
  }

  const stored = window.localStorage.getItem(`${storageKey}-prefs`)

  if (!stored) {
    return DEFAULT_PREFERENCES
  }

  try {
    return {
      ...DEFAULT_PREFERENCES,
      ...(JSON.parse(stored) as Partial<DashboardPreferences>),
    }
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
        if (isBrowser()) {
          window.localStorage.setItem(storageKey, theme)
        }
        setTheme(theme)
      },
      updatePreference: (key, value) => {
        setPreferences((current) => {
          const next = { ...current, [key]: value }
          if (isBrowser()) {
            window.localStorage.setItem(
              `${storageKey}-prefs`,
              JSON.stringify(next),
            )
          }
          return next
        })
      },
      resetPreferences: () => {
        if (isBrowser()) {
          window.localStorage.setItem(
            `${storageKey}-prefs`,
            JSON.stringify(DEFAULT_PREFERENCES),
          )
        }
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
