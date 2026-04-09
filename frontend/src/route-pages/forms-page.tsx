import { DashboardCard } from "@/components/Common/dashboard-surface"
import { PageHeader } from "@/components/Common/PageHeader"
import { FormWorkspace } from "@/components/Forms/FormWorkspace"

export function FormsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Builder"
        title="Forms"
        description="Design versioned forms, keep submissions pinned to a specific schema version, and review an audit trail of changes."
      />
      <DashboardCard>
        <FormWorkspace />
      </DashboardCard>
    </div>
  )
}
