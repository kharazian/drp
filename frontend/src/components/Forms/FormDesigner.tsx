import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
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
  GripVertical,
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

type PaletteField = {
  kind: BuilderField["kind"]
  label: string
  icon: typeof Type
}

const paletteFields: PaletteField[] = [
  { kind: "text", label: "Text", icon: Type },
  { kind: "textarea", label: "Textarea", icon: Rows3 },
  { kind: "email", label: "Email", icon: Mail },
  { kind: "number", label: "Number", icon: WholeWord },
  { kind: "date", label: "Date", icon: CalendarDays },
  { kind: "select", label: "Select", icon: ListChecks },
  { kind: "radio", label: "Radio", icon: CircleDot },
  { kind: "checkbox", label: "Checkbox", icon: CheckSquare },
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

function getDesignerWidthClass(
  width: BuilderField["width"],
  device: PreviewDevice,
) {
  if (device === "mobile") {
    return "col-span-12"
  }

  if (device === "tablet") {
    return width === "full" ? "col-span-12" : "col-span-6"
  }

  switch (width) {
    case "full":
      return "col-span-12"
    case "half":
      return "col-span-6"
    case "third":
      return "col-span-4"
    case "quarter":
      return "col-span-3"
  }
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

function parseDragId(
  id: string,
): { type: "palette" | "section" | "field"; value: string } | null {
  if (id.startsWith("palette:")) {
    return { type: "palette", value: id.slice("palette:".length) }
  }
  if (id.startsWith("section:")) {
    return { type: "section", value: id.slice("section:".length) }
  }
  if (id.startsWith("field:")) {
    return { type: "field", value: id.slice("field:".length) }
  }
  return null
}

function createFieldTemplate(
  kind: BuilderField["kind"],
  fieldIndex: number,
  existingIds: string[],
) {
  const base = createEmptyField(fieldIndex, { existingIds })

  switch (kind) {
    case "text":
      return {
        ...base,
        kind,
        label: "Text Field",
        placeholder: "Enter text",
        width: "half" as const,
      }
    case "textarea":
      return {
        ...base,
        kind,
        label: "Long Text",
        placeholder: "Enter details",
        width: "full" as const,
      }
    case "email":
      return {
        ...base,
        kind,
        label: "Email",
        placeholder: "name@company.com",
        width: "half" as const,
      }
    case "number":
      return {
        ...base,
        kind,
        label: "Number",
        placeholder: "0",
        width: "half" as const,
      }
    case "date":
      return {
        ...base,
        kind,
        label: "Date",
        width: "half" as const,
      }
    case "select":
      return {
        ...base,
        kind,
        label: "Select",
        placeholder: "Choose an option",
        optionsText: "Option A, Option B, Option C",
        width: "half" as const,
      }
    case "radio":
      return {
        ...base,
        kind,
        label: "Radio Group",
        optionsText: "Option A, Option B, Option C",
        width: "full" as const,
      }
    case "checkbox":
      return {
        ...base,
        kind,
        label: "Checkbox",
        placeholder: "I agree",
        width: "full" as const,
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
        "flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2 text-left transition-colors",
        isDragging
          ? "border-primary/60 bg-primary/5 shadow-md"
          : "hover:border-primary/35 hover:bg-muted/20",
      )}
      {...listeners}
      {...attributes}
    >
      <div className="rounded-md border border-border/60 bg-muted/20 p-1.5 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="min-w-0 truncate text-sm font-medium">{item.label}</span>
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
  children,
}: {
  id: string
  className?: string
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
      className={cn(className, isDragging && "z-10")}
    >
      {children({ attributes, listeners, isDragging })}
    </div>
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
  ) => {
    updateDocument((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }
        const nextField = createFieldOfKind(kind, current)
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
  const formTitleInputId = "designer-form-title"
  const formDescriptionInputId = "designer-form-description"
  const sectionTitleInputId = `designer-section-title-${selectedSection?.id ?? "current"}`
  const sectionDescriptionInputId = `designer-section-description-${selectedSection?.id ?? "current"}`
  const sectionLayoutInputId = `designer-section-layout-${selectedSection?.id ?? "current"}`
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
  const fieldPatternInputId = `designer-field-pattern-${selectedField?.key ?? "current"}`
  const fieldWidthInputId = `designer-field-width-${selectedField?.key ?? "current"}`
  const fieldSectionInputId = `designer-field-section-${selectedField?.key ?? "current"}`
  const fieldStylePresetInputId = `designer-field-style-${selectedField?.key ?? "current"}`
  const fieldCustomClassesInputId = `designer-field-classes-${selectedField?.key ?? "current"}`
  const propertiesPanel = (
    <div className="grid gap-3">
      <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-3">
        <div className="flex items-center gap-2">
          {selectedPalette && (
            <div className="rounded-md border border-border/60 bg-background p-1.5 text-primary">
              <selectedPalette.icon className="h-4 w-4" />
            </div>
          )}
          <p className="text-sm font-medium tracking-tight">
            {selection.type === "form"
              ? document.settings.title || "Untitled form"
              : selection.type === "section"
                ? selectedSection?.title || "Untitled section"
                : selectedField?.label || "Untitled field"}
          </p>
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
            <label
              htmlFor={sectionLayoutInputId}
              className="text-sm font-medium"
            >
              Layout
            </label>
            <Select
              value={String(selectedSection.columns)}
              onValueChange={(value) =>
                updateSelectedSection((section) => ({
                  ...section,
                  columns: Number(
                    value,
                  ) as DesignerDocument["sections"][number]["columns"],
                }))
              }
            >
              <SelectTrigger
                id={sectionLayoutInputId}
                className="w-full rounded-md bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Single column</SelectItem>
                <SelectItem value="2">Two columns</SelectItem>
                <SelectItem value="3">Three columns</SelectItem>
                <SelectItem value="4">Four columns</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="grid gap-2">
            <label
              htmlFor={fieldPlaceholderInputId}
              className="text-sm font-medium"
            >
              Placeholder
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

          {(selectedField.kind === "select" ||
            selectedField.kind === "radio") && (
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
          )}

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

          <div className="rounded-md border border-border/60 bg-muted/10 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Styling
            </p>
          </div>

          <div className="grid gap-2">
            <label htmlFor={fieldWidthInputId} className="text-sm font-medium">
              Desktop width
            </label>
            <Select
              value={selectedField.width}
              onValueChange={(value) =>
                updateSelectedField((field) => ({
                  ...field,
                  width: value as BuilderField["width"],
                }))
              }
            >
              <SelectTrigger
                id={fieldWidthInputId}
                className="w-full rounded-md bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full width</SelectItem>
                <SelectItem value="half">1/2 width</SelectItem>
                <SelectItem value="third">1/3 width</SelectItem>
                <SelectItem value="quarter">1/4 width</SelectItem>
              </SelectContent>
            </Select>
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
      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="self-start xl:sticky xl:top-6">
          <Tabs
            value={railTab}
            onValueChange={(value) => setRailTab(value as RailTab)}
            className="max-h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border/60 bg-background"
          >
            <div className="border-b border-border/60 p-2">
              <TabsList className="grid h-8 w-full grid-cols-3 rounded-lg bg-muted/30 p-1">
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
              className="m-0 max-h-[calc(100vh-12rem)] overflow-y-auto p-2"
            >
              <div className="mb-2 px-1">
                <p className="text-[11px] text-muted-foreground">
                  Drag fields into the form.
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
              className="m-0 max-h-[calc(100vh-12rem)] overflow-y-auto p-2"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[11px] text-muted-foreground">
                  Form outline
                </p>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {sections.length}
                </Badge>
              </div>
              <div className="grid gap-1.5">
                <button
                  type="button"
                  onClick={selectForm}
                  className={cn(
                    "rounded-md px-2.5 py-2 text-left text-xs transition-colors",
                    selection.type === "form"
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                  )}
                >
                  Main form
                </button>
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => selectSection(section.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors",
                      selectedSection?.id === section.id
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                    )}
                  >
                    <span className="truncate">
                      {index + 1}. {section.title}
                    </span>
                    <span>{section.fields.length}</span>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="properties"
              className="m-0 max-h-[calc(100vh-12rem)] overflow-y-auto p-2"
            >
              <div className="mb-2 px-1">
                <p className="text-[11px] text-muted-foreground">
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

        <main className="rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold tracking-tight">
                {document.settings.title || "Untitled form"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Responsive canvas with drag-and-drop field placement
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-md border border-border/60 bg-background p-1">
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
                      className="h-7 rounded px-2"
                      onClick={() => setPreviewDevice(device.value)}
                      aria-label={`Preview ${device.label}`}
                    >
                      <Icon className="h-4 w-4" />
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
                <TabsList className="h-8 rounded-md border border-border/60 bg-background p-1">
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

          {mode === "design" ? (
            <div className="bg-muted/[0.12] p-4 sm:p-6">
              <div
                className={cn(
                  "mx-auto rounded-[20px] border border-border/60 bg-background shadow-[0_1px_3px_0_color-mix(in_oklab,var(--foreground)_10%,transparent)] transition-[max-width]",
                  getDeviceCanvasClass(previewDevice),
                )}
              >
                <div className="border-b border-border/60 px-5 py-5">
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
                  <div className="grid gap-5 p-5">
                    {sections.map((section, sectionIndex) => (
                      <SortableSection
                        key={section.id}
                        id={sectionDragId(section.id)}
                      >
                        {({ attributes, listeners, isDragging }) => (
                          <div
                            className={cn(
                              "rounded-2xl border border-border/60 bg-background transition-all",
                              selectedSection?.id === section.id &&
                                "border-primary/60 shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_20%,transparent)]",
                              isDragging && "shadow-lg",
                            )}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-4 py-3">
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  className="rounded-md border border-border/60 bg-muted/20 p-1.5 text-muted-foreground"
                                  {...attributes}
                                  {...listeners}
                                  aria-label={`Drag ${section.title}`}
                                >
                                  <GripVertical className="h-4 w-4" />
                                </button>

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
                                      {section.columns} col
                                      {section.columns === 1 ? "" : "s"}
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
                                className="h-8 rounded-md px-2 text-destructive hover:text-destructive"
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
                                className="grid grid-cols-12 gap-3 px-4 py-4"
                                style={{
                                  backgroundImage:
                                    "linear-gradient(to right, color-mix(in oklab, var(--border) 40%, transparent) 1px, transparent 1px)",
                                  backgroundSize: "calc(100% / 12) 100%",
                                }}
                              >
                                {section.fields.length ? (
                                  section.fields.map((field) => {
                                    const paletteItem = paletteFieldByKind.get(
                                      field.kind,
                                    )
                                    const FieldIcon = paletteItem?.icon ?? Type

                                    return (
                                      <SortableField
                                        key={field.key}
                                        id={fieldDragId(field.key)}
                                        className={cn(
                                          getDesignerWidthClass(
                                            field.width,
                                            previewDevice,
                                          ),
                                        )}
                                      >
                                        {({
                                          attributes: fieldAttributes,
                                          listeners: fieldListeners,
                                          isDragging: isFieldDragging,
                                        }) => (
                                          <div className="grid gap-3">
                                            <div
                                              className={cn(
                                                "group flex h-full flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background px-3 py-3 transition-all",
                                                getFieldStyleClass(field),
                                                field.customClasses,
                                                selectedFieldKey ===
                                                  field.key &&
                                                  "border-primary/60 shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_20%,transparent)]",
                                                isFieldDragging && "shadow-lg",
                                              )}
                                            >
                                              <div className="flex min-w-0 items-center gap-3">
                                                <button
                                                  type="button"
                                                  className="rounded-md border border-border/60 bg-muted/20 p-1.5 text-muted-foreground"
                                                  {...fieldAttributes}
                                                  {...fieldListeners}
                                                  aria-label={`Drag ${field.label}`}
                                                >
                                                  <GripVertical className="h-4 w-4" />
                                                </button>
                                                <div className="rounded-md border border-border/60 bg-muted/20 p-1.5 text-primary">
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
                                                    {field.width === "full" ? (
                                                      <>
                                                        <span>•</span>
                                                        <span>Full</span>
                                                      </>
                                                    ) : null}
                                                    {field.width === "third" ? (
                                                      <>
                                                        <span>•</span>
                                                        <span>1/3</span>
                                                      </>
                                                    ) : null}
                                                    {field.width ===
                                                    "quarter" ? (
                                                      <>
                                                        <span>•</span>
                                                        <span>1/4</span>
                                                      </>
                                                    ) : null}
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
                                  <div className="col-span-12 rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
                                    Empty Section: Drag fields here
                                  </div>
                                )}
                              </div>
                            </SortableContext>
                          </div>
                        )}
                      </SortableSection>
                    ))}
                  </div>
                </SortableContext>
              </div>
            </div>
          ) : (
            <div className="bg-muted/[0.12] p-4 sm:p-6">
              <div
                className={cn(
                  "mx-auto rounded-[20px] border border-border/60 bg-background p-5 shadow-[0_1px_3px_0_color-mix(in_oklab,var(--foreground)_10%,transparent)] transition-[max-width]",
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
                  Large screens render 3 columns, medium screens render 2, and
                  mobile stacks to 1.
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
