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
      <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25">
        DR
      </div>
      {variant !== "icon" ? (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            DRP
          </span>
          <span className="text-base font-semibold tracking-tight">
            Operations Console
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
