import { DashboardCard } from "@/components/Common/dashboard-surface"
import { FormWorkspace } from "@/components/Forms/FormWorkspace"

export function FormsPage() {
  return (
    <div className="flex flex-col">
      <DashboardCard>
        <FormWorkspace />
      </DashboardCard>
    </div>
  )
}
