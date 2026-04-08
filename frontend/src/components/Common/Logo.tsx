import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const wordmark = (
    <div
      className={cn(
        "flex items-center gap-3 text-foreground",
        variant === "icon" && "justify-center",
        className,
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
        DR
      </div>
      {variant !== "icon" ? (
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
            DRP
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-sidebar-foreground/40">
            Operations
          </span>
        </div>
      ) : null}
    </div>
  )

  const content =
    variant === "responsive" ? (
      <>
        <div className="group-data-[collapsible=icon]:hidden">{wordmark}</div>
        <div className="hidden group-data-[collapsible=icon]:flex">
          <Logo variant="icon" asLink={false} />
        </div>
      </>
    ) : (
      wordmark
    )

  if (!asLink) {
    return content
  }

  return <Link to="/">{content}</Link>
}
