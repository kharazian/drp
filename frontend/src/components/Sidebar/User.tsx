import { Link as RouterLink } from "@tanstack/react-router"
import { LogOut } from "lucide-react"

import type { UserPublic } from "@/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSidebar } from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { getInitials } from "@/utils"

interface UserInfoProps {
  fullName?: string
  email?: string
  roleLabel?: string
}

function UserInfo({ fullName, email, roleLabel }: UserInfoProps) {
  return (
    <div className="flex w-full min-w-0 items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
      <Avatar className="size-[var(--density-sidebar-user-avatar)]">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials(fullName || "User")}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col items-start group-data-[collapsible=icon]:hidden">
        <p className="w-full truncate text-sm font-semibold text-sidebar-foreground">
          {fullName}
        </p>
        <p className="w-full truncate text-xs text-sidebar-foreground/65">
          {roleLabel ?? email}
        </p>
      </div>
    </div>
  )
}

export function User({ user }: { user?: UserPublic | null }) {
  const { logout } = useAuth()
  const { setOpenMobile } = useSidebar()

  const handleMenuClick = () => {
    setOpenMobile(false)
  }
  const handleLogout = async () => {
    logout()
  }
  const fullName = user?.full_name ?? "Account"
  const email = user?.email ?? undefined
  const roleLabel = user ? (user.is_superuser ? "Admin" : "Member") : "Profile"

  return (
    <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
      <RouterLink
        to="/profile"
        onClick={handleMenuClick}
        data-testid="user-menu"
        className="flex min-w-0 flex-1 items-center rounded-lg px-1.5 py-1.5 text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden"
      >
        <UserInfo fullName={fullName} email={email} roleLabel={roleLabel} />
      </RouterLink>
      <button
        type="button"
        className="flex size-[var(--density-sidebar-user-logout)] items-center justify-center rounded-md text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent/45 hover:text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden"
        onClick={handleLogout}
      >
        <LogOut className="size-4" />
        <span className="sr-only">Log out</span>
      </button>
      <button
        type="button"
        className="hidden size-[var(--density-sidebar-collapsed-button)] items-center justify-center rounded-lg text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/45 hover:text-sidebar-foreground group-data-[collapsible=icon]:flex"
        onClick={handleLogout}
      >
        <LogOut className="size-4" />
        <span className="sr-only">Log out</span>
      </button>
    </div>
  )
}
