import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  rectSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  CalendarDays,
  CheckSquare,
  CircleDot,
  Copy,
  LayoutPanelTop,
  ListChecks,
  Mail,
  Monitor,
  Rows3,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Type,
  WholeWord,
} from "lucide-react"
import {
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { RuntimeFormRenderer } from "./RuntimeFormRenderer"
import {
  type BuilderField,
  builderFieldsFromDesigner,
  createEmptyField,
  type DesignerDocument,
} from "./schema"

type DesignerSelection =
  | { type: "form" }
  | { type: "section"; sectionId: string }
  | { type: "field"; sectionId: string; fieldKey: string }

type RailTab = "elements" | "structure" | "properties"
type PreviewDevice = "mobile" | "tablet" | "desktop"
const DESKTOP_GRID_COLUMNS = 12
const TABLET_GRID_COLUMNS = 6

type PaletteField = {
  kind: BuilderField["kind"]
  label: string
  description: string
  icon: typeof Type
}

const paletteFields: PaletteField[] = [
  {
    kind: "text",
    label: "Text",
    description: "Single-line answers and short labels",
    icon: Type,
  },
  {
    kind: "textarea",
    label: "Textarea",
    description: "Long-form notes, requests, and details",
    icon: Rows3,
  },
  {
    kind: "email",
    label: "Email",
    description: "Validated addresses for people and teams",
    icon: Mail,
  },
  {
    kind: "number",
    label: "Number",
    description: "Counts, amounts, and numeric limits",
    icon: WholeWord,
  },
  {
    kind: "date",
    label: "Date",
    description: "Schedule requests and due dates",
    icon: CalendarDays,
  },
  {
    kind: "select",
    label: "Select",
    description: "Compact dropdown choices",
    icon: ListChecks,
  },
  {
    kind: "radio",
    label: "Radio",
    description: "Visible choice groups with quick scanning",
    icon: CircleDot,
  },
  {
    kind: "checkbox",
    label: "Checkbox",
    description: "Binary acknowledgements and toggles",
    icon: CheckSquare,
  },
]

const paletteFieldByKind = new Map(
  paletteFields.map((item) => [item.kind, item] as const),
)

const deviceOptions: Array<{
  value: PreviewDevice
  label: string
  icon: typeof Monitor
}> = [
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "desktop", label: "Desktop", icon: Monitor },
]

function getDeviceCanvasClass(device: PreviewDevice) {
  switch (device) {
    case "mobile":
      return "max-w-sm"
    case "tablet":
      return "max-w-2xl"
    case "desktop":
      return "max-w-6xl"
  }
}

function getEffectivePreviewColumns(
  _columns: DesignerDocument["sections"][number]["columns"],
  device: PreviewDevice,
) {
  if (device === "mobile") {
    return 1
  }

  if (device === "tablet") {
    return TABLET_GRID_COLUMNS
  }

  return DESKTOP_GRID_COLUMNS
}

function getDesignerFieldSpan(
  span: BuilderField["span"],
  sectionColumns: DesignerDocument["sections"][number]["columns"],
  device: PreviewDevice,
) {
  const columns = getEffectivePreviewColumns(sectionColumns, device)
  return Math.max(1, Math.min(columns, span))
}

function getDesignerFieldStartColumn(
  field: BuilderField,
  sectionColumns: DesignerDocument["sections"][number]["columns"],
  device: PreviewDevice,
) {
  const columns = getEffectivePreviewColumns(sectionColumns, device)
  const span = getDesignerFieldSpan(field.span, sectionColumns, device)
  const maxStart = Math.max(1, columns - span + 1)

  return Math.min(Math.max(1, field.startColumn), maxStart)
}

function getDesignerSectionGridStyle(
  columns: DesignerDocument["sections"][number]["columns"],
  device: PreviewDevice,
): CSSProperties {
  const effectiveColumns = getEffectivePreviewColumns(columns, device)

  return {
    gridTemplateColumns: `repeat(${effectiveColumns}, minmax(0, 1fr))`,
    backgroundImage:
      "linear-gradient(to right, color-mix(in oklab, var(--border) 40%, transparent) 1px, transparent 1px)",
    backgroundSize: `calc(100% / ${effectiveColumns}) 100%`,
  }
}

function buildSectionLayoutPlan(
  fields: BuilderField[],
  sectionColumns: DesignerDocument["sections"][number]["columns"],
  device: PreviewDevice,
) {
  const columns = getEffectivePreviewColumns(sectionColumns, device)
  let currentRow = 1
  let nextColumn = 1

  return fields.map((field, index) => {
    const span = getDesignerFieldSpan(field.span, sectionColumns, device)
    let start = getDesignerFieldStartColumn(field, sectionColumns, device)

    if (start < nextColumn || start + span - 1 > columns) {
      currentRow += 1
      nextColumn = 1
      start = getDesignerFieldStartColumn(field, sectionColumns, device)
    }

    if (start < nextColumn) {
      currentRow += 1
      nextColumn = 1
      start = getDesignerFieldStartColumn(field, sectionColumns, device)
    }

    const row = currentRow
    nextColumn = start + span
    if (nextColumn > columns) {
      currentRow += 1
      nextColumn = 1
    }

    return {
      field,
      index,
      row,
      span,
      start,
    }
  })
}

function resolveDropIndexFromSlot(
  plan: ReturnType<typeof buildSectionLayoutPlan>,
  row: number,
  column: number,
) {
  const target = plan.find(
    (entry) =>
      entry.row > row || (entry.row === row && entry.start >= column),
  )

  return target ? target.index : plan.length
}

function getFieldStyleClass(field: BuilderField) {
  switch (field.stylePreset) {
    case "rounded":
      return "rounded-[22px]"
    case "shadow":
      return "shadow-[0_18px_36px_-30px_color-mix(in_oklab,var(--foreground)_28%,transparent)]"
    case "accent":
      return "border-primary/45 bg-primary/5"
    case "plain":
      return ""
  }
}

function paletteDragId(kind: BuilderField["kind"]) {
  return `palette:${kind}`
}

function sectionDragId(sectionId: string) {
  return `section:${sectionId}`
}

function fieldDragId(fieldKey: string) {
  return `field:${fieldKey}`
}

function slotDragId(sectionId: string, row: number, column: number) {
  return `slot:${sectionId}:${row}:${column}`
}

function parseDragId(
  id: string,
):
  | { type: "palette" | "section" | "field"; value: string }
  | { type: "slot"; sectionId: string; row: number; column: number }
  | null {
  if (id.startsWith("palette:")) {
    return { type: "palette", value: id.slice("palette:".length) }
  }
  if (id.startsWith("section:")) {
    return { type: "section", value: id.slice("section:".length) }
  }
  if (id.startsWith("field:")) {
    return { type: "field", value: id.slice("field:".length) }
  }
  if (id.startsWith("slot:")) {
    const [, sectionId, row, column] = id.split(":")
    if (!sectionId || !row || !column) {
      return null
    }
    return {
      type: "slot",
      sectionId,
      row: Number(row),
      column: Number(column),
    }
  }
  return null
}

function createFieldTemplate(
  kind: BuilderField["kind"],
  fieldIndex: number,
  existingIds: string[],
): BuilderField {
  const base = createEmptyField(fieldIndex, { existingIds })

  switch (kind) {
    case "text":
      return {
        ...base,
        kind,
        label: "Text Field",
        placeholder: "Enter text",
        span: 6 as BuilderField["span"],
      }
    case "textarea":
      return {
        ...base,
        kind,
        label: "Long Text",
        placeholder: "Enter details",
        span: 12 as BuilderField["span"],
      }
    case "email":
      return {
        ...base,
        kind,
        label: "Email",
        placeholder: "name@company.com",
        span: 6 as BuilderField["span"],
      }
    case "number":
      return {
        ...base,
        kind,
        label: "Number",
        placeholder: "0",
        span: 6 as BuilderField["span"],
      }
    case "date":
      return {
        ...base,
        kind,
        label: "Date",
        span: 6 as BuilderField["span"],
      }
    case "select":
      return {
        ...base,
        kind,
        label: "Select",
        placeholder: "Choose an option",
        optionsText: "Option A, Option B, Option C",
        span: 6 as BuilderField["span"],
      }
    case "radio":
      return {
        ...base,
        kind,
        label: "Radio Group",
        optionsText: "Option A, Option B, Option C",
        span: 12 as BuilderField["span"],
      }
    case "checkbox":
      return {
        ...base,
        kind,
        label: "Checkbox",
        placeholder: "I agree",
        span: 12 as BuilderField["span"],
      }
  }
}

function PaletteButton({ item }: { item: PaletteField }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: paletteDragId(item.kind),
    })
  const Icon = item.icon

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_96%,white),color-mix(in_oklab,var(--muted)_14%,transparent))] px-3 py-3 text-left transition-all",
        isDragging
          ? "border-primary/60 bg-primary/5 shadow-md"
          : "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_16px_34px_-28px_color-mix(in_oklab,var(--foreground)_40%,transparent)]",
      )}
      {...listeners}
      {...attributes}
    >
      <div className="rounded-xl border border-border/60 bg-background/90 p-2 text-primary shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_75%,transparent)]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-medium">
            {item.label}
          </span>
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:border-primary/35 group-hover:text-primary">
            Drag
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {item.description}
        </p>
      </div>
    </button>
  )
}

function SortableSection({
  id,
  children,
}: {
  id: string
  children: (dragHandle: {
    attributes: ReturnType<typeof useSortable>["attributes"]
    listeners: ReturnType<typeof useSortable>["listeners"]
    isDragging: boolean
  }) => ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && "z-10")}
    >
      {children({ attributes, listeners, isDragging })}
    </div>
  )
}

function SortableField({
  id,
  className,
  style,
  children,
}: {
  id: string
  className?: string
  style?: CSSProperties
  children: (dragHandle: {
    attributes: ReturnType<typeof useSortable>["attributes"]
    listeners: ReturnType<typeof useSortable>["listeners"]
    isDragging: boolean
  }) => ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(className, isDragging && "z-10")}
    >
      {children({ attributes, listeners, isDragging })}
    </div>
  )
}

function DropSlot({
  id,
  style,
}: {
  id: string
  style: CSSProperties
}) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "min-h-16 rounded-xl border border-dashed border-transparent transition-all",
        isOver &&
          "border-primary/55 bg-primary/8 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_26%,transparent)]",
      )}
    />
  )
}

export function FormDesigner({
  document,
  setDocument,
  selectedFieldKey,
  setSelectedFieldKey,
}: {
  document: DesignerDocument
  setDocument: Dispatch<SetStateAction<DesignerDocument>>
  selectedFieldKey: string | null
  setSelectedFieldKey: (value: string | null) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const [selection, setSelection] = useState<DesignerSelection>({
    type: "form",
  })
  const [railTab, setRailTab] = useState<RailTab>("elements")
  const [mode, setMode] = useState<"design" | "preview">("design")
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop")

  const sections = document.sections
  const allFields = useMemo(
    () => builderFieldsFromDesigner(document),
    [document],
  )
  const selectedSection =
    selection.type === "section" || selection.type === "field"
      ? (sections.find((section) => section.id === selection.sectionId) ?? null)
      : null
  const selectedField =
    selection.type === "field"
      ? (selectedSection?.fields.find(
          (field) => field.key === selection.fieldKey,
        ) ?? null)
      : null
  useEffect(() => {
    if (!sections.length) {
      setSelection({ type: "form" })
      setSelectedFieldKey(null)
      return
    }

    if (selection.type === "section") {
      if (!sections.some((section) => section.id === selection.sectionId)) {
        setSelection({ type: "form" })
      }
      return
    }

    if (selection.type === "field") {
      const fieldStillExists = sections.some((section) =>
        section.fields.some((field) => field.key === selection.fieldKey),
      )
      if (!fieldStillExists) {
        setSelection({ type: "form" })
        setSelectedFieldKey(null)
      }
    }
  }, [sections, selection, setSelectedFieldKey])

  const updateDocument = (
    updater: (current: DesignerDocument) => DesignerDocument,
  ) => {
    setDocument((current) => updater(current))
  }

  const updateSelectedSection = (
    updater: (
      section: DesignerDocument["sections"][number],
    ) => DesignerDocument["sections"][number],
  ) => {
    if (!(selection.type === "section" || selection.type === "field")) {
      return
    }

    updateDocument((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === selection.sectionId ? updater(section) : section,
      ),
    }))
  }

  const updateSelectedField = (
    updater: (field: BuilderField) => BuilderField,
  ) => {
    if (selection.type !== "field") {
      return
    }

    updateDocument((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id !== selection.sectionId
          ? section
          : {
              ...section,
              fields: section.fields.map((field) =>
                field.key === selection.fieldKey ? updater(field) : field,
              ),
            },
      ),
    }))
  }

  const selectForm = () => {
    setSelection({ type: "form" })
    setSelectedFieldKey(null)
    setRailTab("properties")
  }

  const selectSection = (sectionId: string) => {
    setSelection({ type: "section", sectionId })
    setSelectedFieldKey(null)
    setRailTab("properties")
  }

  const selectField = (sectionId: string, fieldKey: string) => {
    setSelection({ type: "field", sectionId, fieldKey })
    setSelectedFieldKey(fieldKey)
    setRailTab("properties")
  }

  const findFieldLocation = (fieldKey: string) => {
    for (const section of sections) {
      const index = section.fields.findIndex((field) => field.key === fieldKey)
      if (index >= 0) {
        return { sectionId: section.id, index }
      }
    }
    return null
  }

  const createFieldOfKind = (
    kind: BuilderField["kind"],
    current: DesignerDocument,
  ) => {
    const currentFields = builderFieldsFromDesigner(current)
    return createFieldTemplate(
      kind,
      currentFields.length,
      currentFields.map((field) => field.id),
    )
  }

  const appendFieldToSection = (
    sectionId: string,
    kind: BuilderField["kind"] = "text",
  ) => {
    updateDocument((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }
        const nextField = createFieldOfKind(kind, current)
        setSelection({ type: "field", sectionId, fieldKey: nextField.key })
        setSelectedFieldKey(nextField.key)
        setRailTab("properties")
        return { ...section, fields: [...section.fields, nextField] }
      }),
    }))
  }

  const insertFieldIntoSection = (
    sectionId: string,
    index: number,
    kind: BuilderField["kind"] = "text",
    startColumn = 1,
  ) => {
    updateDocument((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }
        const nextField: BuilderField = {
          ...createFieldOfKind(kind, current),
          startColumn: Math.min(
            Math.max(1, startColumn),
            Math.max(1, section.columns),
          ) as BuilderField["startColumn"],
        }
        const nextFields = [...section.fields]
        nextFields.splice(index, 0, nextField)
        setSelection({ type: "field", sectionId, fieldKey: nextField.key })
        setSelectedFieldKey(nextField.key)
        setRailTab("properties")
        return { ...section, fields: nextFields }
      }),
    }))
  }

  const moveFieldToSection = (fieldKey: string, targetSectionId: string) => {
    updateDocument((current) => {
      let movingField: BuilderField | null = null
      const strippedSections = current.sections.map((section) => {
        const found = section.fields.find((field) => field.key === fieldKey)
        if (!found) {
          return section
        }
        movingField = found
        return {
          ...section,
          fields: section.fields.filter((field) => field.key !== fieldKey),
        }
      })

      if (!movingField) {
        return current
      }

      return {
        ...current,
        sections: strippedSections.map((section) =>
          section.id === targetSectionId
            ? {
                ...section,
                fields: [...section.fields, movingField as BuilderField],
              }
            : section,
        ),
      }
    })
  }

  const moveFieldToSlot = (
    fieldKey: string,
    targetSectionId: string,
    index: number,
    startColumn: number,
  ) => {
    updateDocument((current) => {
      let movingField: BuilderField | null = null
      let sourceSectionId: string | null = null
      const withoutActive = current.sections.map((section) => {
        const found = section.fields.find((field) => field.key === fieldKey)
        if (!found) {
          return section
        }
        movingField = found
        sourceSectionId = section.id
        return {
          ...section,
          fields: section.fields.filter((field) => field.key !== fieldKey),
        }
      })

      if (!movingField) {
        return current
      }

      const movedField = movingField as BuilderField

      return {
        ...current,
        sections: withoutActive.map((section) => {
          if (section.id !== targetSectionId) {
            return section
          }

          const nextFields = [...section.fields]
          const normalizedIndex =
            sourceSectionId === targetSectionId
              ? Math.min(index, nextFields.length)
              : index

          nextFields.splice(normalizedIndex, 0, {
            ...movedField,
            startColumn: Math.min(
              Math.max(1, startColumn),
              Math.max(1, section.columns),
            ) as BuilderField["startColumn"],
          })
          return { ...section, fields: nextFields }
        }),
      }
    })
  }

  const removeSection = (sectionId: string) => {
    updateDocument((current) => {
      if (current.sections.length === 1) {
        return current
      }
      const nextSections = current.sections.filter(
        (section) => section.id !== sectionId,
      )
      setSelection({ type: "form" })
      setSelectedFieldKey(null)
      return { ...current, sections: nextSections }
    })
  }

  const removeField = (sectionId: string, fieldKey: string) => {
    updateDocument((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              fields: section.fields.filter((field) => field.key !== fieldKey),
            },
      ),
    }))
    setSelection({ type: "section", sectionId })
    setSelectedFieldKey(null)
  }

  const duplicateField = (sectionId: string, fieldKey: string) => {
    updateDocument((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }
        const index = section.fields.findIndex(
          (field) => field.key === fieldKey,
        )
        if (index < 0) {
          return section
        }

        const original = section.fields[index]
        const existingIds = builderFieldsFromDesigner(current).map(
          (field) => field.id,
        )
        const duplicateSeed = createEmptyField(
          builderFieldsFromDesigner(current).length,
          {
            baseId: `${original.id}_copy`,
            existingIds,
            label: `${original.label} Copy`,
          },
        )
        const duplicate = {
          ...original,
          key: duplicateSeed.key,
          id: duplicateSeed.id,
          label: duplicateSeed.label,
        }
        const nextFields = [...section.fields]
        nextFields.splice(index + 1, 0, duplicate)
        setSelection({ type: "field", sectionId, fieldKey: duplicate.key })
        setSelectedFieldKey(duplicate.key)
        setRailTab("properties")
        return { ...section, fields: nextFields }
      }),
    }))
  }

  const handleCanvasDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const activeDrag = parseDragId(String(active.id))
    const overDrag = parseDragId(String(over.id))
    if (!activeDrag || !overDrag) {
      return
    }

    if (activeDrag.type === "palette") {
      const kind = activeDrag.value as BuilderField["kind"]
      if (overDrag.type === "slot") {
        const section = sections.find(
          (candidate) => candidate.id === overDrag.sectionId,
        )
        if (!section) {
          return
        }
        const plan = buildSectionLayoutPlan(
          section.fields,
          section.columns,
          previewDevice,
        )
        const index = resolveDropIndexFromSlot(
          plan,
          overDrag.row,
          overDrag.column,
        )
        insertFieldIntoSection(
          overDrag.sectionId,
          index,
          kind,
          overDrag.column,
        )
        return
      }
      if (overDrag.type === "section") {
        appendFieldToSection(overDrag.value, kind)
        return
      }
      if (overDrag.type === "field") {
        const target = findFieldLocation(overDrag.value)
        if (target) {
          insertFieldIntoSection(target.sectionId, target.index, kind)
        }
      }
      return
    }

    if (activeDrag.type === "section" && overDrag.type === "section") {
      updateDocument((current) => {
        const fromIndex = current.sections.findIndex(
          (section) => section.id === activeDrag.value,
        )
        const toIndex = current.sections.findIndex(
          (section) => section.id === overDrag.value,
        )
        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
          return current
        }
        const nextSections = [...current.sections]
        const [moved] = nextSections.splice(fromIndex, 1)
        nextSections.splice(toIndex, 0, moved)
        return { ...current, sections: nextSections }
      })
      return
    }

    if (activeDrag.type === "field") {
      if (overDrag.type === "slot") {
        const section = sections.find(
          (candidate) => candidate.id === overDrag.sectionId,
        )
        if (!section) {
          return
        }
        const plan = buildSectionLayoutPlan(
          section.fields.filter((field) => field.key !== activeDrag.value),
          section.columns,
          previewDevice,
        )
        const index = resolveDropIndexFromSlot(
          plan,
          overDrag.row,
          overDrag.column,
        )
        moveFieldToSlot(
          activeDrag.value,
          overDrag.sectionId,
          index,
          overDrag.column,
        )
        setSelection({
          type: "field",
          sectionId: overDrag.sectionId,
          fieldKey: activeDrag.value,
        })
        setSelectedFieldKey(activeDrag.value)
        setRailTab("properties")
        return
      }
      if (overDrag.type === "section") {
        moveFieldToSection(activeDrag.value, overDrag.value)
        setSelection({
          type: "field",
          sectionId: overDrag.value,
          fieldKey: activeDrag.value,
        })
        setSelectedFieldKey(activeDrag.value)
        setRailTab("properties")
        return
      }

      const target = findFieldLocation(overDrag.value)
      if (!target) {
        return
      }

      updateDocument((current) => {
        let movingField: BuilderField | null = null
        const withoutActive = current.sections.map((section) => {
          const found = section.fields.find(
            (field) => field.key === activeDrag.value,
          )
          if (!found) {
            return section
          }
          movingField = found
          return {
            ...section,
            fields: section.fields.filter(
              (field) => field.key !== activeDrag.value,
            ),
          }
        })

        if (!movingField) {
          return current
        }
        const movedField = movingField

        return {
          ...current,
          sections: withoutActive.map((section) => {
            if (section.id !== target.sectionId) {
              return section
            }
            const targetIndex = section.fields.findIndex(
              (field) => field.key === overDrag.value,
            )
            const nextFields = [...section.fields]
            nextFields.splice(
              targetIndex < 0 ? nextFields.length : targetIndex,
              0,
              movedField,
            )
            return { ...section, fields: nextFields }
          }),
        }
      })

      setSelection({
        type: "field",
        sectionId: target.sectionId,
        fieldKey: activeDrag.value,
      })
      setSelectedFieldKey(activeDrag.value)
      setRailTab("properties")
    }
  }

  const selectedPalette = selectedField
    ? paletteFieldByKind.get(selectedField.kind)
    : null
  const totalFields = allFields.length
  const requiredFieldCount = allFields.filter((field) => field.required).length
  const formTitleInputId = "designer-form-title"
  const formDescriptionInputId = "designer-form-description"
  const sectionTitleInputId = `designer-section-title-${selectedSection?.id ?? "current"}`
  const sectionDescriptionInputId = `designer-section-description-${selectedSection?.id ?? "current"}`
  const fieldNameInputId = `designer-field-name-${selectedField?.key ?? "current"}`
  const fieldIdInputId = `designer-field-id-${selectedField?.key ?? "current"}`
  const fieldTypeInputId = `designer-field-type-${selectedField?.key ?? "current"}`
  const fieldDefaultInputId = `designer-field-default-${selectedField?.key ?? "current"}`
  const fieldPlaceholderInputId = `designer-field-placeholder-${selectedField?.key ?? "current"}`
  const fieldOptionsInputId = `designer-field-options-${selectedField?.key ?? "current"}`
  const fieldRequiredInputId = `designer-field-required-${selectedField?.key ?? "current"}`
  const fieldHelpTextInputId = `designer-field-help-${selectedField?.key ?? "current"}`
  const fieldMinLengthInputId = `designer-field-min-length-${selectedField?.key ?? "current"}`
  const fieldMaxLengthInputId = `designer-field-max-length-${selectedField?.key ?? "current"}`
  const fieldMinValueInputId = `designer-field-min-value-${selectedField?.key ?? "current"}`
  const fieldMaxValueInputId = `designer-field-max-value-${selectedField?.key ?? "current"}`
  const fieldPatternInputId = `designer-field-pattern-${selectedField?.key ?? "current"}`
  const fieldSpanInputId = `designer-field-span-${selectedField?.key ?? "current"}`
  const fieldStartColumnInputId = `designer-field-start-${selectedField?.key ?? "current"}`
  const fieldSectionInputId = `designer-field-section-${selectedField?.key ?? "current"}`
  const fieldStylePresetInputId = `designer-field-style-${selectedField?.key ?? "current"}`
  const fieldCustomClassesInputId = `designer-field-classes-${selectedField?.key ?? "current"}`
  const fieldSupportsOptions =
    selectedField?.kind === "select" || selectedField?.kind === "radio"
  const fieldSupportsDefaultValue = Boolean(
    selectedField && selectedField.kind !== "checkbox",
  )
  const fieldSupportsPlaceholder = Boolean(
    selectedField &&
    (selectedField.kind === "text" ||
      selectedField.kind === "textarea" ||
      selectedField.kind === "email" ||
      selectedField.kind === "number" ||
      selectedField.kind === "select" ||
      selectedField.kind === "checkbox"),
  )
  const fieldSupportsTextValidation = Boolean(
    selectedField &&
    (selectedField.kind === "text" ||
      selectedField.kind === "textarea" ||
      selectedField.kind === "email"),
  )
  const fieldSupportsNumericValidation = selectedField?.kind === "number"
  const fieldSupportsPattern = Boolean(
    selectedField &&
    (selectedField.kind === "text" ||
      selectedField.kind === "textarea" ||
      selectedField.kind === "email"),
  )
  const placeholderLabel =
    selectedField?.kind === "checkbox"
      ? "Checkbox label"
      : selectedField?.kind === "select"
        ? "Empty-state placeholder"
        : "Placeholder"
  const propertiesPanel = (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_98%,white),color-mix(in_oklab,var(--muted)_18%,transparent))] px-4 py-4 shadow-[0_20px_40px_-34px_color-mix(in_oklab,var(--foreground)_30%,transparent)]">
        <div className="flex items-center gap-3">
          {selectedPalette && (
            <div className="rounded-xl border border-border/60 bg-background p-2 text-primary">
              <selectedPalette.icon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {selection.type === "form"
                ? "Form settings"
                : selection.type === "section"
                  ? "Section settings"
                  : "Field settings"}
            </p>
            <p className="truncate text-sm font-medium tracking-tight">
              {selection.type === "form"
                ? document.settings.title || "Untitled form"
                : selection.type === "section"
                  ? selectedSection?.title || "Untitled section"
                  : selectedField?.label || "Untitled field"}
            </p>
          </div>
        </div>
      </div>

      {selection.type === "form" ? (
        <div className="grid gap-3">
          <div className="grid gap-2">
            <label htmlFor={formTitleInputId} className="text-sm font-medium">
              Form title
            </label>
            <Input
              id={formTitleInputId}
              className="h-10 rounded-md bg-background"
              value={document.settings.title}
              onChange={(event) =>
                updateDocument((current) => ({
                  ...current,
                  settings: {
                    ...current.settings,
                    title: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor={formDescriptionInputId}
              className="text-sm font-medium"
            >
              Description
            </label>
            <Input
              id={formDescriptionInputId}
              className="h-10 rounded-md bg-background"
              value={document.settings.description}
              onChange={(event) =>
                updateDocument((current) => ({
                  ...current,
                  settings: {
                    ...current.settings,
                    description: event.target.value,
                  },
                }))
              }
            />
          </div>
        </div>
      ) : null}

      {selection.type === "section" && selectedSection ? (
        <div className="grid gap-3">
          <div className="grid gap-2">
            <label
              htmlFor={sectionTitleInputId}
              className="text-sm font-medium"
            >
              Section title
            </label>
            <Input
              id={sectionTitleInputId}
              className="h-10 rounded-md bg-background"
              value={selectedSection.title}
              onChange={(event) =>
                updateSelectedSection((section) => ({
                  ...section,
                  title: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor={sectionDescriptionInputId}
              className="text-sm font-medium"
            >
              Description
            </label>
            <Input
              id={sectionDescriptionInputId}
              className="h-10 rounded-md bg-background"
              value={selectedSection.description}
              onChange={(event) =>
                updateSelectedSection((section) => ({
                  ...section,
                  description: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-medium">Layout grid</p>
            <div className="rounded-md border border-border/60 bg-background px-3 py-2.5 text-sm text-muted-foreground">
              Sections now use a fixed 12-column desktop grid, 6-column tablet
              grid, and a single mobile column.
            </div>
          </div>
        </div>
      ) : null}

      {selection.type === "field" && selectedField ? (
        <div className="grid gap-3">
          <div className="rounded-md border border-border/60 bg-muted/10 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Content
            </p>
          </div>
          <div className="grid gap-2">
            <label htmlFor={fieldNameInputId} className="text-sm font-medium">
              Field name
            </label>
            <Input
              id={fieldNameInputId}
              className="h-10 rounded-md bg-background"
              value={selectedField.label}
              onChange={(event) =>
                updateSelectedField((field) => ({
                  ...field,
                  label: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor={fieldIdInputId} className="text-sm font-medium">
              Field ID
            </label>
            <Input
              id={fieldIdInputId}
              className="h-10 rounded-md bg-background"
              value={selectedField.id}
              onChange={(event) =>
                updateSelectedField((field) => ({
                  ...field,
                  id: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor={fieldTypeInputId} className="text-sm font-medium">
              Type
            </label>
            <Select
              value={selectedField.kind}
              onValueChange={(value) =>
                updateSelectedField((field) => ({
                  ...field,
                  kind: value as BuilderField["kind"],
                }))
              }
            >
              <SelectTrigger
                id={fieldTypeInputId}
                className="w-full rounded-md bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paletteFields.map((item) => (
                  <SelectItem key={item.kind} value={item.kind}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {fieldSupportsPlaceholder ? (
            <div className="grid gap-2">
              <label
                htmlFor={fieldPlaceholderInputId}
                className="text-sm font-medium"
              >
                {placeholderLabel}
              </label>
              <Input
                id={fieldPlaceholderInputId}
                className="h-10 rounded-md bg-background"
                value={selectedField.placeholder}
                onChange={(event) =>
                  updateSelectedField((field) => ({
                    ...field,
                    placeholder: event.target.value,
                  }))
                }
              />
            </div>
          ) : null}

          {fieldSupportsDefaultValue ? (
            <div className="grid gap-2">
              <label
                htmlFor={fieldDefaultInputId}
                className="text-sm font-medium"
              >
                Default value
              </label>
              <Input
                id={fieldDefaultInputId}
                className="h-10 rounded-md bg-background"
                value={selectedField.defaultValue}
                onChange={(event) =>
                  updateSelectedField((field) => ({
                    ...field,
                    defaultValue: event.target.value,
                  }))
                }
              />
            </div>
          ) : null}

          {fieldSupportsOptions ? (
            <div className="grid gap-2">
              <label
                htmlFor={fieldOptionsInputId}
                className="text-sm font-medium"
              >
                Options
              </label>
              <Input
                id={fieldOptionsInputId}
                className="h-10 rounded-md bg-background"
                value={selectedField.optionsText}
                onChange={(event) =>
                  updateSelectedField((field) => ({
                    ...field,
                    optionsText: event.target.value,
                  }))
                }
              />
            </div>
          ) : null}

          <div className="rounded-md border border-border/60 bg-muted/10 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Validation
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-2.5">
            <Checkbox
              id={fieldRequiredInputId}
              checked={selectedField.required}
              onCheckedChange={(checked) =>
                updateSelectedField((field) => ({
                  ...field,
                  required: Boolean(checked),
                }))
              }
            />
            <label htmlFor={fieldRequiredInputId} className="text-sm">
              Required
            </label>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor={fieldHelpTextInputId}
              className="text-sm font-medium"
            >
              Help text
            </label>
            <Input
              id={fieldHelpTextInputId}
              className="h-10 rounded-md bg-background"
              value={selectedField.helpText}
              onChange={(event) =>
                updateSelectedField((field) => ({
                  ...field,
                  helpText: event.target.value,
                }))
              }
            />
          </div>

          {fieldSupportsTextValidation ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor={fieldMinLengthInputId}
                  className="text-sm font-medium"
                >
                  Min length
                </label>
                <Input
                  id={fieldMinLengthInputId}
                  className="h-10 rounded-md bg-background"
                  value={selectedField.minLength}
                  onChange={(event) =>
                    updateSelectedField((field) => ({
                      ...field,
                      minLength: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor={fieldMaxLengthInputId}
                  className="text-sm font-medium"
                >
                  Max length
                </label>
                <Input
                  id={fieldMaxLengthInputId}
                  className="h-10 rounded-md bg-background"
                  value={selectedField.maxLength}
                  onChange={(event) =>
                    updateSelectedField((field) => ({
                      ...field,
                      maxLength: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          ) : null}

          {fieldSupportsNumericValidation ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor={fieldMinValueInputId}
                  className="text-sm font-medium"
                >
                  Min value
                </label>
                <Input
                  id={fieldMinValueInputId}
                  className="h-10 rounded-md bg-background"
                  value={selectedField.minValue}
                  onChange={(event) =>
                    updateSelectedField((field) => ({
                      ...field,
                      minValue: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor={fieldMaxValueInputId}
                  className="text-sm font-medium"
                >
                  Max value
                </label>
                <Input
                  id={fieldMaxValueInputId}
                  className="h-10 rounded-md bg-background"
                  value={selectedField.maxValue}
                  onChange={(event) =>
                    updateSelectedField((field) => ({
                      ...field,
                      maxValue: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          ) : null}

          {fieldSupportsPattern ? (
            <div className="grid gap-2">
              <label
                htmlFor={fieldPatternInputId}
                className="text-sm font-medium"
              >
                Regex pattern
              </label>
              <Input
                id={fieldPatternInputId}
                className="h-10 rounded-md bg-background"
                value={selectedField.pattern}
                onChange={(event) =>
                  updateSelectedField((field) => ({
                    ...field,
                    pattern: event.target.value,
                  }))
                }
              />
            </div>
          ) : null}

          <div className="rounded-md border border-border/60 bg-muted/10 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Styling
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor={fieldSpanInputId} className="text-sm font-medium">
                Desktop span
              </label>
              <Select
                value={String(selectedField.span)}
                onValueChange={(value) =>
                  updateSelectedField((field) => ({
                    ...field,
                    span: Number(value) as BuilderField["span"],
                  }))
                }
              >
                <SelectTrigger
                  id={fieldSpanInputId}
                  className="w-full rounded-md bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">Full (12)</SelectItem>
                  <SelectItem value="6">Half (6)</SelectItem>
                  <SelectItem value="4">Third (4)</SelectItem>
                  <SelectItem value="3">Quarter (3)</SelectItem>
                  <SelectItem value="8">8 columns</SelectItem>
                  <SelectItem value="9">9 columns</SelectItem>
                  <SelectItem value="10">10 columns</SelectItem>
                  <SelectItem value="11">11 columns</SelectItem>
                  <SelectItem value="7">7 columns</SelectItem>
                  <SelectItem value="5">5 columns</SelectItem>
                  <SelectItem value="2">2 columns</SelectItem>
                  <SelectItem value="1">1 column</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label
                htmlFor={fieldStartColumnInputId}
                className="text-sm font-medium"
              >
                Start column
              </label>
              <Select
                value={String(selectedField.startColumn)}
                onValueChange={(value) =>
                  updateSelectedField((field) => ({
                    ...field,
                    startColumn: Number(value) as BuilderField["startColumn"],
                  }))
                }
              >
                <SelectTrigger
                  id={fieldStartColumnInputId}
                  className="w-full rounded-md bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, index) => (
                    <SelectItem
                      key={index + 1}
                      value={String(index + 1)}
                    >
                      Column {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor={fieldStylePresetInputId}
              className="text-sm font-medium"
            >
              Style preset
            </label>
            <Select
              value={selectedField.stylePreset}
              onValueChange={(value) =>
                updateSelectedField((field) => ({
                  ...field,
                  stylePreset: value as BuilderField["stylePreset"],
                }))
              }
            >
              <SelectTrigger
                id={fieldStylePresetInputId}
                className="w-full rounded-md bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plain">Plain</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="shadow">Shadow</SelectItem>
                <SelectItem value="accent">Accent border</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor={fieldCustomClassesInputId}
              className="text-sm font-medium"
            >
              Custom classes
            </label>
            <Input
              id={fieldCustomClassesInputId}
              className="h-10 rounded-md bg-background"
              value={selectedField.customClasses}
              placeholder="rounded-xl border-primary/40"
              onChange={(event) =>
                updateSelectedField((field) => ({
                  ...field,
                  customClasses: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor={fieldSectionInputId}
              className="text-sm font-medium"
            >
              Move to section
            </label>
            <Select
              value={selection.sectionId}
              onValueChange={(value) => {
                moveFieldToSection(selection.fieldKey, value)
                setSelection({
                  type: "field",
                  sectionId: value,
                  fieldKey: selection.fieldKey,
                })
              }}
            >
              <SelectTrigger
                id={fieldSectionInputId}
                className="w-full rounded-md bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className="rounded-md"
            onClick={() => removeField(selection.sectionId, selection.fieldKey)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete field
          </Button>
        </div>
      ) : null}
    </div>
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleCanvasDragEnd}
    >
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="self-start xl:sticky xl:top-6">
          <Tabs
            value={railTab}
            onValueChange={(value) => setRailTab(value as RailTab)}
            className="max-h-[calc(100vh-8rem)] overflow-hidden rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_96%,white),color-mix(in_oklab,var(--muted)_18%,transparent))] shadow-[0_28px_60px_-42px_color-mix(in_oklab,var(--foreground)_24%,transparent)]"
          >
            <div className="border-b border-border/60 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
                Builder Studio
              </p>
              <p className="mt-2 text-sm font-semibold tracking-tight">
                Compose sections, controls, and responsive spacing
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full">
                  {sections.length} section{sections.length === 1 ? "" : "s"}
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  {totalFields} field{totalFields === 1 ? "" : "s"}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {requiredFieldCount} required
                </Badge>
              </div>
            </div>
            <div className="border-b border-border/60 p-2">
              <TabsList className="grid h-9 w-full grid-cols-3 rounded-xl bg-background/70 p-1">
                <TabsTrigger value="elements" className="text-xs">
                  Fields
                </TabsTrigger>
                <TabsTrigger value="structure" className="text-xs">
                  Tree
                </TabsTrigger>
                <TabsTrigger value="properties" className="text-xs">
                  Props
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="elements"
              className="m-0 max-h-[calc(100vh-14rem)] overflow-y-auto p-3"
            >
              <div className="mb-3 rounded-2xl border border-dashed border-border/70 bg-background/50 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Field library
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Drag components into any section to build the canvas.
                </p>
              </div>
              <div className="grid gap-2">
                {paletteFields.map((item) => (
                  <PaletteButton key={item.kind} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="structure"
              className="m-0 max-h-[calc(100vh-14rem)] overflow-y-auto p-3"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Navigator
                </p>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {sections.length}
                </Badge>
              </div>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={selectForm}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-left transition-all",
                    selection.type === "form"
                      ? "border-primary/35 bg-primary/8 text-foreground shadow-[0_16px_30px_-28px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
                      : "border-border/60 bg-background/55 text-muted-foreground hover:border-primary/20 hover:bg-background hover:text-foreground",
                  )}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Main form
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-foreground">
                    {document.settings.title || "Untitled form"}
                  </p>
                </button>
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => selectSection(section.id)}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-left transition-all",
                      selectedSection?.id === section.id
                        ? "border-primary/35 bg-primary/8 text-foreground shadow-[0_16px_30px_-28px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
                        : "border-border/60 bg-background/55 text-muted-foreground hover:border-primary/20 hover:bg-background hover:text-foreground",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Section {index + 1}
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-foreground">
                          {section.title}
                        </p>
                      </div>
                      <Badge variant="secondary" className="rounded-full">
                        {section.fields.length}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      12-column desktop grid
                    </p>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="properties"
              className="m-0 max-h-[calc(100vh-14rem)] overflow-y-auto p-3"
            >
              <div className="mb-2 px-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {selection.type === "form"
                    ? "Global form settings"
                    : selection.type === "section"
                      ? "Section settings"
                      : "Field settings"}
                </p>
              </div>
              {propertiesPanel}
            </TabsContent>
          </Tabs>
        </aside>

        <main className="overflow-hidden rounded-[30px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_96%,white),color-mix(in_oklab,var(--card)_82%,transparent))] shadow-[0_30px_70px_-48px_color-mix(in_oklab,var(--foreground)_24%,transparent)]">
          <div className="border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_98%,white),color-mix(in_oklab,var(--muted)_12%,transparent))] px-4 py-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <Badge variant="outline" className="rounded-full">
                Studio canvas
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
                Form editor
              </p>
              <p className="mt-1 text-sm font-semibold tracking-tight">
                {document.settings.title || "Untitled form"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Responsive canvas with drag-and-drop composition and live preview
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl border border-border/60 bg-background p-1">
                {deviceOptions.map((device) => {
                  const Icon = device.icon
                  return (
                    <Button
                      key={device.value}
                      type="button"
                      variant={
                        previewDevice === device.value ? "secondary" : "ghost"
                      }
                      size="sm"
                      className="h-8 rounded-lg px-2.5"
                      onClick={() => setPreviewDevice(device.value)}
                      aria-label={`Preview ${device.label}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{device.label}</span>
                    </Button>
                  )
                })}
              </div>

              <Tabs
                value={mode}
                onValueChange={(value) =>
                  setMode(value as "design" | "preview")
                }
              >
                <TabsList className="h-9 rounded-xl border border-border/60 bg-background p-1">
                  <TabsTrigger value="design" className="text-xs">
                    <LayoutPanelTop className="h-4 w-4" />
                    Design
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">
                    <Sparkles className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          </div>

          {mode === "design" ? (
            <div className="bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_34%),linear-gradient(180deg,color-mix(in_oklab,var(--muted)_16%,transparent),transparent)] p-4 sm:p-6">
              <div
                className={cn(
                  "mx-auto overflow-hidden rounded-[28px] border border-border/60 bg-background shadow-[0_28px_65px_-45px_color-mix(in_oklab,var(--foreground)_34%,transparent)] transition-[max-width]",
                  getDeviceCanvasClass(previewDevice),
                )}
              >
                <div className="border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_98%,white),color-mix(in_oklab,var(--muted)_10%,transparent))] px-5 py-5">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full">
                      Page 1
                    </Badge>
                    <Badge variant="secondary" className="rounded-full">
                      {totalFields} components
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {previewDevice}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={selectForm}
                    className={cn(
                      "block text-left",
                      selection.type === "form" && "text-primary",
                    )}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Form
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                      {document.settings.title || "Untitled form"}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {document.settings.description ||
                        "Select the form, a section, or a field to edit settings in the Props tab."}
                    </p>
                  </button>
                </div>

                <SortableContext
                  items={sections.map((section) => sectionDragId(section.id))}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid gap-5 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--muted)_10%,transparent),transparent)] p-5">
                    {sections.map((section, sectionIndex) => (
                      <SortableSection
                        key={section.id}
                        id={sectionDragId(section.id)}
                      >
                        {({ attributes, listeners, isDragging }) => (
                          (() => {
                            const effectiveColumns = getEffectivePreviewColumns(
                              section.columns,
                              previewDevice,
                            )
                            const layoutPlan = buildSectionLayoutPlan(
                              section.fields,
                              section.columns,
                              previewDevice,
                            )
                            const totalRows = Math.max(
                              1,
                              ...layoutPlan.map((entry) => entry.row),
                            )

                            return (
                          <div
                            className={cn(
                              "overflow-hidden rounded-[26px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_98%,white),color-mix(in_oklab,var(--muted)_12%,transparent))] transition-all",
                              selectedSection?.id === section.id &&
                                "border-primary/60 shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_20%,transparent)]",
                              isDragging &&
                                "shadow-[0_24px_44px_-34px_color-mix(in_oklab,var(--foreground)_40%,transparent)]",
                            )}
                            {...attributes}
                            {...listeners}
                            aria-label={`Drag ${section.title}`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_100%,white),color-mix(in_oklab,var(--muted)_18%,transparent))] px-4 py-4">
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  className="text-left"
                                  onClick={() => selectSection(section.id)}
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="rounded-full"
                                    >
                                      Section {sectionIndex + 1}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="rounded-full"
                                    >
                                      {section.fields.length} field
                                      {section.fields.length === 1 ? "" : "s"}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="rounded-full"
                                    >
                                      12-col grid
                                    </Badge>
                                  </div>
                                  <p className="mt-2 text-base font-semibold tracking-tight">
                                    {section.title}
                                  </p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {section.description ||
                                      "No section description yet."}
                                  </p>
                                </button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-xl px-2 text-destructive hover:bg-destructive/8 hover:text-destructive"
                                disabled={sections.length === 1}
                                onClick={() => removeSection(section.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <SortableContext
                              items={section.fields.map((field) =>
                                fieldDragId(field.key),
                              )}
                              strategy={rectSortingStrategy}
                            >
                              <div
                                className="grid grid-cols-12 gap-3 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--muted)_10%,transparent),transparent)] px-4 py-4"
                                style={getDesignerSectionGridStyle(
                                  section.columns,
                                  previewDevice,
                                )}
                              >
                                {Array.from({
                                  length: effectiveColumns * (totalRows + 1),
                                }).map((_, slotIndex) => {
                                  const row =
                                    Math.floor(slotIndex / effectiveColumns) + 1
                                  const column =
                                    (slotIndex % effectiveColumns) + 1

                                  return (
                                    <DropSlot
                                      key={slotDragId(section.id, row, column)}
                                      id={slotDragId(section.id, row, column)}
                                      style={{
                                        gridColumn: `${column} / span 1`,
                                        gridRow: `${row} / span 1`,
                                      }}
                                    />
                                  )
                                })}
                                {section.fields.length ? (
                                  layoutPlan.map(({ field, start, span, row }) => {
                                    const paletteItem = paletteFieldByKind.get(
                                      field.kind,
                                    )
                                    const FieldIcon = paletteItem?.icon ?? Type

                                    return (
                                      <SortableField
                                        key={field.key}
                                        id={fieldDragId(field.key)}
                                        style={{
                                          gridColumn: `${start} / span ${span}`,
                                          gridRow: `${row} / span 1`,
                                        }}
                                      >
                                        {({
                                          attributes: fieldAttributes,
                                          listeners: fieldListeners,
                                          isDragging: isFieldDragging,
                                        }) => (
                                          <div className="grid gap-3">
                                            <div
                                              className={cn(
                                                "group flex h-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_99%,white),color-mix(in_oklab,var(--muted)_10%,transparent))] px-3 py-3 transition-all",
                                                getFieldStyleClass(field),
                                                field.customClasses,
                                                selectedFieldKey ===
                                                  field.key &&
                                                  "border-primary/60 shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_20%,transparent)]",
                                                !isFieldDragging &&
                                                  "hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-30px_color-mix(in_oklab,var(--foreground)_34%,transparent)]",
                                                isFieldDragging &&
                                                  "shadow-[0_24px_44px_-34px_color-mix(in_oklab,var(--foreground)_40%,transparent)]",
                                              )}
                                              {...fieldAttributes}
                                              {...fieldListeners}
                                              aria-label={`Drag ${field.label}`}
                                            >
                                              <div className="flex min-w-0 items-center gap-3">
                                                <div className="rounded-xl border border-border/60 bg-background p-2 text-primary shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_75%,transparent)]">
                                                  <FieldIcon className="h-4 w-4" />
                                                </div>
                                                <button
                                                  type="button"
                                                  className="min-w-0 text-left"
                                                  onClick={() =>
                                                    selectField(
                                                      section.id,
                                                      field.key,
                                                    )
                                                  }
                                                >
                                                  <p className="truncate text-sm font-medium tracking-tight">
                                                    {field.label}
                                                  </p>
                                                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                                    <span>{field.id}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">
                                                      {field.kind}
                                                    </span>
                                                    {field.required ? (
                                                      <>
                                                        <span>•</span>
                                                        <span>Required</span>
                                                      </>
                                                    ) : null}
                                                    {field.span === 12 ? (
                                                      <>
                                                        <span>•</span>
                                                        <span>Span 12</span>
                                                      </>
                                                    ) : null}
                                                    {field.span === 6 ? (
                                                      <>
                                                        <span>•</span>
                                                        <span>Span 6</span>
                                                      </>
                                                    ) : null}
                                                    {field.span !== 12 &&
                                                    field.span !== 6 ? (
                                                      <>
                                                        <span>•</span>
                                                        <span>
                                                          Span {field.span}
                                                        </span>
                                                      </>
                                                    ) : null}
                                                    <span>•</span>
                                                    <span>
                                                      Start {field.startColumn}
                                                    </span>
                                                  </div>
                                                </button>
                                              </div>

                                              <div className="flex flex-wrap gap-1">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-7 rounded-md px-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                  onClick={() =>
                                                    duplicateField(
                                                      section.id,
                                                      field.key,
                                                    )
                                                  }
                                                >
                                                  <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-7 rounded-md px-2 text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                                                  onClick={() =>
                                                    removeField(
                                                      section.id,
                                                      field.key,
                                                    )
                                                  }
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </SortableField>
                                    )
                                  })
                                ) : (
                                  <div className="col-span-12 rounded-2xl border border-dashed border-border/70 bg-background/45 px-4 py-9 text-center text-sm text-muted-foreground">
                                    Empty section. Drag fields here to start composing.
                                  </div>
                                )}
                              </div>
                            </SortableContext>
                          </div>
                            )
                          })()
                        )}
                      </SortableSection>
                    ))}
                  </div>
                </SortableContext>
              </div>
            </div>
          ) : (
            <div className="bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_34%),linear-gradient(180deg,color-mix(in_oklab,var(--muted)_16%,transparent),transparent)] p-4 sm:p-6">
              <div
                className={cn(
                  "mx-auto overflow-hidden rounded-[28px] border border-border/60 bg-background p-5 shadow-[0_28px_65px_-45px_color-mix(in_oklab,var(--foreground)_34%,transparent)] transition-[max-width]",
                  getDeviceCanvasClass(previewDevice),
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Preview
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                  {document.settings.title || "Untitled form"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Large screens use a 12-column grid, tablets collapse to 6,
                  and mobile stacks to 1.
                </p>
                <div className="mt-6">
                  <RuntimeFormRenderer
                    fields={allFields}
                    values={{}}
                    readOnly
                    previewDevice={previewDevice}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </DndContext>
  )
}
