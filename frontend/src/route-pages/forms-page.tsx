import { DashboardCard } from "@/components/Common/dashboard-surface"
import { FormWorkspace } from "@/components/Forms/FormWorkspace"
import { Route } from "@/routes/_layout/forms"

export function FormsPage() {
  const { formId, tab, newDraft } = Route.useSearch()

  return (
    <div className="flex flex-col">
      <DashboardCard>
        <FormWorkspace
          initialSelectedFormId={formId ?? null}
          initialTab={tab}
          startNewDraft={newDraft}
        />
      </DashboardCard>
    </div>
  )
}
