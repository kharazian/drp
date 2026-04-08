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

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const schedule = [
  { day: 3, title: "Customer review", time: "09:30", type: "Call" },
  { day: 7, title: "Ops planning", time: "11:00", type: "Internal" },
  { day: 12, title: "Finance sync", time: "14:00", type: "Billing" },
  { day: 18, title: "Release prep", time: "10:00", type: "Product" },
  { day: 24, title: "Board summary", time: "16:00", type: "Executive" },
] as const

export const Route = createFileRoute("/_layout/calendar")({
  component: CalendarPage,
  head: () => ({
    meta: [{ title: "Calendar - DRP Operations Console" }],
  }),
})

function CalendarPage() {
  const cells = Array.from({ length: 35 }, (_, index) => index + 1)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Apps"
        title="Calendar"
        description="A calendar-style planning page adds another classic app surface to the dashboard suite."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>May 2026</CardTitle>
            <CardDescription>
              Shared workspace schedule with meetings, planning, and operational
              checkpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-7 gap-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {weekDays.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-3">
              {cells.map((day) => {
                const item = schedule.find((entry) => entry.day === day)

                return (
                  <div
                    key={day}
                    className="min-h-24 rounded-2xl border border-border/70 bg-background/70 p-3"
                  >
                    <div className="mb-2 text-sm font-medium">
                      {day <= 31 ? day : ""}
                    </div>
                    {item ? (
                      <div className="rounded-xl bg-primary/10 p-2 text-xs">
                        <p className="font-medium text-primary">{item.title}</p>
                        <p className="mt-1 text-muted-foreground">
                          {item.time}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>
              Focus items for the current month.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {schedule.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/70 bg-background/70 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  May {item.day} at {item.time}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
