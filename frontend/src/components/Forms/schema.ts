import type {
  JsonSchema,
  JsonSchemaField,
  JsonSchemaGridColumn,
  JsonSchemaFieldStylePreset,
  JsonSchemaSection,
  JsonSchemaSectionColumns,
} from "@/lib/forms-api"

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "email"
  | "date"
  | "checkbox"
  | "radio"

export type BuilderField = {
  key: string
  id: string
  kind: FieldKind
  label: string
  defaultValue: string
  startColumn: JsonSchemaGridColumn
  span: JsonSchemaGridColumn
  helpText: string
  placeholder: string
  required: boolean
  customClasses: string
  stylePreset: JsonSchemaFieldStylePreset
  optionsText: string
  minLength: string
  maxLength: string
  minValue: string
  maxValue: string
  pattern: string
}

export type DesignerSection = {
  id: string
  title: string
  description: string
  columns: JsonSchemaSectionColumns
  fields: BuilderField[]
}

export type DesignerDocument = {
  version: 2
  settings: {
    title: string
    description: string
    submitLabel: string
  }
  sections: DesignerSection[]
}

type BuilderFieldSeed = Omit<BuilderField, "key">

type EmptyFieldOptions = {
  baseId?: string
  existingIds?: Iterable<string>
  label?: string
}

type EmptySectionOptions = {
  baseId?: string
  existingIds?: Iterable<string>
  title?: string
}

const starterBuilderFieldSeeds: BuilderFieldSeed[] = [
  {
    id: "requester_name",
    kind: "text",
    label: "Requester Name",
    defaultValue: "",
    startColumn: 1,
    span: 6,
    helpText: "",
    placeholder: "Jordan Lee",
    required: true,
    customClasses: "",
    stylePreset: "plain",
    optionsText: "",
    minLength: "",
    maxLength: "",
    minValue: "",
    maxValue: "",
    pattern: "",
  },
  {
    id: "request_details",
    kind: "textarea",
    label: "Request Details",
    defaultValue: "",
    startColumn: 1,
    span: 12,
    helpText: "",
    placeholder: "Describe the request",
    required: true,
    customClasses: "",
    stylePreset: "plain",
    optionsText: "",
    minLength: "",
    maxLength: "",
    minValue: "",
    maxValue: "",
    pattern: "",
  },
]

function createFieldKey() {
  return crypto.randomUUID()
}

function createSectionKey() {
  return crypto.randomUUID()
}

function withFieldKey(field: BuilderFieldSeed): BuilderField {
  return {
    key: createFieldKey(),
    ...field,
  }
}

function createUniqueId(baseId: string, existingIds?: Iterable<string>) {
  const normalizedBaseId = baseId.trim() || "field"
  const seen = new Set(existingIds ?? [])

  if (!seen.has(normalizedBaseId)) {
    return normalizedBaseId
  }

  let suffix = 2
  while (seen.has(`${normalizedBaseId}_${suffix}`)) {
    suffix += 1
  }

  return `${normalizedBaseId}_${suffix}`
}

function createUniqueSectionId(baseId: string, existingIds?: Iterable<string>) {
  const normalizedBaseId = baseId.trim() || "section"
  const seen = new Set(existingIds ?? [])

  if (!seen.has(normalizedBaseId)) {
    return normalizedBaseId
  }

  let suffix = 2
  while (seen.has(`${normalizedBaseId}_${suffix}`)) {
    suffix += 1
  }

  return `${normalizedBaseId}_${suffix}`
}

export function createEmptyField(
  index: number,
  options?: EmptyFieldOptions,
): BuilderField {
  return withFieldKey({
    id: createUniqueId(
      options?.baseId ?? `field_${index + 1}`,
      options?.existingIds,
    ),
    kind: "text",
    label: options?.label ?? "New Field",
    defaultValue: "",
    startColumn: 1,
    span: 12,
    helpText: "",
    placeholder: "",
    required: false,
    customClasses: "",
    stylePreset: "plain",
    optionsText: "",
    minLength: "",
    maxLength: "",
    minValue: "",
    maxValue: "",
    pattern: "",
  })
}

export function createEmptySection(
  index: number,
  options?: EmptySectionOptions,
): DesignerSection {
  return {
    id: createUniqueSectionId(
      options?.baseId ?? `section_${index + 1}`,
      options?.existingIds,
    ),
    title: options?.title ?? `Section ${index + 1}`,
    description: "",
    columns: 12,
    fields: [],
  }
}

export function cloneStarterDocument(title = ""): DesignerDocument {
  const firstSection = createEmptySection(0)
  firstSection.title = "Main Section"
  firstSection.description = "Primary section for the initial draft."
  firstSection.fields = cloneStarterFields()

  return {
    version: 2,
    settings: {
      title,
      description: "",
      submitLabel: "Submit",
    },
    sections: [firstSection],
  }
}

function toJsonSchemaField(field: BuilderField): JsonSchemaField {
  const baseField: JsonSchemaField = {
    id: field.id.trim(),
    label: field.label.trim(),
    type: field.kind,
    placeholder: field.placeholder.trim() || undefined,
    default_value: field.defaultValue.trim() || undefined,
    start_column: field.startColumn,
    span: field.span,
    help_text: field.helpText.trim() || undefined,
    required: field.required,
    custom_classes: field.customClasses.trim() || undefined,
    style_preset: field.stylePreset === "plain" ? undefined : field.stylePreset,
  }

  const validation: NonNullable<JsonSchemaField["validation"]> = {}
  if (field.minLength.trim()) {
    validation.min_length = Number(field.minLength)
  }
  if (field.maxLength.trim()) {
    validation.max_length = Number(field.maxLength)
  }
  if (field.minValue.trim()) {
    validation.min_value = Number(field.minValue)
  }
  if (field.maxValue.trim()) {
    validation.max_value = Number(field.maxValue)
  }
  if (field.pattern.trim()) {
    validation.pattern = field.pattern.trim()
  }
  if (Object.keys(validation).length > 0) {
    baseField.validation = validation
  }

  if (field.kind === "select" || field.kind === "radio") {
    baseField.options = field.optionsText
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean)
  }

  return baseField
}

function fromJsonSchemaField(field: JsonSchemaField): BuilderField {
  const legacyWidth = (
    field as JsonSchemaField & {
      width?: "full" | "half" | "third" | "quarter"
    }
  ).width

  return {
    key: createFieldKey(),
    id: field.id,
    kind:
      field.type === "select" || field.type === "radio"
        ? field.type
        : normalizeKind(field.type),
    label: field.label,
    defaultValue: field.default_value ?? "",
    startColumn: field.start_column ?? 1,
    span:
      field.span ??
      (legacyWidth === "half"
        ? 6
        : legacyWidth === "third"
          ? 4
          : legacyWidth === "quarter"
            ? 3
            : 12),
    helpText: field.help_text ?? "",
    placeholder: field.placeholder ?? "",
    required: field.required ?? false,
    customClasses: field.custom_classes ?? "",
    stylePreset: field.style_preset ?? "plain",
    optionsText: field.options?.join(", ") ?? "",
    minLength: field.validation?.min_length?.toString() ?? "",
    maxLength: field.validation?.max_length?.toString() ?? "",
    minValue: field.validation?.min_value?.toString() ?? "",
    maxValue: field.validation?.max_value?.toString() ?? "",
    pattern: field.validation?.pattern ?? "",
  }
}

export function cloneStarterFields(): BuilderField[] {
  return starterBuilderFieldSeeds.map((field) => withFieldKey(field))
}

export function buildSchemaFromFields(fields: BuilderField[]): JsonSchema {
  return {
    fields: fields.map(toJsonSchemaField),
  }
}

export function builderFieldsFromSchema(
  schema?: JsonSchema | null,
): BuilderField[] {
  const rawFields =
    schema?.sections?.flatMap((section) => section.fields) ?? schema?.fields

  if (!rawFields?.length) {
    return cloneStarterFields()
  }

  return rawFields.map(fromJsonSchemaField)
}

export function designerDocumentFromBuilder(
  title: string,
  fields: BuilderField[],
): DesignerDocument {
  const document = cloneStarterDocument(title)
  document.sections[0].fields = fields
  document.sections[0].description =
    "Current draft fields from the existing flat schema."
  return document
}

function sectionFromJsonSchemaSection(
  section: JsonSchemaSection,
  index: number,
): DesignerSection {
  return {
    id: section.id || createSectionKey(),
    title: section.title || `Section ${index + 1}`,
    description: section.description ?? "",
    columns: 12,
    fields: section.fields.map(fromJsonSchemaField),
  }
}

export function builderStateFromDesigner(document: DesignerDocument): {
  title: string
  fields: BuilderField[]
} {
  return {
    title: document.settings.title,
    fields: document.sections.flatMap((section) => section.fields),
  }
}

export function builderFieldsFromDesigner(
  document: DesignerDocument,
): BuilderField[] {
  return document.sections.flatMap((section) => section.fields)
}

export function designerDocumentFromSchema(
  title: string,
  schema?: JsonSchema | null,
): DesignerDocument {
  if (schema?.sections?.length) {
    return {
      version: 2,
      settings: {
        title: schema.settings?.title ?? title,
        description: schema.settings?.description ?? "",
        submitLabel: schema.settings?.submitLabel ?? "Submit",
      },
      sections: schema.sections.map(sectionFromJsonSchemaSection),
    }
  }

  return designerDocumentFromBuilder(title, builderFieldsFromSchema(schema))
}

export function designerSectionsFromSchema(
  schema?: JsonSchema | null,
): DesignerSection[] {
  if (schema?.sections?.length) {
    return schema.sections.map(sectionFromJsonSchemaSection)
  }

  return [
    {
      id: createSectionKey(),
      title: "",
      description: "",
      columns: 12,
      fields: builderFieldsFromSchema(schema),
    },
  ]
}

export function buildSchemaFromDesigner(
  document: DesignerDocument,
): JsonSchema {
  return {
    version: 2,
    settings: {
      title: document.settings.title,
      description: document.settings.description || undefined,
      submitLabel: document.settings.submitLabel || undefined,
    },
    sections: document.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description || undefined,
      layout: {
        columns: section.columns,
      },
      fields: section.fields.map(toJsonSchemaField),
    })),
  }
}

function normalizeKind(type: JsonSchemaField["type"]): FieldKind {
  switch (type) {
    case "text":
    case "textarea":
    case "number":
    case "select":
    case "email":
    case "date":
    case "checkbox":
    case "radio":
      return type
    default:
      return "text"
  }
}

export function validateBuilderDraft(
  title: string,
  fields: BuilderField[],
): string | null {
  if (!title.trim()) {
    return "Form title is required."
  }
  if (!fields.length) {
    return "Add at least one field before saving."
  }

  const ids = new Set<string>()
  for (const field of fields) {
    const fieldId = field.id.trim()
    const fieldLabel = field.label.trim()

    if (!fieldLabel) {
      return "Every field needs a label."
    }
    if (!fieldId) {
      return "Every field needs an ID."
    }
    if (ids.has(fieldId)) {
      return "Field IDs must be unique."
    }
    ids.add(fieldId)

    if (
      (field.kind === "select" || field.kind === "radio") &&
      field.optionsText
        .split(",")
        .map((option) => option.trim())
        .filter(Boolean).length === 0
    ) {
      return `Select field "${fieldLabel}" needs at least one option.`
    }

    if (
      field.minLength.trim() &&
      field.maxLength.trim() &&
      Number(field.minLength) > Number(field.maxLength)
    ) {
      return `Field "${fieldLabel}" has a minimum length greater than its maximum length.`
    }
    if (
      field.minValue.trim() &&
      field.maxValue.trim() &&
      Number(field.minValue) > Number(field.maxValue)
    ) {
      return `Field "${fieldLabel}" has a minimum value greater than its maximum value.`
    }
    if (field.span < 1 || field.span > 12) {
      return `Field "${fieldLabel}" must span between 1 and 12 columns.`
    }
    if (field.startColumn < 1 || field.startColumn > 12) {
      return `Field "${fieldLabel}" must start between columns 1 and 12.`
    }
    if (field.startColumn + field.span - 1 > 12) {
      return `Field "${fieldLabel}" extends past column 12.`
    }
  }

  return null
}

export function validateDesignerDocument(
  document: DesignerDocument,
): string | null {
  if (!document.settings.title.trim()) {
    return "Form title is required."
  }
  if (!document.sections.length) {
    return "Add at least one section before saving."
  }

  const sectionIds = new Set<string>()
  const allFields = document.sections.flatMap((section) => section.fields)
  for (const [index, section] of document.sections.entries()) {
    const sectionId = section.id.trim()
    const sectionTitle = section.title.trim()
    if (!sectionTitle) {
      return `Section ${index + 1} needs a title.`
    }
    if (!sectionId) {
      return `Section "${sectionTitle}" needs an ID.`
    }
    if (sectionIds.has(sectionId)) {
      return "Section IDs must be unique."
    }
    sectionIds.add(sectionId)
  }

  return validateBuilderDraft(document.settings.title, allFields)
}
