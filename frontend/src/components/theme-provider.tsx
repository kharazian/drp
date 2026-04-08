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
export type Language = "english" | "deutsch" | "francais"
export type SubmenuMode = "click" | "hover"

export type DashboardPreferences = {
  preset: ColorPreset
  density: Density
  layout: LayoutMode
  container: ContainerMode
  direction: DirectionMode
  language: Language
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

const DEFAULT_PREFERENCES: DashboardPreferences = {
  preset: "emerald",
  density: "comfortable",
  layout: "sidebar",
  container: "fluid",
  direction: "ltr",
  language: "english",
  submenuMode: "click",
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  preferences: DEFAULT_PREFERENCES,
  setTheme: () => null,
  updatePreference: () => null,
  resetPreferences: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function getStoredPreferences(storageKey: string) {
  const stored = localStorage.getItem(`${storageKey}-prefs`)

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

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  )
  const [preferences, setPreferences] = useState<DashboardPreferences>(() =>
    getStoredPreferences(storageKey),
  )

  const getResolvedTheme = useCallback((theme: Theme): "dark" | "light" => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }

    return theme
  }, [])

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() =>
    getResolvedTheme(theme),
  )

  const updateTheme = useCallback((newTheme: Theme) => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(newTheme)
  }, [])

  const applyPreferences = useCallback(
    (nextPreferences: DashboardPreferences) => {
      const root = window.document.documentElement

      root.dataset.preset = nextPreferences.preset
      root.dataset.density = nextPreferences.density
      root.dataset.layout = nextPreferences.layout
      root.dataset.container = nextPreferences.container
      root.dataset.language = nextPreferences.language
      root.dataset.submenuMode = nextPreferences.submenuMode
      root.dir = nextPreferences.direction
    },
    [],
  )

  useEffect(() => {
    updateTheme(theme)
    setResolvedTheme(getResolvedTheme(theme))

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      if (theme === "system") {
        updateTheme("system")
        setResolvedTheme(getResolvedTheme("system"))
      }
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, updateTheme, getResolvedTheme])

  useEffect(() => {
    applyPreferences(preferences)
  }, [preferences, applyPreferences])

  const value = useMemo<ThemeProviderState>(
    () => ({
      theme,
      resolvedTheme,
      preferences,
      setTheme: (theme) => {
        localStorage.setItem(storageKey, theme)
        setTheme(theme)
      },
      updatePreference: (key, value) => {
        setPreferences((current) => {
          const next = { ...current, [key]: value }
          localStorage.setItem(`${storageKey}-prefs`, JSON.stringify(next))
          return next
        })
      },
      resetPreferences: () => {
        localStorage.setItem(
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
