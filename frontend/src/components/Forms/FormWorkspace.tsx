import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  ChevronDown,
  ClipboardCheck,
  Eye,
  History,
  Layers3,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
} from "lucide-react"
import { type ReactNode, useEffect, useMemo, useState } from "react"

import { dashboardPanelClass } from "@/components/Common/dashboard-surface"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useCustomToast from "@/hooks/useCustomToast"
import type { AuditLog, FormDetail } from "@/lib/forms-api"
import { formsApi } from "@/lib/forms-api"
import { cn } from "@/lib/utils"
import { FormDesigner } from "./FormDesigner"
import { RuntimeFormRenderer } from "./RuntimeFormRenderer"
import {
  type BuilderField,
  builderFieldsFromDesigner,
  builderFieldsFromSchema,
  buildSchemaFromDesigner,
  cloneStarterDocument,
  type DesignerDocument,
  designerDocumentFromSchema,
  designerSectionsFromSchema,
  validateDesignerDocument,
} from "./schema"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === "string" && error) {
    return error
  }
  return "Request failed."
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-[26px] border border-dashed border-border/65 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_94%,white),color-mix(in_oklab,var(--muted)_24%,transparent))] px-6 py-8 text-center">
      <p className="text-base font-semibold tracking-tight">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function ErrorState({
  title,
  error,
  onRetry,
}: {
  title: string
  error: unknown
  onRetry?: () => void
}) {
  return (
    <Alert
      variant="destructive"
      className="rounded-[24px] border-destructive/35 bg-destructive/8"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{getErrorMessage(error)}</p>
        {onRetry ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={onRetry}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}

function OverviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-[112px] items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/78 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="text-base font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">
        {eyebrow}
      </p>
      <div className="space-y-1">
        <h3 className="text-[1.35rem] font-semibold tracking-tight">{title}</h3>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground/90">
          {description}
        </p>
      </div>
    </div>
  )
}

function ExpandableSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string
  description: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_96%,white),color-mix(in_oklab,var(--muted)_18%,transparent))]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <p className="font-medium tracking-tight">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="rounded-full border border-border/60 bg-background/80 p-2 text-muted-foreground transition-transform group-open:rotate-180">
          <ChevronDown className="h-4 w-4" />
        </div>
      </summary>
      <div className="border-t border-border/55 px-5 py-5">{children}</div>
    </details>
  )
}

function BuilderSnapshot({
  selectedFormId,
  draftTitle,
  selectedForm,
  draftFieldsCount,
  hasUnsavedSchemaChanges,
  hasUnsavedTitleChanges,
}: {
  selectedFormId: string | null
  draftTitle: string
  selectedForm: FormDetail | null
  draftFieldsCount: number
  hasUnsavedSchemaChanges: boolean
  hasUnsavedTitleChanges: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/78 px-4 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full text-[10px]">
            Workspace
          </Badge>
          {selectedForm?.active_version ? (
            <Badge className="rounded-full text-[10px]">
              Published v{selectedForm.active_version.version_number}
            </Badge>
          ) : (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              New draft
            </Badge>
          )}
          {selectedForm?.draft_version ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Draft v{selectedForm.draft_version.version_number}
            </Badge>
          ) : null}
        </div>
        <h2 className="mt-1 truncate text-lg font-semibold tracking-tight">
          {draftTitle || "New form draft"}
        </h2>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {hasUnsavedTitleChanges ? (
          <Badge variant="secondary" className="rounded-full text-[10px]">
            Title changed
          </Badge>
        ) : null}
        {hasUnsavedSchemaChanges ? (
          <Badge variant="secondary" className="rounded-full text-[10px]">
            Schema changed
          </Badge>
        ) : null}
        <Badge variant="outline" className="rounded-full text-[10px]">
          {draftFieldsCount} field{draftFieldsCount === 1 ? "" : "s"}
        </Badge>
        <Badge variant="outline" className="rounded-full text-[10px]">
          {selectedFormId ? "Saved form" : "Unsaved form"}
        </Badge>
      </div>
    </div>
  )
}

type SchemaChange =
  | {
      type: "added"
      field: BuilderField
      index: number
    }
  | {
      type: "removed"
      field: BuilderField
      previousIndex: number
    }
  | {
      type: "updated"
      field: BuilderField
      previousField: BuilderField
      index: number
      changes: string[]
    }

function describeFieldChanges(
  nextField: BuilderField,
  previousField: BuilderField,
): string[] {
  const changes: string[] = []

  if (nextField.label !== previousField.label) {
    changes.push(`Label changed to "${nextField.label}"`)
  }
  if (nextField.kind !== previousField.kind) {
    changes.push(`Type changed from ${previousField.kind} to ${nextField.kind}`)
  }
  if (nextField.required !== previousField.required) {
    changes.push(nextField.required ? "Marked required" : "Made optional")
  }
  if (nextField.span !== previousField.span) {
    changes.push(`Span changed to ${nextField.span}`)
  }
  if (nextField.startColumn !== previousField.startColumn) {
    changes.push(`Start column changed to ${nextField.startColumn}`)
  }
  if (nextField.helpText !== previousField.helpText) {
    changes.push(nextField.helpText ? "Help text updated" : "Help text removed")
  }
  if (nextField.placeholder !== previousField.placeholder) {
    changes.push(
      nextField.placeholder ? "Placeholder updated" : "Placeholder removed",
    )
  }
  if (nextField.optionsText !== previousField.optionsText) {
    changes.push("Choice options updated")
  }
  if (nextField.minLength !== previousField.minLength) {
    changes.push(
      nextField.minLength
        ? `Min length set to ${nextField.minLength}`
        : "Min length removed",
    )
  }
  if (nextField.maxLength !== previousField.maxLength) {
    changes.push(
      nextField.maxLength
        ? `Max length set to ${nextField.maxLength}`
        : "Max length removed",
    )
  }
  if (nextField.minValue !== previousField.minValue) {
    changes.push(
      nextField.minValue
        ? `Min value set to ${nextField.minValue}`
        : "Min value removed",
    )
  }
  if (nextField.maxValue !== previousField.maxValue) {
    changes.push(
      nextField.maxValue
        ? `Max value set to ${nextField.maxValue}`
        : "Max value removed",
    )
  }
  if (nextField.pattern !== previousField.pattern) {
    changes.push(nextField.pattern ? "Pattern updated" : "Pattern removed")
  }

  return changes
}

function compareDraftToPublished(
  draftFields: BuilderField[],
  publishedFields: BuilderField[],
): SchemaChange[] {
  const publishedById = new Map(
    publishedFields.map(
      (field, index) => [field.id, { field, index }] as const,
    ),
  )
  const draftIds = new Set(draftFields.map((field) => field.id))
  const changes: SchemaChange[] = []

  draftFields.forEach((field, index) => {
    const previous = publishedById.get(field.id)
    if (!previous) {
      changes.push({ type: "added", field, index })
      return
    }

    const fieldChanges = describeFieldChanges(field, previous.field)
    if (previous.index !== index) {
      fieldChanges.push(
        `Moved from position ${previous.index + 1} to ${index + 1}`,
      )
    }

    if (fieldChanges.length) {
      changes.push({
        type: "updated",
        field,
        previousField: previous.field,
        index,
        changes: fieldChanges,
      })
    }
  })

  publishedFields.forEach((field, index) => {
    if (!draftIds.has(field.id)) {
      changes.push({ type: "removed", field, previousIndex: index })
    }
  })

  return changes
}

function DraftChangeList({
  draftFields,
  publishedFields,
}: {
  draftFields: BuilderField[]
  publishedFields: BuilderField[]
}) {
  const changes = compareDraftToPublished(draftFields, publishedFields)

  if (!publishedFields.length) {
    return (
      <div className="grid gap-3">
        <div className="rounded-[22px] border border-border/60 bg-background/65 px-4 py-4">
          <p className="font-medium tracking-tight">First published version</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This form does not have a published baseline yet. Publishing will
            create the first live version with {draftFields.length} field
            {draftFields.length === 1 ? "" : "s"}.
          </p>
        </div>
      </div>
    )
  }

  if (!changes.length) {
    return (
      <EmptyState
        title="No draft changes"
        description="The draft matches the currently published version."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {changes.map((change, index) => (
        <div
          key={`${change.type}-${change.field.id}-${index}`}
          className="rounded-[22px] border border-border/60 bg-background/65 px-4 py-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={change.type === "removed" ? "outline" : "secondary"}
              className="rounded-full capitalize"
            >
              {change.type}
            </Badge>
            <p className="font-medium tracking-tight">{change.field.label}</p>
            <Badge variant="outline" className="rounded-full uppercase">
              {change.field.kind}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {change.field.id}
          </p>
          {change.type === "added" ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Added at position {change.index + 1}.
            </p>
          ) : null}
          {change.type === "removed" ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Removed from published position {change.previousIndex + 1}.
            </p>
          ) : null}
          {change.type === "updated" ? (
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
              {change.changes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function HistoryList({ logs }: { logs: AuditLog[] }) {
  if (!logs.length) {
    return (
      <EmptyState
        title="No history yet"
        description="Update a submission to create an audit trail."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_92%,white),color-mix(in_oklab,var(--card)_84%,transparent))] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium">Submission updated</p>
            <p className="text-xs text-muted-foreground">
              {log.changed_at
                ? new Date(log.changed_at).toLocaleString()
                : "Unknown time"}
            </p>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-muted/35 p-4 text-xs leading-6">
            {JSON.stringify(log.changes, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  )
}

function formatSubmissionPreviewValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—"
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No"
  }
  return String(value)
}

function buildSubmissionPreview(submission: {
  data: Record<string, unknown>
}): string {
  const entries = Object.values(submission.data)
    .slice(0, 2)
    .map((value) => formatSubmissionPreviewValue(value))
    .filter((value) => value !== "—")

  if (!entries.length) {
    return "No captured values yet"
  }

  return entries.join(" • ")
}

export function FormWorkspace() {
  const queryClient = useQueryClient()
  const { showErrorToast, showSuccessToast } = useCustomToast()
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null)
  const [submissionSearch, setSubmissionSearch] = useState("")
  const [draftDocument, setDraftDocument] = useState<DesignerDocument>(
    cloneStarterDocument(),
  )
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null)
  const [submissionDraft, setSubmissionDraft] = useState<
    Record<string, unknown>
  >({})
  const [submissionErrors, setSubmissionErrors] = useState<
    Record<string, string>
  >({})

  const formsQuery = useQuery({
    queryKey: ["forms"],
    queryFn: formsApi.readForms,
  })

  const formDetailQuery = useQuery({
    queryKey: ["forms", selectedFormId],
    queryFn: () => formsApi.readForm(selectedFormId as string),
    enabled: Boolean(selectedFormId),
  })

  const submissionsQuery = useQuery({
    queryKey: ["forms", selectedFormId, "submissions"],
    queryFn: () => formsApi.readSubmissions(selectedFormId as string),
    enabled: Boolean(selectedFormId),
  })

  const historyQuery = useQuery({
    queryKey: ["forms", selectedFormId, "history", selectedSubmissionId],
    queryFn: () =>
      formsApi.readHistory(
        selectedFormId as string,
        selectedSubmissionId as string,
      ),
    enabled: Boolean(selectedFormId && selectedSubmissionId),
  })

  useEffect(() => {
    const forms = formsQuery.data?.data || []
    if (!forms.length) {
      return
    }
    if (!forms.some((form) => form.id === selectedFormId)) {
      setSelectedFormId(forms[0].id)
    }
  }, [formsQuery.data, selectedFormId])

  useEffect(() => {
    if (!formDetailQuery.data) {
      return
    }
    const nextDocument = designerDocumentFromSchema(
      formDetailQuery.data.draft_title ?? formDetailQuery.data.title,
      formDetailQuery.data.draft_version?.schema ??
        formDetailQuery.data.active_version?.schema,
    )
    setDraftDocument(nextDocument)
    const nextFields = builderFieldsFromDesigner(nextDocument)
    setSelectedFieldKey(nextFields[0]?.key ?? null)
  }, [formDetailQuery.data])

  const draftTitle = draftDocument.settings.title
  const draftFields = useMemo(
    () => builderFieldsFromDesigner(draftDocument),
    [draftDocument],
  )

  useEffect(() => {
    if (!draftFields.length) {
      setSelectedFieldKey(null)
      return
    }
    if (
      !selectedFieldKey ||
      !draftFields.some((field) => field.key === selectedFieldKey)
    ) {
      setSelectedFieldKey(draftFields[0]?.key ?? null)
    }
  }, [draftFields, selectedFieldKey])

  useEffect(() => {
    const submissions = submissionsQuery.data?.data || []
    if (!submissions.length) {
      setSelectedSubmissionId(null)
      setSubmissionDraft({})
      setSubmissionErrors({})
      return
    }

    const current =
      submissions.find(
        (submission) => submission.id === selectedSubmissionId,
      ) ?? submissions[0]

    if (current.id !== selectedSubmissionId) {
      setSelectedSubmissionId(current.id)
    }
    setSubmissionDraft(current.data)
    setSubmissionErrors({})
  }, [submissionsQuery.data, selectedSubmissionId])

  const selectedForm = formDetailQuery.data ?? null
  const hasDraftVersion = Boolean(selectedForm?.draft_version)
  const selectedSubmission =
    submissionsQuery.data?.data.find(
      (submission) => submission.id === selectedSubmissionId,
    ) ?? null

  const draftSchema = useMemo(
    () => buildSchemaFromDesigner(draftDocument),
    [draftDocument],
  )
  const publishedFields = useMemo(
    () => builderFieldsFromSchema(selectedForm?.active_version?.schema),
    [selectedForm?.active_version?.schema],
  )
  const publishedSections = useMemo(
    () => designerSectionsFromSchema(selectedForm?.active_version?.schema),
    [selectedForm?.active_version?.schema],
  )
  const publishedTitle = selectedForm?.title ?? ""
  const loadedSchema =
    selectedForm?.draft_version?.schema ??
    selectedForm?.active_version?.schema ??
    null
  const hasUnsavedSchemaChanges =
    Boolean(selectedFormId) &&
    JSON.stringify(draftSchema) !== JSON.stringify(loadedSchema)
  const loadedTitle = selectedForm?.draft_title ?? selectedForm?.title ?? ""
  const hasUnsavedTitleChanges =
    Boolean(selectedFormId) && draftTitle.trim() !== loadedTitle
  const selectedSubmissionVersion = selectedForm?.versions.find(
    (version) => version.id === selectedSubmission?.form_version_id,
  )
  const selectedSubmissionSections = useMemo(
    () => designerSectionsFromSchema(selectedSubmissionVersion?.schema),
    [selectedSubmissionVersion?.schema],
  )
  const filteredSubmissions = useMemo(() => {
    const submissions = submissionsQuery.data?.data || []
    const query = submissionSearch.trim().toLowerCase()
    if (!query) {
      return submissions
    }

    return submissions.filter((submission) => {
      const searchableValues = [
        submission.id,
        submission.form_version_id,
        submission.created_at ?? "",
        submission.updated_at ?? "",
        ...Object.values(submission.data).map((value) => String(value ?? "")),
      ]
      return searchableValues.some((value) =>
        value.toLowerCase().includes(query),
      )
    })
  }, [submissionSearch, submissionsQuery.data])

  const validateSubmissionFields = (fields: BuilderField[]) => {
    const nextErrors: Record<string, string> = {}

    for (const field of fields) {
      const value = submissionDraft[field.id]

      if (value === undefined || value === null || value === "") {
        if (field.required) {
          nextErrors[field.id] = `${field.label} is required.`
        }
        continue
      }

      if (field.kind === "text" || field.kind === "textarea") {
        const textValue = String(value)
        if (field.minLength && textValue.length < Number(field.minLength)) {
          nextErrors[field.id] =
            `${field.label} must be at least ${field.minLength} characters.`
          continue
        }
        if (field.maxLength && textValue.length > Number(field.maxLength)) {
          nextErrors[field.id] =
            `${field.label} must be at most ${field.maxLength} characters.`
          continue
        }
        if (field.pattern) {
          try {
            const pattern = new RegExp(field.pattern)
            if (!pattern.test(textValue)) {
              nextErrors[field.id] = `${field.label} is in an invalid format.`
            }
          } catch {
            nextErrors[field.id] =
              `${field.label} has an invalid validation pattern.`
          }
        }
      }

      if (field.kind === "email") {
        const textValue = String(value)
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(textValue)) {
          nextErrors[field.id] = `${field.label} must be a valid email address.`
          continue
        }
        if (field.minLength && textValue.length < Number(field.minLength)) {
          nextErrors[field.id] =
            `${field.label} must be at least ${field.minLength} characters.`
          continue
        }
        if (field.maxLength && textValue.length > Number(field.maxLength)) {
          nextErrors[field.id] =
            `${field.label} must be at most ${field.maxLength} characters.`
          continue
        }
      }

      if (field.kind === "date") {
        const textValue = String(value)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(textValue)) {
          nextErrors[field.id] = `${field.label} must be a valid date.`
          continue
        }
      }

      if (field.kind === "number") {
        const numericValue = typeof value === "number" ? value : Number(value)
        if (Number.isNaN(numericValue)) {
          nextErrors[field.id] = `${field.label} must be a number.`
          continue
        }
        if (field.minValue && numericValue < Number(field.minValue)) {
          nextErrors[field.id] =
            `${field.label} must be at least ${field.minValue}.`
          continue
        }
        if (field.maxValue && numericValue > Number(field.maxValue)) {
          nextErrors[field.id] =
            `${field.label} must be at most ${field.maxValue}.`
          continue
        }
      }

      if (
        (field.kind === "select" || field.kind === "radio") &&
        field.optionsText
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean).length > 0
      ) {
        const options = field.optionsText
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean)
        if (!options.includes(String(value))) {
          nextErrors[field.id] =
            `${field.label} must match one of the available options.`
        }
      }

      if (field.kind === "checkbox" && typeof value !== "boolean") {
        nextErrors[field.id] = `${field.label} must be true or false.`
      }
    }

    setSubmissionErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const createFormMutation = useMutation({
    mutationFn: formsApi.createForm,
    onSuccess: (form) => {
      showSuccessToast("Form created successfully")
      setSelectedFormId(form.id)
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      queryClient.invalidateQueries({ queryKey: ["forms", form.id] })
    },
    onError: (error) => showErrorToast(getErrorMessage(error)),
  })

  const updateFormMutation = useMutation({
    mutationFn: ({
      formId,
      title,
      schema,
    }: {
      formId: string
      title: string
      schema: ReturnType<typeof buildSchemaFromDesigner>
    }) => formsApi.updateForm(formId, { title, schema }),
    onSuccess: (form) => {
      showSuccessToast(
        form.draft_version
          ? `Saved draft for version ${form.draft_version.version_number}`
          : "Saved form details",
      )
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      queryClient.invalidateQueries({ queryKey: ["forms", form.id] })
    },
    onError: (error) => showErrorToast(getErrorMessage(error)),
  })

  const publishFormMutation = useMutation({
    mutationFn: (formId: string) => formsApi.publishForm(formId),
    onSuccess: (form) => {
      showSuccessToast(
        `Published version ${form.active_version?.version_number ?? "latest"}`,
      )
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      queryClient.invalidateQueries({ queryKey: ["forms", form.id] })
    },
    onError: (error) => showErrorToast(getErrorMessage(error)),
  })

  const deleteFormMutation = useMutation({
    mutationFn: (formId: string) => formsApi.deleteForm(formId),
    onSuccess: () => {
      showSuccessToast("Form deleted successfully")
      resetDraft()
      queryClient.invalidateQueries({ queryKey: ["forms"] })
    },
    onError: (error) => showErrorToast(getErrorMessage(error)),
  })

  const createSubmissionMutation = useMutation({
    mutationFn: ({
      formId,
      versionId,
      data,
    }: {
      formId: string
      versionId: string
      data: Record<string, unknown>
    }) =>
      formsApi.createSubmission(formId, { form_version_id: versionId, data }),
    onSuccess: (submission) => {
      showSuccessToast("Submission saved")
      setSelectedSubmissionId(submission.id)
      queryClient.invalidateQueries({
        queryKey: ["forms", submission.form_id, "submissions"],
      })
    },
    onError: (error) => showErrorToast(getErrorMessage(error)),
  })

  const updateSubmissionMutation = useMutation({
    mutationFn: ({
      formId,
      submissionId,
      data,
    }: {
      formId: string
      submissionId: string
      data: Record<string, unknown>
    }) => formsApi.updateSubmission(formId, submissionId, data),
    onSuccess: (submission) => {
      showSuccessToast("Submission updated")
      queryClient.invalidateQueries({
        queryKey: ["forms", submission.form_id, "submissions"],
      })
      queryClient.invalidateQueries({
        queryKey: ["forms", submission.form_id, "history", submission.id],
      })
    },
    onError: (error) => showErrorToast(getErrorMessage(error)),
  })

  const resetDraft = () => {
    setSelectedFormId(null)
    setSelectedSubmissionId(null)
    const nextDocument = cloneStarterDocument()
    setDraftDocument(nextDocument)
    const nextFields = builderFieldsFromDesigner(nextDocument)
    setSelectedFieldKey(nextFields[0]?.key ?? null)
    setSubmissionDraft({})
  }

  const handleSaveDraft = () => {
    const validationError = validateDesignerDocument(draftDocument)
    if (validationError) {
      showErrorToast(validationError)
      return
    }

    const title = draftTitle.trim()
    if (!selectedFormId) {
      createFormMutation.mutate({ title, schema: draftSchema })
      return
    }

    updateFormMutation.mutate({
      formId: selectedFormId,
      title,
      schema: draftSchema,
    })
  }

  const handlePublishForm = async () => {
    const validationError = validateDesignerDocument(draftDocument)
    if (validationError) {
      showErrorToast(validationError)
      return
    }
    if (!selectedFormId) {
      showErrorToast("Create the form first before publishing a version.")
      return
    }

    try {
      let latestForm = selectedForm
      if (hasUnsavedSchemaChanges || hasUnsavedTitleChanges) {
        latestForm = await updateFormMutation.mutateAsync({
          formId: selectedFormId,
          title: draftTitle.trim(),
          schema: draftSchema,
        })
      }

      if (!latestForm?.draft_version) {
        showSuccessToast("There is no unpublished schema version to publish.")
        return
      }

      await publishFormMutation.mutateAsync(selectedFormId)
    } catch {
      // Mutation toasts already surface the specific failure.
    }
  }

  const handleCreateSubmission = () => {
    if (!selectedFormId || !selectedForm?.active_version) {
      showErrorToast("Choose a saved form before creating a submission.")
      return
    }
    if (!validateSubmissionFields(publishedFields)) {
      showErrorToast("Please fix the validation errors before saving.")
      return
    }

    createSubmissionMutation.mutate({
      formId: selectedFormId,
      versionId: selectedForm.active_version.id,
      data: submissionDraft,
    })
  }

  const handleUpdateSubmission = () => {
    if (!selectedFormId || !selectedSubmissionId) {
      showErrorToast("Choose an existing submission before updating it.")
      return
    }
    if (!validateSubmissionFields(publishedFields)) {
      showErrorToast("Please fix the validation errors before updating.")
      return
    }

    updateSubmissionMutation.mutate({
      formId: selectedFormId,
      submissionId: selectedSubmissionId,
      data: submissionDraft,
    })
  }

  return (
    <CardContent className="grid gap-6 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--primary)_7%,white),transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_98%,white),color-mix(in_oklab,var(--muted)_14%,transparent))] p-4 sm:gap-8 sm:p-6 xl:p-8">
      <div className="grid gap-6 sm:gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border/60 bg-background/82 px-4 py-3 shadow-[0_18px_38px_-34px_color-mix(in_oklab,var(--foreground)_24%,transparent)]">
          <button
            type="button"
            onClick={() => {
              if (selectedFormId) {
                setSelectedFormId(selectedFormId)
              } else {
                resetDraft()
              }
            }}
            className="min-w-0 text-left"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
              Main Form
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold tracking-tight">
                {draftTitle || selectedForm?.title || "Untitled draft"}
              </h2>
              <Badge variant="outline" className="rounded-full">
                {selectedFormId ? "Saved" : "Draft"}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                {draftFields.length} field{draftFields.length === 1 ? "" : "s"}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {selectedForm?.draft_version
                  ? `Draft v${selectedForm.draft_version.version_number}`
                  : "Unpublished"}
              </Badge>
            </div>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full px-3"
                aria-label="Open form workspace menu"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2">
              <DropdownMenuLabel className="px-2 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem className="rounded-lg" onSelect={resetDraft}>
                <Plus className="h-4 w-4" />
                New Blank Form
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg"
                onSelect={() => formsQuery.refetch()}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh Library
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="rounded-lg"
                disabled={!selectedFormId || deleteFormMutation.isPending}
                onSelect={() => {
                  if (selectedFormId) {
                    deleteFormMutation.mutate(selectedFormId)
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center justify-between px-2 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Library
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {formsQuery.data?.count ?? 0}
                </Badge>
              </DropdownMenuLabel>
              {formsQuery.isError ? (
                <DropdownMenuItem
                  className="rounded-lg text-destructive"
                  onSelect={() => formsQuery.refetch()}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Retry loading forms
                </DropdownMenuItem>
              ) : null}
              {!formsQuery.isLoading && !formsQuery.data?.data.length ? (
                <DropdownMenuItem disabled className="rounded-lg">
                  No forms yet
                </DropdownMenuItem>
              ) : null}
              {(formsQuery.data?.data || []).map((form) => (
                <DropdownMenuItem
                  key={form.id}
                  className="items-start rounded-lg py-2"
                  onSelect={() => setSelectedFormId(form.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium tracking-tight">
                      {form.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {form.updated_at
                        ? new Date(form.updated_at).toLocaleString()
                        : "Recently updated"}
                    </p>
                  </div>
                  {selectedFormId === form.id ? (
                    <Badge className="rounded-full px-2.5">Active</Badge>
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
          <BuilderSnapshot
            selectedFormId={selectedFormId}
            draftTitle={draftTitle}
            selectedForm={selectedForm}
            draftFieldsCount={draftFields.length}
            hasUnsavedSchemaChanges={hasUnsavedSchemaChanges}
            hasUnsavedTitleChanges={hasUnsavedTitleChanges}
          />
          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[420px]">
            <OverviewMetric
              label="Forms"
              value={String(formsQuery.data?.count ?? 0)}
            />
            <OverviewMetric
              label="Draft Fields"
              value={String(draftFields.length)}
            />
            <OverviewMetric
              label="Submissions"
              value={String(submissionsQuery.data?.count ?? 0)}
            />
          </div>
        </div>

        {formDetailQuery.isError ? (
          <ErrorState
            title="Could not load form details"
            error={formDetailQuery.error}
            onRetry={() => formDetailQuery.refetch()}
          />
        ) : null}

        <Tabs defaultValue="builder" className="grid gap-6">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-[24px] border border-border/60 bg-background/72 p-1.5 shadow-[0_18px_34px_-28px_color-mix(in_oklab,var(--foreground)_24%,transparent)]">
            <TabsTrigger value="builder">
              <Layers3 className="h-4 w-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="submissions">
              <ClipboardCheck className="h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="grid gap-6">
            <div
              className={cn(
                dashboardPanelClass,
                "rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_95%,white),color-mix(in_oklab,var(--card)_82%,transparent))] p-5 shadow-[0_28px_58px_-42px_color-mix(in_oklab,var(--foreground)_20%,transparent)] sm:p-7",
              )}
            >
              <div className="grid gap-6">
                <SectionIntro
                  eyebrow="Designer"
                  title="Form builder studio"
                  description="Use the field library, drag-and-drop canvas, and live properties panel to shape the draft before saving or publishing."
                />

                <FormDesigner
                  document={draftDocument}
                  setDocument={setDraftDocument}
                  selectedFieldKey={selectedFieldKey}
                  setSelectedFieldKey={setSelectedFieldKey}
                />

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
                  <ExpandableSection
                    title="Draft and publish controls"
                    description="Save the current draft, then publish it when the structure and copy are ready for real responses."
                    defaultOpen
                  >
                    <div className="grid gap-5">
                      <div className="grid gap-3 rounded-[22px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_94%,white),color-mix(in_oklab,var(--muted)_24%,transparent))] px-4 py-4 text-sm text-muted-foreground">
                        <p>
                          Published version ID:
                          <span className="ml-2 font-mono text-xs text-foreground">
                            {selectedForm?.active_version?.id ??
                              "Not created yet"}
                          </span>
                        </p>
                        <p>
                          Draft version ID:
                          <span className="ml-2 font-mono text-xs text-foreground">
                            {selectedForm?.draft_version?.id ??
                              "No draft saved"}
                          </span>
                        </p>
                        <p>
                          Form ID:
                          <span className="ml-2 font-mono text-xs text-foreground">
                            {selectedForm?.id ?? "Draft"}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <LoadingButton
                          onClick={handleSaveDraft}
                          loading={
                            createFormMutation.isPending ||
                            updateFormMutation.isPending
                          }
                          className="min-w-36 rounded-xl shadow-sm"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {selectedFormId ? "Save Draft" : "Create Form"}
                        </LoadingButton>
                        <LoadingButton
                          variant="outline"
                          onClick={handlePublishForm}
                          loading={publishFormMutation.isPending}
                          disabled={
                            !selectedFormId ||
                            (!hasDraftVersion &&
                              !hasUnsavedSchemaChanges &&
                              !hasUnsavedTitleChanges)
                          }
                          className="min-w-36 rounded-xl bg-background/80"
                        >
                          Publish Version
                        </LoadingButton>
                      </div>
                    </div>
                  </ExpandableSection>

                  <ExpandableSection
                    title="Builder guidance"
                    description="A few practical notes for keeping the form easy to edit and easy to complete."
                    defaultOpen
                  >
                    <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
                      <p>
                        Keep related fields grouped inside short sections so the
                        canvas stays readable.
                      </p>
                      <p>
                        Use compact-width fields for pairs like dates, emails,
                        and small numbers.
                      </p>
                      <p>
                        Switch to preview mode often to check the responsive
                        3-column, 2-column, and mobile layouts.
                      </p>
                    </div>
                  </ExpandableSection>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="preview"
            className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.8fr)]"
          >
            <div
              className={cn(
                dashboardPanelClass,
                "rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_95%,white),color-mix(in_oklab,var(--card)_86%,transparent))] p-7 shadow-[0_24px_52px_-40px_color-mix(in_oklab,var(--foreground)_18%,transparent)]",
              )}
            >
              <SectionIntro
                eyebrow="Preview"
                title="Experience the current draft"
                description="This preview shows the draft you are editing. It stays separate from the live response flow until you publish."
              />
              <Separator className="my-4" />
              <div className="rounded-[30px] border border-border/60 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_8%,white),transparent_32%),linear-gradient(180deg,color-mix(in_oklab,white_84%,transparent),color-mix(in_oklab,var(--background)_88%,transparent))] p-6 shadow-[0_18px_40px_-34px_color-mix(in_oklab,var(--foreground)_26%,transparent)]">
                <div className="mb-6 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Draft preview
                  </p>
                  <h4 className="text-2xl font-semibold tracking-tight">
                    {draftTitle || "Untitled form"}
                  </h4>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Review the unpublished structure before saving or publishing
                    it.
                  </p>
                </div>
                <RuntimeFormRenderer
                  sections={draftDocument.sections}
                  values={submissionDraft}
                  readOnly
                />
              </div>
            </div>

            <div className="grid gap-5">
              <div
                className={cn(
                  dashboardPanelClass,
                  "rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,white),color-mix(in_oklab,var(--card)_86%,transparent))] p-6",
                )}
              >
                <SectionIntro
                  eyebrow="Checklist"
                  title="Preview review"
                  description="Use this pass to decide whether the draft feels calm, legible, and ready to publish."
                />
                <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
                  <p>
                    Use half-width fields for compact pairs like names, dates,
                    and small numeric inputs.
                  </p>
                  <p>
                    Keep labels short and keep help text focused on what the
                    user needs right now.
                  </p>
                  <p>
                    Prefer select or radio when the answer set should stay
                    controlled over time.
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  dashboardPanelClass,
                  "rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,white),color-mix(in_oklab,var(--card)_86%,transparent))] p-6",
                )}
              >
                <SectionIntro
                  eyebrow="Compare"
                  title="Published baseline"
                  description="Keep the live version in view while you inspect the draft."
                />
                <div className="mt-5 grid gap-3 rounded-[22px] border border-border/60 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
                  <p>
                    Published title:
                    <span className="ml-2 font-medium text-foreground">
                      {publishedTitle || "No published title yet"}
                    </span>
                  </p>
                  <p>
                    Published fields:
                    <span className="ml-2 font-medium text-foreground">
                      {publishedFields.length}
                    </span>
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  dashboardPanelClass,
                  "rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,white),color-mix(in_oklab,var(--card)_86%,transparent))] p-6",
                )}
              >
                <SectionIntro
                  eyebrow="Changes"
                  title="Draft vs published"
                  description="See exactly what will change before the next publish."
                />
                <div className="mt-5">
                  <DraftChangeList
                    draftFields={draftFields}
                    publishedFields={publishedFields}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="submissions"
            className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(400px,0.95fr)]"
          >
            <div className="grid gap-6">
              <div
                className={cn(
                  dashboardPanelClass,
                  "rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_95%,white),color-mix(in_oklab,var(--card)_86%,transparent))] p-7",
                )}
              >
                <SectionIntro
                  eyebrow="Submissions"
                  title="Test the published response flow"
                  description="This area always uses the active published version. Draft changes should not appear here until you publish them."
                />
                <Separator className="my-4" />
                <ExpandableSection
                  title="Published form context"
                  description="Confirm exactly what is live before you save or update a response."
                  defaultOpen
                >
                  <div className="grid gap-2 text-sm text-muted-foreground">
                    <p>
                      Published form:
                      <span className="ml-2 font-medium text-foreground">
                        {publishedTitle || "No published title yet"}
                      </span>
                    </p>
                    <p>
                      Published fields:
                      <span className="ml-2 font-medium text-foreground">
                        {publishedFields.length}
                      </span>
                    </p>
                  </div>
                </ExpandableSection>
                <div className="mt-5">
                  <RuntimeFormRenderer
                    sections={publishedSections}
                    values={submissionDraft}
                    errors={submissionErrors}
                    onChange={(fieldId, value) => {
                      setSubmissionDraft((current) => ({
                        ...current,
                        [fieldId]: value,
                      }))
                      setSubmissionErrors((current) => {
                        const next = { ...current }
                        delete next[fieldId]
                        return next
                      })
                    }}
                  />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <LoadingButton
                    onClick={handleCreateSubmission}
                    loading={createSubmissionMutation.isPending}
                    className="rounded-xl shadow-sm"
                  >
                    Save Submission
                  </LoadingButton>
                  <LoadingButton
                    variant="outline"
                    onClick={handleUpdateSubmission}
                    loading={updateSubmissionMutation.isPending}
                    className="rounded-xl bg-background/80"
                  >
                    Update Submission
                  </LoadingButton>
                </div>
              </div>

              <div
                className={cn(
                  dashboardPanelClass,
                  "rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_95%,white),color-mix(in_oklab,var(--card)_87%,transparent))] p-6",
                )}
              >
                <SectionIntro
                  eyebrow="Responses"
                  title="Find saved answers"
                  description="Search by ID, timestamps, or captured values, then open the matching response beside the table."
                />
                <Separator className="my-4" />
                {submissionsQuery.isError ? (
                  <ErrorState
                    title="Could not load submissions"
                    error={submissionsQuery.error}
                    onRetry={() => submissionsQuery.refetch()}
                  />
                ) : !submissionsQuery.data?.data.length ? (
                  <EmptyState
                    title="No submissions yet"
                    description="Save a submission to start testing updates and history."
                  />
                ) : (
                  <div className="grid gap-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={submissionSearch}
                        onChange={(event) =>
                          setSubmissionSearch(event.target.value)
                        }
                        placeholder="Search by ID, value, or timestamp"
                        className="h-11 rounded-xl bg-background/75 pl-10"
                      />
                    </div>

                    <div className="grid gap-3 md:hidden">
                      {filteredSubmissions.length ? (
                        filteredSubmissions.map((submission) => (
                          <button
                            key={submission.id}
                            type="button"
                            className={cn(
                              "rounded-[22px] border px-4 py-4 text-left transition-all",
                              selectedSubmissionId === submission.id
                                ? "border-primary/70 bg-primary/8 shadow-[0_18px_34px_-30px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                                : "border-border/60 bg-background/70",
                            )}
                            onClick={() =>
                              setSelectedSubmissionId(submission.id)
                            }
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="rounded-full">
                                {submission.id.slice(0, 8)}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="rounded-full"
                              >
                                v
                                {selectedForm?.versions.find(
                                  (version) =>
                                    version.id === submission.form_version_id,
                                )?.version_number ?? "?"}
                              </Badge>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                              {buildSubmissionPreview(submission)}
                            </p>
                            <p className="mt-3 text-xs text-muted-foreground">
                              {submission.updated_at
                                ? new Date(
                                    submission.updated_at,
                                  ).toLocaleString()
                                : "Unknown"}
                            </p>
                          </button>
                        ))
                      ) : (
                        <EmptyState
                          title="No submissions match"
                          description="Try a broader search to find saved responses."
                        />
                      )}
                    </div>

                    <div className="hidden overflow-hidden rounded-[24px] border border-border/60 bg-background/70 shadow-[0_22px_44px_-38px_color-mix(in_oklab,var(--foreground)_18%,transparent)] md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Submission</TableHead>
                            <TableHead>Preview</TableHead>
                            <TableHead>Updated</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSubmissions.length ? (
                            filteredSubmissions.map((submission) => (
                              <TableRow
                                key={submission.id}
                                className={cn(
                                  "cursor-pointer transition-colors",
                                  selectedSubmissionId === submission.id &&
                                    "bg-primary/8 shadow-[inset_3px_0_0_0_var(--primary)]",
                                )}
                                onClick={() =>
                                  setSelectedSubmissionId(submission.id)
                                }
                              >
                                <TableCell className="whitespace-normal">
                                  <div className="space-y-1">
                                    <p className="font-medium">
                                      {submission.id.slice(0, 8)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      v
                                      {selectedForm?.versions.find(
                                        (version) =>
                                          version.id ===
                                          submission.form_version_id,
                                      )?.version_number ?? "?"}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[280px] whitespace-normal text-muted-foreground">
                                  {buildSubmissionPreview(submission)}
                                </TableCell>
                                <TableCell className="whitespace-normal text-sm">
                                  {submission.updated_at
                                    ? new Date(
                                        submission.updated_at,
                                      ).toLocaleString()
                                    : "Unknown"}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="py-8 text-center text-sm text-muted-foreground"
                              >
                                No submissions match your search.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className={cn(
                dashboardPanelClass,
                "rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_95%,white),color-mix(in_oklab,var(--card)_87%,transparent))] p-6",
              )}
            >
              <SectionIntro
                eyebrow="Detail"
                title="Read the selected response"
                description="This panel renders answers against the exact version they were submitted with so older history stays trustworthy."
              />
              <Separator className="my-4" />
              {selectedSubmission ? (
                <div className="grid gap-4">
                  <ExpandableSection
                    title="Submission metadata"
                    description="Reference the response identity, version, and timestamps before reviewing field values."
                    defaultOpen
                  >
                    <div className="grid gap-3 text-sm text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full">
                          Submission
                        </Badge>
                        <Badge className="rounded-full">
                          v{selectedSubmissionVersion?.version_number ?? "?"}
                        </Badge>
                      </div>
                      <p className="font-mono text-xs text-foreground">
                        {selectedSubmission.id}
                      </p>
                      <p>
                        Created:
                        <span className="ml-2 text-foreground">
                          {selectedSubmission.created_at
                            ? new Date(
                                selectedSubmission.created_at,
                              ).toLocaleString()
                            : "Unknown"}
                        </span>
                      </p>
                      <p>
                        Updated:
                        <span className="ml-2 text-foreground">
                          {selectedSubmission.updated_at
                            ? new Date(
                                selectedSubmission.updated_at,
                              ).toLocaleString()
                            : "Unknown"}
                        </span>
                      </p>
                    </div>
                  </ExpandableSection>

                  <ExpandableSection
                    title="Captured answers"
                    description="Read the response as a clean version-bound snapshot."
                    defaultOpen
                  >
                    <RuntimeFormRenderer
                      sections={selectedSubmissionSections}
                      values={selectedSubmission.data}
                      readOnly
                      layout="single"
                    />
                  </ExpandableSection>
                </div>
              ) : (
                <EmptyState
                  title="No response selected"
                  description="Choose a saved submission from the list to inspect its version-bound data."
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div
              className={cn(
                dashboardPanelClass,
                "rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,white),color-mix(in_oklab,var(--card)_86%,transparent))] p-7",
              )}
            >
              <SectionIntro
                eyebrow="History"
                title="Audit the selected response"
                description="Use the submission selected in the responses area, then inspect the saved before-and-after changes here."
              />
              <Separator className="my-4" />
              {!selectedSubmissionId ? (
                <EmptyState
                  title="No submission selected"
                  description="Choose a submission from the Submissions tab to inspect audit history."
                />
              ) : historyQuery.isError ? (
                <ErrorState
                  title="Could not load history"
                  error={historyQuery.error}
                  onRetry={() => historyQuery.refetch()}
                />
              ) : (
                <HistoryList logs={historyQuery.data?.data || []} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CardContent>
  )
}
