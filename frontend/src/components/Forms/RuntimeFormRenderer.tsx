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
import { cn } from "@/lib/utils"
import type { BuilderField } from "./schema"

type PreviewDevice = "mobile" | "tablet" | "desktop"

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

function getFieldWidthClass(
  field: BuilderField,
  layout: "auto" | "single",
  previewDevice?: PreviewDevice,
) {
  if (layout === "single") {
    return ""
  }

  if (previewDevice === "mobile") {
    return "col-span-12"
  }

  if (previewDevice === "tablet") {
    return field.width === "full" ? "col-span-12" : "col-span-6"
  }

  switch (field.width) {
    case "full":
      return "col-span-12"
    case "half":
      return "col-span-12 md:col-span-6"
    case "third":
      return "col-span-12 md:col-span-6 xl:col-span-4"
    case "quarter":
      return "col-span-12 md:col-span-6 xl:col-span-3"
  }
}

function getPresetClass(field: BuilderField) {
  switch (field.stylePreset) {
    case "rounded":
      return "rounded-[28px]"
    case "shadow":
      return "shadow-[0_18px_36px_-30px_color-mix(in_oklab,var(--foreground)_28%,transparent)]"
    case "accent":
      return "border-primary/45 bg-primary/5"
    case "plain":
      return ""
  }
}

export function RuntimeFormRenderer({
  fields,
  values,
  onChange,
  errors,
  readOnly = false,
  layout = "auto",
  previewDevice,
}: {
  fields: BuilderField[]
  values: Record<string, unknown>
  onChange?: (fieldId: string, value: unknown) => void
  errors?: Record<string, string>
  readOnly?: boolean
  layout?: "auto" | "single"
  previewDevice?: PreviewDevice
}) {
  const gridClass =
    layout === "single"
      ? "grid gap-3"
      : previewDevice === "mobile"
        ? "grid grid-cols-12 gap-4"
        : previewDevice === "tablet"
          ? "grid grid-cols-12 gap-4"
          : "grid grid-cols-12 gap-4"

  return (
    <div className={gridClass}>
      {fields.map((field) => {
        const widthClass = getFieldWidthClass(field, layout, previewDevice)
        const surfaceClass = cn(getPresetClass(field), field.customClasses)
        const value = values[field.id] ?? field.defaultValue

        if (readOnly) {
          return (
            <div
              key={field.key}
              className={cn(
                "rounded-2xl border border-border/60 bg-muted/35 p-4",
                widthClass,
                surfaceClass,
                layout === "single" && "bg-background/65 p-5",
              )}
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
                <p className="mt-2 text-xs text-muted-foreground">
                  {field.helpText}
                </p>
              ) : null}
              <p className="mt-3 break-words rounded-xl bg-background/70 px-3 py-2 text-sm leading-6 shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_65%,transparent)]">
                {formatReadOnlyValue(field, value)}
              </p>
            </div>
          )
        }

        return (
          <div
            key={field.key}
            className={cn("grid gap-2", widthClass, surfaceClass)}
          >
            <label htmlFor={field.id} className="text-sm font-medium">
              {field.label}
              {field.required ? (
                <span className="ml-1 text-primary">*</span>
              ) : null}
            </label>
            {field.helpText ? (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            ) : null}
            {field.kind === "textarea" ? (
              <Textarea
                id={field.id}
                value={String(value ?? "")}
                placeholder={field.placeholder}
                required={field.required}
                minLength={
                  field.minLength ? Number(field.minLength) : undefined
                }
                maxLength={
                  field.maxLength ? Number(field.maxLength) : undefined
                }
                onChange={(event) => onChange?.(field.id, event.target.value)}
              />
            ) : null}
            {field.kind === "text" ? (
              <Input
                type="text"
                id={field.id}
                className="h-11 rounded-2xl bg-background/80"
                value={String(value ?? "")}
                placeholder={field.placeholder}
                required={field.required}
                minLength={
                  field.minLength ? Number(field.minLength) : undefined
                }
                maxLength={
                  field.maxLength ? Number(field.maxLength) : undefined
                }
                pattern={field.pattern || undefined}
                onChange={(event) => onChange?.(field.id, event.target.value)}
              />
            ) : null}
            {field.kind === "email" ? (
              <Input
                type="email"
                id={field.id}
                className="h-11 rounded-2xl bg-background/80"
                value={String(value ?? "")}
                placeholder={field.placeholder}
                required={field.required}
                minLength={
                  field.minLength ? Number(field.minLength) : undefined
                }
                maxLength={
                  field.maxLength ? Number(field.maxLength) : undefined
                }
                pattern={field.pattern || undefined}
                onChange={(event) => onChange?.(field.id, event.target.value)}
              />
            ) : null}
            {field.kind === "date" ? (
              <Input
                id={field.id}
                type="date"
                className="h-11 rounded-2xl bg-background/80"
                value={String(value ?? "")}
                required={field.required}
                onChange={(event) => onChange?.(field.id, event.target.value)}
              />
            ) : null}
            {field.kind === "number" ? (
              <Input
                id={field.id}
                type="number"
                className="h-11 rounded-2xl bg-background/80"
                value={String(value ?? "")}
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
                value={typeof value === "string" ? String(value) : undefined}
                onValueChange={(value) => onChange?.(field.id, value)}
              >
                <SelectTrigger className="h-11 w-full rounded-2xl bg-background/80">
                  <SelectValue
                    placeholder={field.placeholder || "Choose an option"}
                  />
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
                        checked={String(value ?? "") === option}
                        onChange={() => onChange?.(field.id, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
              </div>
            ) : null}
            {field.kind === "checkbox" ? (
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm">
                <Checkbox
                  id={field.key}
                  checked={Boolean(value ?? false)}
                  onCheckedChange={(checked) =>
                    onChange?.(field.id, Boolean(checked))
                  }
                />
                <label htmlFor={field.key} className="min-w-0 break-words">
                  {field.placeholder || field.label}
                </label>
              </div>
            ) : null}
            {errors?.[field.id] ? (
              <p className="text-xs font-medium text-destructive">
                {errors[field.id]}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
