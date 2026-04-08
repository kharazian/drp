import {
  DashboardCard,
  dashboardPanelCompactClass,
} from "@/components/Common/dashboard-surface"
import { PageHeader } from "@/components/Common/PageHeader"
import { Badge } from "@/components/ui/badge"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const fileGroups = [
  { name: "Quarterly Reports", files: 18, size: "124 MB" },
  { name: "Customer Exports", files: 42, size: "286 MB" },
  { name: "Design Assets", files: 61, size: "1.2 GB" },
] as const

const recentFiles = [
  { name: "northstar-q2-summary.pdf", type: "PDF", updated: "12m ago" },
  { name: "invoice-adjustments-may.xlsx", type: "Sheet", updated: "48m ago" },
  { name: "support-launch-checklist.docx", type: "Doc", updated: "2h ago" },
  { name: "ops-dashboard-export.csv", type: "CSV", updated: "5h ago" },
] as const

export function FilesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Apps"
        title="Files"
        description="A file workspace rounds out the app suite with storage, exports, and shared asset management."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {fileGroups.map((group) => (
          <DashboardCard key={group.name}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>Shared folder overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {group.files} files
              </p>
              <p className="text-2xl font-semibold">{group.size}</p>
            </CardContent>
          </DashboardCard>
        ))}
      </div>

      <DashboardCard>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
          <CardDescription>
            Latest exports, documents, and attachments across the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentFiles.map((file) => (
            <div
              key={file.name}
              className={`flex items-center justify-between ${dashboardPanelCompactClass}`}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{file.updated}</p>
              </div>
              <Badge variant="outline">{file.type}</Badge>
            </div>
          ))}
        </CardContent>
      </DashboardCard>
    </div>
  )
}
