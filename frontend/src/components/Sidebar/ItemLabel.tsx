import { labelWrapClass } from "./menu-styles"

export function ItemLabel({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className={labelWrapClass}>
      <span className="font-medium">{title}</span>
      {description ? (
        <span className="text-xs text-sidebar-foreground/65">
          {description}
        </span>
      ) : null}
    </div>
  )
}
