import type { ComponentProps } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BuilderField } from "./schema"

function Textarea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 min-h-28 w-full rounded-2xl border bg-background/80 px-4 py-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
      {...props}
    />
  )
}

function formatReadOnlyValue(field: BuilderField, value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  if (field.kind === "checkbox") {
    return value === true ? "Yes" : "No"
  }

  if (field.kind === "date" && typeof value === "string") {
    const parsed = new Date(`${value}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
  }

  return String(value)
}

export function RuntimeFormRenderer({
  fields,
  values,
  onChange,
  errors,
  readOnly = false,
  layout = "auto",
}: {
  fields: BuilderField[]
  values: Record<string, unknown>
  onChange?: (fieldId: string, value: unknown) => void
  errors?: Record<string, string>
  readOnly?: boolean
  layout?: "auto" | "single"
}) {
  const gridClass = layout === "single" ? "grid gap-3" : "grid gap-4 sm:grid-cols-2"

  return (
    <div className={gridClass}>
      {fields.map((field) => {
        const widthClass =
          layout === "single" ? "" : field.width === "full" ? "sm:col-span-2" : ""

        if (readOnly) {
          return (
            <div
              key={field.key}
              className={`rounded-2xl border border-border/60 bg-muted/35 p-4 ${widthClass} ${
                layout === "single" ? "bg-background/65 p-5" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={
                    layout === "single"
                      ? "text-sm font-semibold tracking-tight text-foreground"
                      : "text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                  }
                >
                  {field.label}
                </p>
                {field.required ? (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Required
                  </span>
                ) : null}
              </div>
              {field.helpText ? (
                <p className="mt-2 text-xs text-muted-foreground">{field.helpText}</p>
              ) : null}
              <p className="mt-3 break-words rounded-xl bg-background/70 px-3 py-2 text-sm leading-6 shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_65%,transparent)]">
                {formatReadOnlyValue(field, values[field.id])}
              </p>
            </div>
          )
        }

        return (
          <div key={field.key} className={`grid gap-2 ${widthClass}`}>
            <label htmlFor={field.id} className="text-sm font-medium">
              {field.label}
              {field.required ? <span className="ml-1 text-primary">*</span> : null}
            </label>
            {field.helpText ? (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            ) : null}
            {field.kind === "textarea" ? (
              <Textarea
                id={field.id}
                value={String(values[field.id] ?? "")}
                placeholder={field.placeholder}
                required={field.required}
                minLength={field.minLength ? Number(field.minLength) : undefined}
                maxLength={field.maxLength ? Number(field.maxLength) : undefined}
                onChange={(event) => onChange?.(field.id, event.target.value)}
              />
            ) : null}
            {field.kind === "text" ? (
              <Input
                type="text"
                id={field.id}
                className="h-11 rounded-2xl bg-background/80"
                value={String(values[field.id] ?? "")}
                placeholder={field.placeholder}
                required={field.required}
                minLength={field.minLength ? Number(field.minLength) : undefined}
                maxLength={field.maxLength ? Number(field.maxLength) : undefined}
                pattern={field.pattern || undefined}
                onChange={(event) => onChange?.(field.id, event.target.value)}
              />
            ) : null}
            {field.kind === "email" ? (
              <Input
                type="email"
                id={field.id}
                className="h-11 rounded-2xl bg-background/80"
                value={String(values[field.id] ?? "")}
                placeholder={field.placeholder}
                required={field.required}
                minLength={field.minLength ? Number(field.minLength) : undefined}
                maxLength={field.maxLength ? Number(field.maxLength) : undefined}
                pattern={field.pattern || undefined}
                onChange={(event) => onChange?.(field.id, event.target.value)}
              />
            ) : null}
            {field.kind === "date" ? (
              <Input
                id={field.id}
                type="date"
                className="h-11 rounded-2xl bg-background/80"
                value={String(values[field.id] ?? "")}
                required={field.required}
                onChange={(event) => onChange?.(field.id, event.target.value)}
              />
            ) : null}
            {field.kind === "number" ? (
              <Input
                id={field.id}
                type="number"
                className="h-11 rounded-2xl bg-background/80"
                value={String(values[field.id] ?? "")}
                placeholder={field.placeholder}
                required={field.required}
                min={field.minValue ? Number(field.minValue) : undefined}
                max={field.maxValue ? Number(field.maxValue) : undefined}
                onChange={(event) => {
                  const next = event.target.value
                  onChange?.(field.id, next === "" ? "" : Number(next))
                }}
              />
            ) : null}
            {field.kind === "select" ? (
              <Select
                value={
                  typeof values[field.id] === "string"
                    ? String(values[field.id])
                    : undefined
                }
                onValueChange={(value) => onChange?.(field.id, value)}
              >
                <SelectTrigger className="h-11 w-full rounded-2xl bg-background/80">
                  <SelectValue placeholder={field.placeholder || "Choose an option"} />
                </SelectTrigger>
                <SelectContent>
                  {field.optionsText
                    .split(",")
                    .map((option) => option.trim())
                    .filter(Boolean)
                    .map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : null}
            {field.kind === "radio" ? (
              <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
                {field.optionsText
                  .split(",")
                  .map((option) => option.trim())
                  .filter(Boolean)
                  .map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 text-sm"
                    >
                      <input
                        type="radio"
                        name={field.id}
                        value={option}
                        checked={String(values[field.id] ?? "") === option}
                        onChange={() => onChange?.(field.id, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
              </div>
            ) : null}
            {field.kind === "checkbox" ? (
              <label className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm">
                <Checkbox
                  checked={Boolean(values[field.id] ?? false)}
                  onCheckedChange={(checked) => onChange?.(field.id, Boolean(checked))}
                />
                <span className="min-w-0 break-words">
                  {field.placeholder || field.label}
                </span>
              </label>
            ) : null}
            {errors?.[field.id] ? (
              <p className="text-xs font-medium text-destructive">{errors[field.id]}</p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
