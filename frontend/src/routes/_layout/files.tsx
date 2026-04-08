import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/Common/PageHeader"
import { Badge } from "@/components/ui/badge"
import {
  Card,
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

export const Route = createFileRoute("/_layout/files")({
  component: FilesPage,
  head: () => ({
    meta: [{ title: "Files - DRP Operations Console" }],
  }),
})

function FilesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Apps"
        title="Files"
        description="A file workspace rounds out the app suite with storage, exports, and shared asset management."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {fileGroups.map((group) => (
          <Card
            key={group.name}
            className="rounded-[28px] border-border/70 bg-card/90 shadow-sm"
          >
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
          </Card>
        ))}
      </div>

      <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
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
              className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{file.updated}</p>
              </div>
              <Badge variant="outline">{file.type}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
