import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import {
  Eye,
  FilePlus2,
  PencilLine,
  Printer,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"

import { DashboardCard } from "@/components/Common/dashboard-surface"
import { PageHeader } from "@/components/Common/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useCustomToast from "@/hooks/useCustomToast"
import { formsApi, type FormDetail, type FormRecord } from "@/lib/forms-api"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === "string" && error) {
    return error
  }
  return "Request failed."
}

function formatTimestamp(value?: string | null) {
  if (!value) {
    return "Unknown"
  }

  return new Date(value).toLocaleString()
}

function buildPrintableDocument(form: FormDetail) {
  const schema =
    form.draft_version?.schema ?? form.active_version?.schema ?? { sections: [] }
  const sections =
    schema.sections?.length
      ? schema.sections
      : [
          {
            id: "main",
            title: "Main Section",
            fields: schema.fields ?? [],
          },
        ]

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${form.title} Print View</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 32px; color: #1f2937; }
      h1, h2 { margin-bottom: 8px; }
      .meta { margin-bottom: 24px; color: #4b5563; }
      .section { margin-top: 24px; padding-top: 16px; border-top: 1px solid #d1d5db; }
      .field { margin: 10px 0; }
      .label { font-weight: 700; }
      .note { color: #6b7280; font-size: 14px; }
    </style>
  </head>
  <body>
    <h1>${form.title}</h1>
    <div class="meta">
      <div>Updated: ${formatTimestamp(form.updated_at)}</div>
      <div>Created: ${formatTimestamp(form.created_at)}</div>
      <div>Versions: ${form.versions.length}</div>
    </div>
    ${sections
      .map(
        (section) => `
      <section class="section">
        <h2>${section.title || "Untitled Section"}</h2>
        ${
          section.description
            ? `<p class="note">${section.description}</p>`
            : ""
        }
        ${(section.fields ?? [])
          .map(
            (field) => `
          <div class="field">
            <div class="label">${field.label}</div>
            <div class="note">ID: ${field.id} | Type: ${field.type}${
              field.required ? " | Required" : ""
            }</div>
          </div>
        `,
          )
          .join("")}
      </section>
    `,
      )
      .join("")}
  </body>
</html>`
}

function printFormDetail(form: FormDetail) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer")
  if (!printWindow) {
    throw new Error("Pop-up blocked. Please allow pop-ups to print forms.")
  }

  printWindow.document.open()
  printWindow.document.write(buildPrintableDocument(form))
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

export function FormsLibraryPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showErrorToast, showSuccessToast } = useCustomToast()
  const [query, setQuery] = useState("")

  const formsQuery = useQuery({
    queryKey: ["forms"],
    queryFn: formsApi.readForms,
  })

  const deleteFormMutation = useMutation({
    mutationFn: (formId: string) => formsApi.deleteForm(formId),
    onSuccess: () => {
      showSuccessToast("Form deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["forms"] })
    },
    onError: (error) => showErrorToast(getErrorMessage(error)),
  })

  const printFormMutation = useMutation({
    mutationFn: (formId: string) => formsApi.readForm(formId),
    onSuccess: (form) => {
      printFormDetail(form)
    },
    onError: (error) => showErrorToast(getErrorMessage(error)),
  })

  const filteredForms = useMemo(() => {
    const forms = formsQuery.data?.data ?? []
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return forms
    }

    return forms.filter((form) => {
      const searchable = [
        form.title,
        form.draft_title ?? "",
        form.id,
        form.owner_id,
        form.updated_at ?? "",
      ]
      return searchable.some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      )
    })
  }, [formsQuery.data, query])

  const openForm = (form: FormRecord, tab: "builder" | "preview") => {
    navigate({
      to: "/forms",
      search: {
        formId: form.id,
        tab,
        newDraft: false,
      },
    })
  }

  const createForm = () => {
    navigate({
      to: "/forms",
      search: {
        tab: "builder",
        newDraft: true,
      },
    })
  }

  const deleteForm = (form: FormRecord) => {
    if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) {
      return
    }

    deleteFormMutation.mutate(form.id)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Forms"
        title="Forms Library"
        description="Start from a clear list of forms, then open, edit, create, delete, or print from one operational screen."
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-xl bg-background/80"
              onClick={() => formsQuery.refetch()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button className="rounded-xl shadow-sm" onClick={createForm}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </>
        }
      />

      <DashboardCard>
        <CardContent className="grid gap-6 p-5 sm:p-6">
          <div className="flex flex-col gap-4 rounded-[24px] border border-border/60 bg-background/72 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full">
                {formsQuery.data?.count ?? 0} total
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                {filteredForms.length} shown
              </Badge>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search forms by title, id, owner, or update date"
                className="h-11 rounded-xl bg-background pl-9"
              />
            </div>
          </div>

          {formsQuery.isError ? (
            <div className="rounded-[24px] border border-destructive/30 bg-destructive/6 px-5 py-6 text-sm text-destructive">
              {getErrorMessage(formsQuery.error)}
            </div>
          ) : null}

          {!formsQuery.isLoading && filteredForms.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border/65 px-6 py-14 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">
                No forms matched this view
              </h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                Try a different search, or create a new form to start the first
                version of your library.
              </p>
            </div>
          ) : null}

          {filteredForms.length > 0 ? (
            <div className="overflow-hidden rounded-[26px] border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="align-top">
                        <div className="space-y-1">
                          <div className="font-medium tracking-tight">
                            {form.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {form.id}
                          </div>
                          {form.draft_title ? (
                            <div className="text-xs text-muted-foreground">
                              Draft title: {form.draft_title}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={
                              form.active_version_id ? "default" : "secondary"
                            }
                            className="rounded-full"
                          >
                            {form.active_version_id ? "Published" : "Draft only"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground">
                        {formatTimestamp(form.updated_at)}
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground">
                        <span className="font-mono text-xs">{form.owner_id}</span>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl bg-background/80"
                            onClick={() => openForm(form, "preview")}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Open
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl bg-background/80"
                            onClick={() => openForm(form, "builder")}
                          >
                            <PencilLine className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl bg-background/80"
                            disabled={printFormMutation.isPending}
                            onClick={() => printFormMutation.mutate(form.id)}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl bg-background/80"
                            disabled={deleteFormMutation.isPending}
                            onClick={() => deleteForm(form)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button asChild variant="ghost" className="rounded-xl">
              <Link
                to="/forms"
                search={{ tab: "builder", newDraft: false }}
              >
                Go to Builder
              </Link>
            </Button>
          </div>
        </CardContent>
      </DashboardCard>
    </div>
  )
}
