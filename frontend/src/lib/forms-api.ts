export type JsonSchemaFieldWidth = "full" | "half" | "third" | "quarter"
export type JsonSchemaFieldStylePreset =
  | "plain"
  | "rounded"
  | "shadow"
  | "accent"
export type JsonSchemaSectionColumns = 1 | 2 | 3 | 4

export type JsonSchemaField = {
  id: string
  label: string
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "email"
    | "date"
    | "checkbox"
    | "radio"
  options?: string[]
  default_value?: string
  placeholder?: string
  help_text?: string
  required?: boolean
  width?: JsonSchemaFieldWidth
  custom_classes?: string
  style_preset?: JsonSchemaFieldStylePreset
  validation?: {
    min_length?: number
    max_length?: number
    min_value?: number
    max_value?: number
    pattern?: string
  }
}

export type JsonSchemaSection = {
  id: string
  title: string
  description?: string
  layout?: {
    columns?: JsonSchemaSectionColumns
  }
  fields: JsonSchemaField[]
}

export type JsonSchema = {
  version?: number
  settings?: {
    title?: string
    description?: string
    submitLabel?: string
  }
  fields?: JsonSchemaField[]
  sections?: JsonSchemaSection[]
}

export type FormVersion = {
  id: string
  form_id: string
  version_number: number
  is_active: boolean
  created_at?: string | null
  created_by_user_id: string
  schema: JsonSchema
}

export type FormRecord = {
  id: string
  title: string
  draft_title?: string | null
  owner_id: string
  active_version_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type FormDetail = FormRecord & {
  active_version?: FormVersion | null
  draft_version?: FormVersion | null
  versions: FormVersion[]
}

export type FormsResponse = {
  data: FormRecord[]
  count: number
}

export type Submission = {
  id: string
  form_id: string
  form_version_id: string
  submitted_by_user_id: string
  created_at?: string | null
  updated_at?: string | null
  data: Record<string, unknown>
}

export type SubmissionsResponse = {
  data: Submission[]
  count: number
}

export type AuditLog = {
  id: string
  submission_id: string
  before_state: Record<string, unknown>
  after_state: Record<string, unknown>
  changes: Record<string, unknown>
  changed_at?: string | null
  changed_by_user_id: string
}

export type AuditLogsResponse = {
  data: AuditLog[]
  count: number
}

const apiBase = `${import.meta.env.VITE_API_URL}/api/v1`

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      ...(init?.headers || {}),
    },
  })

  const body = await response.json().catch(() => ({}))
  const detail =
    typeof body?.detail === "string" ? body.detail : "Request failed."

  if (
    [401, 403].includes(response.status) ||
    (response.status === 404 && detail === "User not found")
  ) {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
    throw new Error("Authentication required.")
  }

  if (!response.ok) {
    throw new Error(detail)
  }

  return body as T
}

export const formsApi = {
  createForm(payload: { title: string; schema: JsonSchema }) {
    return apiRequest<FormDetail>("/forms/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  readForms() {
    return apiRequest<FormsResponse>("/forms/")
  },
  readForm(formId: string) {
    return apiRequest<FormDetail>(`/forms/${formId}`)
  },
  updateForm(
    formId: string,
    payload: { title?: string; schema?: JsonSchema | null },
  ) {
    return apiRequest<FormDetail>(`/forms/${formId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  publishForm(formId: string) {
    return apiRequest<FormDetail>(`/forms/${formId}/publish`, {
      method: "POST",
    })
  },
  deleteForm(formId: string) {
    return apiRequest<{ message: string }>(`/forms/${formId}`, {
      method: "DELETE",
    })
  },
  readSubmissions(formId: string) {
    return apiRequest<SubmissionsResponse>(`/forms/${formId}/submissions`)
  },
  createSubmission(
    formId: string,
    payload: { form_version_id: string; data: Record<string, unknown> },
  ) {
    return apiRequest<Submission>(`/forms/${formId}/submissions`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  updateSubmission(
    formId: string,
    submissionId: string,
    data: Record<string, unknown>,
  ) {
    return apiRequest<Submission>(
      `/forms/${formId}/submissions/${submissionId}`,
      {
        method: "PUT",
        body: JSON.stringify({ data }),
      },
    )
  },
  readHistory(formId: string, submissionId: string) {
    return apiRequest<AuditLogsResponse>(
      `/forms/${formId}/submissions/${submissionId}/history`,
    )
  },
}
