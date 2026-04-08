import { createFileRoute } from "@tanstack/react-router"
import { PageHeader } from "@/components/Common/PageHeader"
import { kanbanColumns } from "@/components/Dashboard/demo-data"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const Route = createFileRoute("/_layout/kanban")({
  component: KanbanPage,
  head: () => ({
    meta: [{ title: "Kanban - DRP Operations Console" }],
  }),
})

function KanbanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Planning"
        title="Kanban Board"
        description="A project-planning view that broadens the app beyond the base CRUD pages and adds the kind of product surface seen in richer dashboard templates."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {kanbanColumns.map((column) => (
          <Card
            key={column.title}
            className="rounded-[28px] border-border/70 bg-card/90 shadow-sm"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{column.title}</span>
                <Badge variant="outline">{column.count}</Badge>
              </CardTitle>
              <CardDescription>
                Keep delivery progress visible across the team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.tasks.map((task) => (
                <div
                  key={task.title}
                  className="rounded-2xl border border-border/70 bg-background/70 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Badge variant="outline">{task.tag}</Badge>
                    <span className="text-xs font-medium text-muted-foreground">
                      {task.owner}
                    </span>
                  </div>
                  <p className="mb-3 text-sm font-medium leading-6">
                    {task.title}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {task.priority} priority
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
