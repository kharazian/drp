import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { arrayMove } from "@dnd-kit/sortable"
import {
  AlertCircle,
  ClipboardCheck,
  Eye,
  History,
  Layers3,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  dashboardPanelClass,
  dashboardPanelDenseClass,
} from "@/components/Common/dashboard-surface"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { cn } from "@/lib/utils"
import type { AuditLog } from "@/lib/forms-api"
import { formsApi } from "@/lib/forms-api"
import { FieldBuilderList } from "./FieldBuilderList"
import { RuntimeFormRenderer } from "./RuntimeFormRenderer"
import {
  type BuilderField,
  buildSchemaFromFields,
  builderFieldsFromSchema,
  cloneStarterFields,
  createEmptyField,
  validateBuilderDraft,
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
    <div className="rounded-2xl border border-dashed border-border/65 p-6 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
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
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{getErrorMessage(error)}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
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
    <div className={cn(dashboardPanelDenseClass, "rounded-[24px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,white),color-mix(in_oklab,var(--card)_84%,transparent))]")}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
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
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary/80">
        {eyebrow}
      </p>
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
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
        <div key={log.id} className="rounded-2xl border border-border/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium">Submission updated</p>
            <p className="text-xs text-muted-foreground">
              {log.changed_at
                ? new Date(log.changed_at).toLocaleString()
                : "Unknown time"}
            </p>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-muted/35 p-3 text-xs">
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

function buildSubmissionPreview(submission: { data: Record<string, unknown> }): string {
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
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)
  const [submissionSearch, setSubmissionSearch] = useState("")
  const [draftTitle, setDraftTitle] = useState("")
  const [draftFields, setDraftFields] = useState<BuilderField[]>(cloneStarterFields())
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null)
  const [submissionDraft, setSubmissionDraft] = useState<Record<string, unknown>>({})
  const [submissionErrors, setSubmissionErrors] = useState<Record<string, string>>({})

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
      formsApi.readHistory(selectedFormId as string, selectedSubmissionId as string),
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
    setDraftTitle(formDetailQuery.data.draft_title ?? formDetailQuery.data.title)
    const nextFields = builderFieldsFromSchema(
      formDetailQuery.data.draft_version?.schema ??
        formDetailQuery.data.active_version?.schema,
    )
    setDraftFields(nextFields)
    setSelectedFieldKey(nextFields[0]?.key ?? null)
  }, [formDetailQuery.data])

  useEffect(() => {
    if (!draftFields.length) {
      setSelectedFieldKey(null)
      return
    }
    if (!selectedFieldKey || !draftFields.some((field) => field.key === selectedFieldKey)) {
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
      submissions.find((submission) => submission.id === selectedSubmissionId) ??
      submissions[0]

    if (current.id !== selectedSubmissionId) {
      setSelectedSubmissionId(current.id)
    }
    setSubmissionDraft(current.data)
    setSubmissionErrors({})
  }, [submissionsQuery.data, selectedSubmissionId])

  const selectedForm = formDetailQuery.data ?? null
  const hasDraftVersion = Boolean(selectedForm?.draft_version)
  const selectedFieldIndex = selectedFieldKey
    ? draftFields.findIndex((field) => field.key === selectedFieldKey)
    : -1
  const selectedField = draftFields[selectedFieldIndex] ?? null
  const selectedSubmission =
    submissionsQuery.data?.data.find(
      (submission) => submission.id === selectedSubmissionId,
    ) ?? null

  const draftSchema = useMemo(
    () => buildSchemaFromFields(draftFields),
    [draftFields],
  )
  const publishedFields = useMemo(
    () => builderFieldsFromSchema(selectedForm?.active_version?.schema),
    [selectedForm?.active_version?.schema],
  )
  const publishedTitle = selectedForm?.title ?? ""
  const loadedSchema =
    selectedForm?.draft_version?.schema ?? selectedForm?.active_version?.schema ?? null
  const hasUnsavedSchemaChanges =
    Boolean(selectedFormId) &&
    JSON.stringify(draftSchema) !== JSON.stringify(loadedSchema)
  const loadedTitle = selectedForm?.draft_title ?? selectedForm?.title ?? ""
  const hasUnsavedTitleChanges =
    Boolean(selectedFormId) && draftTitle.trim() !== loadedTitle
  const selectedSubmissionVersion = selectedForm?.versions.find(
    (version) => version.id === selectedSubmission?.form_version_id,
  )
  const selectedSubmissionFields = useMemo(
    () => builderFieldsFromSchema(selectedSubmissionVersion?.schema),
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
          nextErrors[field.id] = `${field.label} must be at least ${field.minLength} characters.`
          continue
        }
        if (field.maxLength && textValue.length > Number(field.maxLength)) {
          nextErrors[field.id] = `${field.label} must be at most ${field.maxLength} characters.`
          continue
        }
        if (field.pattern) {
          try {
            const pattern = new RegExp(field.pattern)
            if (!pattern.test(textValue)) {
              nextErrors[field.id] = `${field.label} is in an invalid format.`
            }
          } catch {
            nextErrors[field.id] = `${field.label} has an invalid validation pattern.`
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
          nextErrors[field.id] = `${field.label} must be at least ${field.minLength} characters.`
          continue
        }
        if (field.maxLength && textValue.length > Number(field.maxLength)) {
          nextErrors[field.id] = `${field.label} must be at most ${field.maxLength} characters.`
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
          nextErrors[field.id] = `${field.label} must be at least ${field.minValue}.`
          continue
        }
        if (field.maxValue && numericValue > Number(field.maxValue)) {
          nextErrors[field.id] = `${field.label} must be at most ${field.maxValue}.`
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
          nextErrors[field.id] = `${field.label} must match one of the available options.`
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
      schema: ReturnType<typeof buildSchemaFromFields>
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
    }) => formsApi.createSubmission(formId, { form_version_id: versionId, data }),
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
    setDraftTitle("")
    const nextFields = cloneStarterFields()
    setDraftFields(nextFields)
    setSelectedFieldKey(nextFields[0]?.key ?? null)
    setSubmissionDraft({})
  }

  const updateSelectedField = (updater: (field: BuilderField) => BuilderField) => {
    if (!selectedFieldKey) {
      return
    }

    setDraftFields((current) =>
      current.map((field) =>
        field.key === selectedFieldKey ? updater(field) : field,
      ),
    )
  }

  const handleReorderFields = (activeKey: string, overKey: string) => {
    setDraftFields((current) => {
      const activeIndex = current.findIndex((field) => field.key === activeKey)
      const overIndex = current.findIndex((field) => field.key === overKey)

      if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
        return current
      }

      return arrayMove(current, activeIndex, overIndex)
    })
  }

  const handleSaveDraft = () => {
    const validationError = validateBuilderDraft(draftTitle, draftFields)
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
    const validationError = validateBuilderDraft(draftTitle, draftFields)
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
    <CardContent className="grid gap-8 p-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:p-8">
      <aside className="grid gap-5">
        <div className="rounded-[30px] border border-border/60 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_16%,white),transparent_38%),linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,white),color-mix(in_oklab,var(--card)_82%,transparent))] p-6 shadow-[0_24px_48px_-36px_color-mix(in_oklab,var(--primary)_42%,transparent)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
            Form Library
          </p>
          <h2 className="mt-3 text-[2rem] font-semibold tracking-tight">
            Builder workspace
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Create forms from field rows, publish structure through versions, and
            validate the result with live submissions.
          </p>
          <div className="mt-6 grid gap-2.5">
            <Button variant="outline" className="h-11 justify-start rounded-xl bg-background/75" onClick={resetDraft}>
              <Plus className="mr-2 h-4 w-4" />
              New Blank Form
            </Button>
            <Button
              variant="outline"
              className="h-11 justify-start rounded-xl bg-background/75"
              onClick={() => formsQuery.refetch()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh Library
            </Button>
            <Button
              variant="outline"
              className="h-11 justify-start rounded-xl bg-background/75 text-destructive hover:text-destructive"
              disabled={!selectedFormId || deleteFormMutation.isPending}
              onClick={() => {
                if (selectedFormId) {
                  deleteFormMutation.mutate(selectedFormId)
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </div>

        {formsQuery.isError ? (
          <ErrorState
            title="Could not load forms"
            error={formsQuery.error}
            onRetry={() => formsQuery.refetch()}
          />
        ) : null}

        {!formsQuery.isLoading && !formsQuery.data?.data.length ? (
          <EmptyState
            title="No forms yet"
            description="Create a blank form and start adding fields."
          />
        ) : null}

        <div className="grid gap-3">
          {(formsQuery.data?.data || []).map((form) => (
            <button
              key={form.id}
              type="button"
              onClick={() => setSelectedFormId(form.id)}
              className={cn(
                "rounded-[24px] border px-4 py-4 text-left transition-all",
                selectedFormId === form.id
                  ? "border-primary/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_9%,white),color-mix(in_oklab,var(--card)_88%,transparent))] shadow-[0_20px_36px_-28px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
                  : "border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_92%,white),color-mix(in_oklab,var(--card)_84%,transparent))] hover:border-border hover:bg-muted/25",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{form.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {form.updated_at
                      ? new Date(form.updated_at).toLocaleString()
                      : "Recently updated"}
                  </p>
                </div>
                {selectedFormId === form.id ? <Badge>Active</Badge> : null}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="grid gap-8">
        <div className="grid gap-4 md:grid-cols-3">
          <OverviewMetric label="Forms" value={String(formsQuery.data?.count ?? 0)} />
          <OverviewMetric
            label="Draft Fields"
            value={String(draftFields.length)}
          />
          <OverviewMetric
            label="Submissions"
            value={String(submissionsQuery.data?.count ?? 0)}
          />
        </div>

        <div className={cn(dashboardPanelClass, "overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--primary)_10%,white),transparent_34%),linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,white),color-mix(in_oklab,var(--card)_84%,transparent))] p-7")}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Selected Form</Badge>
                {selectedForm?.active_version ? (
                  <Badge>Published v{selectedForm.active_version.version_number}</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
                {selectedForm?.draft_version ? (
                  <Badge variant="secondary">
                    Draft v{selectedForm.draft_version.version_number}
                  </Badge>
                ) : null}
              </div>
              <h3 className="mt-4 text-[2.35rem] font-semibold tracking-tight">
                {draftTitle || "New form draft"}
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                Save draft edits without changing the live version, then publish
                when the structure is ready for real submissions.
              </p>
              {selectedForm?.draft_title && selectedForm.draft_title !== selectedForm.title ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Published title:
                  <span className="ml-2 font-medium text-foreground">
                    {selectedForm.title}
                  </span>
                </p>
              ) : null}
            </div>
            <div className="grid gap-2 rounded-[22px] border border-border/60 bg-background/65 px-4 py-4 text-sm shadow-[0_14px_32px_-30px_color-mix(in_oklab,var(--foreground)_30%,transparent)]">
              <p>
                Published Version ID:
                <span className="ml-2 font-mono text-xs">
                  {selectedForm?.active_version?.id ?? "Not created yet"}
                </span>
              </p>
              <p>
                Draft Version ID:
                <span className="ml-2 font-mono text-xs">
                  {selectedForm?.draft_version?.id ?? "No draft saved"}
                </span>
              </p>
              <p>
                Form ID:
                <span className="ml-2 font-mono text-xs">
                  {selectedForm?.id ?? "Draft"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {formDetailQuery.isError ? (
          <ErrorState
            title="Could not load form details"
            error={formDetailQuery.error}
            onRetry={() => formDetailQuery.refetch()}
          />
        ) : null}

        <Tabs defaultValue="builder">
          <TabsList>
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

          <TabsContent value="builder" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className={cn(dashboardPanelClass, "rounded-[30px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,white),color-mix(in_oklab,var(--card)_82%,transparent))] p-7")}>
              <div className="grid gap-6">
                <SectionIntro
                  eyebrow="Builder"
                  title="Shape the form canvas"
                  description="Define the title, add fields, and drag them into a sensible reading order before saving a draft or publishing the next live version."
                />

                <div className="grid gap-2">
                  <label htmlFor="form-title" className="text-sm font-medium">
                    Form Title
                  </label>
                  <Input
                    id="form-title"
                    className="h-12 rounded-xl bg-background/75"
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    placeholder="Operations Request"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-dashed border-border/70 bg-muted/18 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold tracking-tight">Field stack</p>
                    <p className="text-xs leading-5 text-muted-foreground">
                      Drag from the grip to reorder. Select a row to edit it in the inspector.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl bg-background/80"
                    onClick={() =>
                      setDraftFields((current) => {
                        const nextField = createEmptyField(current.length)
                        const next = [...current, nextField]
                        setSelectedFieldKey(nextField.key)
                        return next
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Field
                  </Button>
                </div>

                <FieldBuilderList
                  fields={draftFields}
                  selectedKey={selectedFieldKey}
                  onSelect={setSelectedFieldKey}
                  onReorder={handleReorderFields}
                  onRemove={(fieldKey) =>
                    setDraftFields((current) => {
                      const removedIndex = current.findIndex(
                        (field) => field.key === fieldKey,
                      )
                      const next = current.filter((field) => field.key !== fieldKey)
                      const nextSelected =
                        next[removedIndex] ?? next[Math.max(0, removedIndex - 1)] ?? null
                      setSelectedFieldKey(nextSelected?.key ?? null)
                      return next
                    })
                  }
                />

                <div className="flex items-center justify-between gap-4 rounded-[24px] border border-border/60 bg-background/60 px-4 py-4">
                  <p className="text-sm leading-6 text-muted-foreground">
                    Save a draft explicitly, or publish directly and the builder will save pending schema changes first.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <LoadingButton
                      onClick={handleSaveDraft}
                      loading={
                        createFormMutation.isPending || updateFormMutation.isPending
                      }
                      className="min-w-36 rounded-xl"
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
                      className="min-w-36 rounded-xl"
                    >
                      Publish Version
                    </LoadingButton>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(dashboardPanelClass, "rounded-[30px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_96%,white),color-mix(in_oklab,var(--card)_86%,transparent))] p-6")}>
              <SectionIntro
                eyebrow="Inspector"
                title="Tune the selected field"
                description="Keep the field list lean on the left and use this side panel for naming, validation intent, and presentation details."
              />
              <Separator className="my-4" />
              {selectedField ? (
                <div className="grid gap-4">
                  <div className="rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--accent)_18%,white),color-mix(in_oklab,var(--card)_86%,transparent))] p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Field {selectedFieldIndex + 1}</Badge>
                      <Badge className="uppercase">{selectedField.kind}</Badge>
                      {selectedField.required ? <Badge variant="secondary">Required</Badge> : null}
                    </div>
                    <p className="mt-4 text-xl font-semibold tracking-tight">
                      {selectedField.label || "Untitled field"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedField.id || "No field ID yet"}
                    </p>
                  </div>

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
                      placeholder="Field Label"
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
                      placeholder="field_id"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
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
                        <SelectTrigger className="w-full">
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
                  </div>

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
                      placeholder="Optional short guidance"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Placeholder</label>
                    <Input
                      className="h-11 rounded-xl bg-background/75"
                      value={selectedField.placeholder}
                      onChange={(event) =>
                        updateSelectedField((field) => ({
                          ...field,
                          placeholder: event.target.value,
                        }))
                      }
                      placeholder="Optional placeholder"
                    />
                  </div>

                  {selectedField.kind === "checkbox" ? (
                    <p className="text-xs text-muted-foreground">
                      For checkbox fields, the placeholder is used as the toggle label in the published form.
                    </p>
                  ) : null}

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

                  {selectedField.kind === "select" || selectedField.kind === "radio" ? (
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Options</label>
                      <Input
                        className="h-11 rounded-xl bg-background/75"
                        value={selectedField.optionsText}
                        onChange={(event) =>
                          updateSelectedField((field) => ({
                            ...field,
                            optionsText: event.target.value,
                          }))
                        }
                        placeholder="low, medium, high"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter comma-separated options for the choice list.
                      </p>
                    </div>
                  ) : null}

                  {selectedField.kind === "text" ||
                  selectedField.kind === "textarea" ||
                  selectedField.kind === "email" ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Min Length</label>
                        <Input
                          className="h-11 rounded-xl bg-background/75"
                          inputMode="numeric"
                          value={selectedField.minLength}
                          onChange={(event) =>
                            updateSelectedField((field) => ({
                              ...field,
                              minLength: event.target.value,
                            }))
                          }
                          placeholder="Optional"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Max Length</label>
                        <Input
                          className="h-11 rounded-xl bg-background/75"
                          inputMode="numeric"
                          value={selectedField.maxLength}
                          onChange={(event) =>
                            updateSelectedField((field) => ({
                              ...field,
                              maxLength: event.target.value,
                            }))
                          }
                          placeholder="Optional"
                        />
                      </div>
                      <div className="grid gap-2 md:col-span-2">
                        <label className="text-sm font-medium">Pattern</label>
                        <Input
                          className="h-11 rounded-xl bg-background/75"
                          value={selectedField.pattern}
                          onChange={(event) =>
                            updateSelectedField((field) => ({
                              ...field,
                              pattern: event.target.value,
                            }))
                          }
                          placeholder={
                            selectedField.kind === "email"
                              ? "Optional regex override"
                              : "Optional regex pattern"
                          }
                        />
                      </div>
                    </div>
                  ) : null}

                  {selectedField.kind === "number" ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Min Value</label>
                        <Input
                          className="h-11 rounded-xl bg-background/75"
                          inputMode="decimal"
                          value={selectedField.minValue}
                          onChange={(event) =>
                            updateSelectedField((field) => ({
                              ...field,
                              minValue: event.target.value,
                            }))
                          }
                          placeholder="Optional"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Max Value</label>
                        <Input
                          className="h-11 rounded-xl bg-background/75"
                          inputMode="decimal"
                          value={selectedField.maxValue}
                          onChange={(event) =>
                            updateSelectedField((field) => ({
                              ...field,
                              maxValue: event.target.value,
                            }))
                          }
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  title="No field selected"
                  description="Select a field from the list or add a new one."
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className={cn(dashboardPanelClass, "rounded-[30px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_95%,white),color-mix(in_oklab,var(--card)_86%,transparent))] p-7")}>
              <SectionIntro
                eyebrow="Preview"
                title="Experience the current draft"
                description="This preview shows the draft you are editing. It is separate from the published version until you explicitly publish."
              />
              <Separator className="my-4" />
              <div className="rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,white_84%,transparent),color-mix(in_oklab,var(--background)_88%,transparent))] p-6 shadow-[0_18px_40px_-34px_color-mix(in_oklab,var(--foreground)_26%,transparent)]">
                <div className="mb-6 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Draft preview
                  </p>
                  <h4 className="text-2xl font-semibold tracking-tight">
                    {draftTitle || "Untitled form"}
                  </h4>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Review the unpublished draft before saving or publishing it.
                  </p>
                </div>
                <RuntimeFormRenderer
                  fields={draftFields}
                  values={submissionDraft}
                  readOnly
                />
              </div>
            </div>

            <div className={cn(dashboardPanelClass, "rounded-[30px] p-6")}>
              <SectionIntro
                eyebrow="Notes"
                title="Preview checklist"
                description="Use this quick pass to decide whether the draft feels calm, clear, and ready to replace the published version."
              />
              <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
                <p>Keep field IDs stable to preserve compatibility over time.</p>
                <p>Use half-width fields for compact pairs like names and dates.</p>
                <p>Prefer select fields when the answer set should stay controlled.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className={cn(dashboardPanelClass, "rounded-[30px] p-7")}>
              <SectionIntro
                eyebrow="Submissions"
                title="Test the published response flow"
                description="This area always uses the published active version. Draft changes should not appear here until you publish them."
              />
              <Separator className="my-4" />
              <div className="mb-5 rounded-[22px] border border-border/60 bg-background/55 px-4 py-4 text-sm text-muted-foreground">
                <p>
                  Published form:
                  <span className="ml-2 font-medium text-foreground">
                    {publishedTitle || "No published title yet"}
                  </span>
                </p>
                <p className="mt-1">
                  Published fields:
                  <span className="ml-2 font-medium text-foreground">
                    {publishedFields.length}
                  </span>
                </p>
              </div>
              <RuntimeFormRenderer
                fields={publishedFields}
                values={submissionDraft}
                errors={submissionErrors}
                onChange={(fieldId, value) =>
                  {
                    setSubmissionDraft((current) => ({ ...current, [fieldId]: value }))
                    setSubmissionErrors((current) => {
                      const next = { ...current }
                      delete next[fieldId]
                      return next
                    })
                  }
                }
              />
              <div className="mt-6 flex flex-wrap gap-3">
                <LoadingButton
                  onClick={handleCreateSubmission}
                  loading={createSubmissionMutation.isPending}
                >
                  Save Submission
                </LoadingButton>
                <LoadingButton
                  variant="outline"
                  onClick={handleUpdateSubmission}
                  loading={updateSubmissionMutation.isPending}
                >
                  Update Submission
                </LoadingButton>
              </div>
            </div>

            <div className={cn(dashboardPanelClass, "rounded-[30px] p-6")}>
              <SectionIntro
                eyebrow="Responses"
                title="Inspect saved answers"
                description="Saved responses are rendered against the schema version they were submitted with, so older history stays accurate."
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
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
                  <div className="grid gap-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={submissionSearch}
                        onChange={(event) => setSubmissionSearch(event.target.value)}
                        placeholder="Search by ID, value, or timestamp"
                        className="h-11 rounded-xl bg-background/75 pl-10"
                      />
                    </div>

                    <div className="overflow-hidden rounded-[24px] border border-border/60">
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
                                  "cursor-pointer",
                                  selectedSubmissionId === submission.id &&
                                    "bg-primary/8",
                                )}
                                onClick={() => setSelectedSubmissionId(submission.id)}
                              >
                                <TableCell className="whitespace-normal">
                                  <div className="space-y-1">
                                    <p className="font-medium">{submission.id.slice(0, 8)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      v{selectedForm?.versions.find(
                                        (version) => version.id === submission.form_version_id,
                                      )?.version_number ?? "?"}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[280px] whitespace-normal text-muted-foreground">
                                  {buildSubmissionPreview(submission)}
                                </TableCell>
                                <TableCell className="whitespace-normal text-sm">
                                  {submission.updated_at
                                    ? new Date(submission.updated_at).toLocaleString()
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

                  {selectedSubmission ? (
                    <div className="grid gap-4">
                      <div className="rounded-[24px] border border-border/60 bg-background/60 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">Submission</Badge>
                          <Badge>v{selectedSubmissionVersion?.version_number ?? "?"}</Badge>
                        </div>
                        <p className="mt-4 text-lg font-semibold tracking-tight">
                          {selectedSubmission.id}
                        </p>
                        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                          <p>
                            Created:
                            <span className="ml-2 text-foreground">
                              {selectedSubmission.created_at
                                ? new Date(selectedSubmission.created_at).toLocaleString()
                                : "Unknown"}
                            </span>
                          </p>
                          <p>
                            Updated:
                            <span className="ml-2 text-foreground">
                              {selectedSubmission.updated_at
                                ? new Date(selectedSubmission.updated_at).toLocaleString()
                                : "Unknown"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <RuntimeFormRenderer
                        fields={selectedSubmissionFields}
                        values={selectedSubmission.data}
                        readOnly
                        layout="single"
                      />
                    </div>
                  ) : (
                    <EmptyState
                      title="No response selected"
                      description="Choose a saved submission from the list to inspect its version-bound data."
                    />
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className={cn(dashboardPanelClass, "rounded-[30px] p-7")}>
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
