import { Link as RouterLink } from "@tanstack/react-router"
import { Bell, LogOut, Settings } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useAuth from "@/hooks/useAuth"
import { getInitials } from "@/utils"

interface HeaderUserMenuProps {
  fullName?: string | null
  email?: string
}

export function HeaderUserMenu({ fullName, email }: HeaderUserMenuProps) {
  const { logout } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-card transition-colors hover:bg-accent"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-emerald-100 font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
              {getInitials(fullName || email || "User")}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="min-w-72 rounded-2xl p-0"
      >
        <DropdownMenuLabel className="px-4 py-4 font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-emerald-100 font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                {getInitials(fullName || email || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {fullName || "User"}
              </p>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <RouterLink to="/settings">
          <DropdownMenuItem className="px-4 py-3">
            <Settings className="size-4" />
            Settings
          </DropdownMenuItem>
        </RouterLink>
        <RouterLink to="/notifications">
          <DropdownMenuItem className="px-4 py-3">
            <Bell className="size-4" />
            Notifications
            <span className="ml-auto inline-flex size-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
              4
            </span>
          </DropdownMenuItem>
        </RouterLink>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="px-4 py-3" onClick={logout}>
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
