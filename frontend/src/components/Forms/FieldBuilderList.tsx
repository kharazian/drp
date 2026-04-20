import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { BuilderField } from "./schema"

function SortableFieldCard({
  field,
  index,
  isSelected,
  onSelect,
  onRemove,
}: {
  field: BuilderField
  index: number
  isSelected: boolean
  onSelect: (fieldKey: string) => void
  onRemove: (fieldKey: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-[24px] border bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--accent)_18%,white),transparent_34%),linear-gradient(180deg,color-mix(in_oklab,var(--card)_92%,white),color-mix(in_oklab,var(--card)_86%,transparent))] p-4 transition-all duration-200",
        isSelected
          ? "border-primary/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_9%,white),color-mix(in_oklab,var(--card)_88%,transparent))] shadow-[0_22px_44px_-30px_color-mix(in_oklab,var(--primary)_44%,transparent)]"
          : "border-border/60 hover:border-border hover:bg-[linear-gradient(180deg,color-mix(in_oklab,var(--accent)_32%,white),color-mix(in_oklab,var(--card)_86%,transparent))]",
        isDragging && "scale-[1.01] shadow-2xl ring-1 ring-primary/25",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
          onClick={() => onSelect(field.key)}
        >
          <div
            className="mt-0.5 rounded-full border border-border/55 bg-background/80 p-2 text-muted-foreground transition-colors group-hover:text-foreground"
            {...attributes}
            {...listeners}
            aria-label={`Drag ${field.label || `Field ${index + 1}`}`}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium tracking-tight">
                {field.label || `Field ${index + 1}`}
              </p>
              <Badge variant="outline" className="rounded-full uppercase">
                {field.kind}
              </Badge>
              {field.required ? <Badge variant="secondary" className="rounded-full">Required</Badge> : null}
              {isSelected ? <Badge className="rounded-full">Selected</Badge> : null}
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">{field.id}</p>
          </div>
        </button>

        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-xl bg-background/80 sm:w-auto"
          onClick={() => onRemove(field.key)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Badge variant="secondary" className="rounded-full px-3 py-1 font-normal">
          Span {field.span}
        </Badge>
        <Badge variant="secondary" className="rounded-full px-3 py-1 font-normal">
          Start {field.startColumn}
        </Badge>
        {field.helpText ? (
          <Badge variant="secondary" className="rounded-full px-3 py-1 font-normal">
            Help text
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
        {field.helpText ? (
          <p>
            Help text: <span className="text-foreground">{field.helpText}</span>
          </p>
        ) : null}
        {field.placeholder ? (
          <p>
            Placeholder: <span className="text-foreground">{field.placeholder}</span>
          </p>
        ) : null}
        {field.kind === "select" && field.optionsText ? (
          <p>
            Options: <span className="text-foreground">{field.optionsText}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function FieldBuilderList({
  fields,
  selectedKey,
  onSelect,
  onReorder,
  onRemove,
}: {
  fields: BuilderField[]
  selectedKey: string | null
  onSelect: (fieldKey: string) => void
  onReorder: (activeKey: string, overKey: string) => void
  onRemove: (fieldKey: string) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    onReorder(String(active.id), String(over.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((field) => field.key)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid gap-4">
          {fields.map((field, index) => (
            <SortableFieldCard
              key={field.key}
              field={field}
              index={index}
              isSelected={selectedKey === field.key}
              onSelect={onSelect}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
