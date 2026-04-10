import {
  ArrowDown,
  ArrowUp,
  Layers3,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react"
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react"

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
  type DesignerDocument,
  createEmptyField,
  createEmptySection,
  builderFieldsFromDesigner,
} from "./schema"

type DesignerSelection =
  | { type: "form" }
  | { type: "section"; sectionId: string }
  | { type: "field"; sectionId: string; fieldKey: string }

function EmptyPanel({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-border/60 bg-background/55 px-5 py-8 text-center">
      <p className="font-medium tracking-tight">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
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
  const [selection, setSelection] = useState<DesignerSelection>({ type: "form" })

  const sections = document.sections
  const selectedSection =
    selection.type === "section" || selection.type === "field"
      ? sections.find((section) => section.id === selection.sectionId) ?? null
      : null
  const selectedField =
    selection.type === "field"
      ? selectedSection?.fields.find((field) => field.key === selection.fieldKey) ?? null
      : null

  const allFields = useMemo(() => builderFieldsFromDesigner(document), [document])

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

  const updateDocument = (updater: (current: DesignerDocument) => DesignerDocument) => {
    setDocument((current) => updater(current))
  }

  const updateSelectedSection = (
    updater: (section: DesignerDocument["sections"][number]) => DesignerDocument["sections"][number],
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

  const updateSelectedField = (updater: (field: BuilderField) => BuilderField) => {
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
  }

  const selectSection = (sectionId: string) => {
    setSelection({ type: "section", sectionId })
    setSelectedFieldKey(null)
  }

  const selectField = (sectionId: string, fieldKey: string) => {
    setSelection({ type: "field", sectionId, fieldKey })
    setSelectedFieldKey(fieldKey)
  }

  const appendSection = () => {
    updateDocument((current) => {
      const nextSection = createEmptySection(current.sections.length)
      setSelection({ type: "section", sectionId: nextSection.id })
      setSelectedFieldKey(null)
      return { ...current, sections: [...current.sections, nextSection] }
    })
  }

  const appendFieldToSection = (sectionId: string) => {
    updateDocument((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }
        const nextField = createEmptyField(builderFieldsFromDesigner(current).length)
        setSelection({ type: "field", sectionId, fieldKey: nextField.key })
        setSelectedFieldKey(nextField.key)
        return {
          ...section,
          fields: [...section.fields, nextField],
        }
      }),
    }))
  }

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    updateDocument((current) => {
      const index = current.sections.findIndex((section) => section.id === sectionId)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= current.sections.length) {
        return current
      }
      const nextSections = [...current.sections]
      const [moved] = nextSections.splice(index, 1)
      nextSections.splice(nextIndex, 0, moved)
      return { ...current, sections: nextSections }
    })
  }

  const removeSection = (sectionId: string) => {
    updateDocument((current) => {
      if (current.sections.length === 1) {
        return current
      }
      const nextSections = current.sections.filter((section) => section.id !== sectionId)
      setSelection({ type: "form" })
      setSelectedFieldKey(null)
      return { ...current, sections: nextSections }
    })
  }

  const moveFieldWithinSection = (
    sectionId: string,
    fieldKey: string,
    direction: -1 | 1,
  ) => {
    updateDocument((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }
        const index = section.fields.findIndex((field) => field.key === fieldKey)
        const nextIndex = index + direction
        if (index < 0 || nextIndex < 0 || nextIndex >= section.fields.length) {
          return section
        }
        const nextFields = [...section.fields]
        const [moved] = nextFields.splice(index, 1)
        nextFields.splice(nextIndex, 0, moved)
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
            ? { ...section, fields: [...section.fields, movingField as BuilderField] }
            : section,
        ),
      }
    })
  }

  const removeSelectedField = () => {
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
              fields: section.fields.filter((field) => field.key !== selection.fieldKey),
            },
      ),
    }))
    setSelection({ type: "section", sectionId: selection.sectionId })
    setSelectedFieldKey(null)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_380px]">
      <div className="grid gap-4 self-start rounded-[30px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_95%,white),color-mix(in_oklab,var(--card)_84%,transparent))] p-5">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">
            Structure
          </p>
          <h4 className="text-lg font-semibold tracking-tight">Form outline</h4>
          <p className="text-sm leading-6 text-muted-foreground">
            Sections are now first-class builder objects. Add, rename, reorder, and
            distribute fields across them here.
          </p>
        </div>

        <button
          type="button"
          onClick={selectForm}
          className={cn(
            "rounded-[22px] border px-4 py-4 text-left transition-all",
            selection.type === "form"
              ? "border-primary/70 bg-primary/8"
              : "border-border/60 bg-background/65",
          )}
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full">
              Form
            </Badge>
            <p className="font-medium tracking-tight">
              {document.settings.title || "Untitled form"}
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {sections.length} section{sections.length === 1 ? "" : "s"} and {allFields.length} field
            {allFields.length === 1 ? "" : "s"} in this draft.
          </p>
        </button>

        <div className="grid gap-3 rounded-[24px] border border-border/60 bg-background/55 p-3">
          {sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              className="grid gap-3 rounded-[22px] border border-border/60 bg-background/70 p-3"
            >
              <button
                type="button"
                onClick={() => selectSection(section.id)}
                className={cn(
                  "rounded-[18px] border px-4 py-4 text-left transition-all",
                  selection.type === "section" && selection.sectionId === section.id
                    ? "border-primary/70 bg-primary/8"
                    : "border-border/60 bg-background/65",
                )}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    Section {sectionIndex + 1}
                  </Badge>
                  <p className="font-medium tracking-tight">{section.title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {section.description || "No section description yet."}
                </p>
              </button>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={sectionIndex === 0}
                  onClick={() => moveSection(section.id, -1)}
                >
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={sectionIndex === sections.length - 1}
                  onClick={() => moveSection(section.id, 1)}
                >
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Down
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={sections.length === 1}
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>

              <div className="grid gap-2">
                {section.fields.map((field, fieldIndex) => (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() => selectField(section.id, field.key)}
                    className={cn(
                      "rounded-[18px] border px-3 py-3 text-left transition-all",
                      selectedFieldKey === field.key
                        ? "border-primary/70 bg-primary/8"
                        : "border-border/60 bg-background/70",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="rounded-full">
                        {fieldIndex + 1}
                      </Badge>
                      <p className="font-medium tracking-tight">{field.label}</p>
                      <Badge variant="secondary" className="rounded-full uppercase">
                        {field.kind}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{field.id}</p>
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                className="rounded-xl bg-background/80"
                onClick={() => appendFieldToSection(section.id)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Field To Section
              </Button>
            </div>
          ))}

          <Button variant="outline" className="rounded-xl bg-background/80" onClick={appendSection}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-[30px] border border-border/60 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_10%,white),transparent_30%),linear-gradient(180deg,color-mix(in_oklab,var(--card)_95%,white),color-mix(in_oklab,var(--card)_84%,transparent))] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">
              Canvas
            </p>
            <h4 className="text-lg font-semibold tracking-tight">Live design surface</h4>
            <p className="text-sm leading-6 text-muted-foreground">
              Each section now renders separately in the canvas, which makes the
              designer behave more like the product you want to build.
            </p>
          </div>
          <Badge variant="outline" className="rounded-full">
            {sections.length} sections
          </Badge>
        </div>

        <div className="rounded-[28px] border border-border/60 bg-background/70 p-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Form
            </p>
            <h3 className="text-2xl font-semibold tracking-tight">
              {document.settings.title || "Untitled form"}
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Designer canvas with real saved sections.
            </p>
          </div>

          <div className="mt-6 grid gap-5">
            {sections.map((section) => (
              <div
                key={section.id}
                className={cn(
                  "rounded-[24px] border p-5 transition-all",
                  selectedSection?.id === section.id
                    ? "border-primary/70 bg-primary/6"
                    : "border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,white_86%,transparent),color-mix(in_oklab,var(--background)_90%,transparent))]",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button type="button" className="text-left" onClick={() => selectSection(section.id)}>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
                      Section
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-tight">{section.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {section.description || "No section description yet."}
                    </p>
                  </button>
                  <Button
                    variant="outline"
                    className="rounded-xl bg-background/80"
                    onClick={() => appendFieldToSection(section.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Field
                  </Button>
                </div>

                <div className={cn("mt-5 grid gap-3", section.columns === 2 ? "sm:grid-cols-2" : "grid-cols-1")}>
                  {section.fields.length ? (
                    section.fields.map((field, index) => (
                      <div
                        key={field.key}
                        className={cn(
                          "grid gap-3 rounded-[22px] border p-4 text-left transition-all",
                          field.width === "full" && section.columns === 2 ? "sm:col-span-2" : "",
                          selectedFieldKey === field.key
                            ? "border-primary/70 bg-primary/8 shadow-[0_18px_34px_-28px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                            : "border-border/60 bg-background/80",
                        )}
                      >
                        <button type="button" className="text-left" onClick={() => selectField(section.id, field.key)}>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="rounded-full">
                              {index + 1}
                            </Badge>
                            <p className="font-medium tracking-tight">{field.label}</p>
                            <Badge variant="secondary" className="rounded-full uppercase">
                              {field.kind}
                            </Badge>
                            {field.required ? (
                              <Badge variant="outline" className="rounded-full">
                                Required
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">{field.id}</p>
                          {field.helpText ? (
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                              {field.helpText}
                            </p>
                          ) : null}
                        </button>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            disabled={index === 0}
                            onClick={() => moveFieldWithinSection(section.id, field.key, -1)}
                          >
                            <ArrowUp className="mr-2 h-4 w-4" />
                            Up
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            disabled={index === section.fields.length - 1}
                            onClick={() => moveFieldWithinSection(section.id, field.key, 1)}
                          >
                            <ArrowDown className="mr-2 h-4 w-4" />
                            Down
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyPanel
                      title="Section is empty"
                      description="Add fields here so this section becomes part of the live form flow."
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-dashed border-border/60 bg-muted/15 p-5">
            <p className="text-sm font-medium tracking-tight">Runtime snapshot</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The runtime view still uses the same field renderer, but now across all
              saved sections instead of one adapted stack.
            </p>
            <div className="mt-5">
              <RuntimeFormRenderer fields={allFields} values={{}} readOnly />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 self-start rounded-[30px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_96%,white),color-mix(in_oklab,var(--card)_86%,transparent))] p-5">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">
            Inspector
          </p>
          <h4 className="text-lg font-semibold tracking-tight">Selected item</h4>
          <p className="text-sm leading-6 text-muted-foreground">
            The right panel now edits real form, section, and field entities.
          </p>
        </div>

        {selection.type === "form" ? (
          <div className="grid gap-4">
            <Tabs defaultValue="general" className="grid gap-4">
              <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-[20px] border border-border/55 bg-background/72 p-1.5">
                <TabsTrigger value="general">
                  <Settings2 className="h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="future">
                  <Sparkles className="h-4 w-4" />
                  Future
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Form Title</label>
                  <Input
                    className="h-11 rounded-xl bg-background/75"
                    value={document.settings.title}
                    onChange={(event) =>
                      updateDocument((current) => ({
                        ...current,
                        settings: { ...current.settings, title: event.target.value },
                      }))
                    }
                    placeholder="Operations Request"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    className="h-11 rounded-xl bg-background/75"
                    value={document.settings.description}
                    onChange={(event) =>
                      updateDocument((current) => ({
                        ...current,
                        settings: { ...current.settings, description: event.target.value },
                      }))
                    }
                    placeholder="Optional form description"
                  />
                </div>
              </TabsContent>

              <TabsContent value="future" className="grid gap-4">
                <EmptyPanel
                  title="Next: form-level settings"
                  description="Submit labels, section rules, and higher-order form behavior can build on this real document model."
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : null}

        {selection.type === "section" && selectedSection ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Section Title</label>
              <Input
                value={selectedSection.title}
                className="h-11 rounded-xl bg-background/75"
                onChange={(event) =>
                  updateSelectedSection((section) => ({ ...section, title: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Section Description</label>
              <Input
                value={selectedSection.description}
                className="h-11 rounded-xl bg-background/75"
                onChange={(event) =>
                  updateSelectedSection((section) => ({
                    ...section,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional section description"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Columns</label>
              <Select
                value={String(selectedSection.columns)}
                onValueChange={(value) =>
                  updateSelectedSection((section) => ({
                    ...section,
                    columns: value === "1" ? 1 : 2,
                  }))
                }
              >
                <SelectTrigger className="w-full rounded-xl bg-background/75">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 column</SelectItem>
                  <SelectItem value="2">2 columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        {selection.type === "field" ? (
          selectedField ? (
            <div className="grid gap-4">
              <Tabs defaultValue="general" className="grid gap-4">
                <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-[20px] border border-border/55 bg-background/72 p-1.5">
                  <TabsTrigger value="general">
                    <Settings2 className="h-4 w-4" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="validation">
                    <Sparkles className="h-4 w-4" />
                    Validation
                  </TabsTrigger>
                  <TabsTrigger value="layout">
                    <Layers3 className="h-4 w-4" />
                    Layout
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Label</label>
                    <Input
                      className="h-11 rounded-xl bg-background/75"
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
                    <label className="text-sm font-medium">ID</label>
                    <Input
                      className="h-11 rounded-xl bg-background/75"
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
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={selectedField.kind}
                      onValueChange={(value) =>
                        updateSelectedField((field) => ({
                          ...field,
                          kind: value as BuilderField["kind"],
                        }))
                      }
                    >
                      <SelectTrigger className="w-full rounded-xl bg-background/75">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="radio">Radio</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Move To Section</label>
                    <Select
                      value={selection.sectionId}
                      onValueChange={(value) => {
                        moveFieldToSection(selection.fieldKey, value)
                        setSelection({ type: "field", sectionId: value, fieldKey: selection.fieldKey })
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl bg-background/75">
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
                </TabsContent>

                <TabsContent value="validation" className="grid gap-4">
                  <label className="flex items-center gap-3 rounded-[20px] border border-border/60 bg-muted/20 px-4 py-3 text-sm">
                    <Checkbox
                      checked={selectedField.required}
                      onCheckedChange={(checked) =>
                        updateSelectedField((field) => ({
                          ...field,
                          required: Boolean(checked),
                        }))
                      }
                    />
                    Required field
                  </label>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Help Text</label>
                    <Input
                      className="h-11 rounded-xl bg-background/75"
                      value={selectedField.helpText}
                      onChange={(event) =>
                        updateSelectedField((field) => ({
                          ...field,
                          helpText: event.target.value,
                        }))
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Width</label>
                    <Select
                      value={selectedField.width}
                      onValueChange={(value) =>
                        updateSelectedField((field) => ({
                          ...field,
                          width: value as BuilderField["width"],
                        }))
                      }
                    >
                      <SelectTrigger className="w-full rounded-xl bg-background/75">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full width</SelectItem>
                        <SelectItem value="half">Half width</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" className="rounded-xl" onClick={removeSelectedField}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Field
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <EmptyPanel
              title="Field no longer selected"
              description="Choose a field from the structure panel or canvas."
            />
          )
        ) : null}
      </div>
    </div>
  )
}
