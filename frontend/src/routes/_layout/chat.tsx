import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/Common/PageHeader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const conversations = [
  {
    name: "Operations Team",
    last: "Need approval on the new shipping workflow.",
    time: "2m",
  },
  {
    name: "Finance Lead",
    last: "Invoice adjustments are ready for review.",
    time: "18m",
  },
  {
    name: "Northstar Labs",
    last: "Thanks, the dashboard snapshot looks great.",
    time: "1h",
  },
] as const

const messages = [
  {
    author: "S. Cole",
    body: "Can we lock the customer migration window by Thursday?",
    own: false,
  },
  {
    author: "You",
    body: "Yes, I will confirm after the finance sync this afternoon.",
    own: true,
  },
  {
    author: "P. Patel",
    body: "Great. I will prepare the launch note for support.",
    own: false,
  },
] as const

export const Route = createFileRoute("/_layout/chat")({
  component: ChatPage,
  head: () => ({
    meta: [{ title: "Chat - DRP Operations Console" }],
  }),
})

function ChatPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Apps"
        title="Chat"
        description="A direct-messaging style page adds another familiar app workspace to the suite."
      />

      <div className="grid gap-6 xl:grid-cols-[0.38fr_1fr]">
        <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>
              Recent channels and direct threads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.name}
                className="rounded-2xl border border-border/70 bg-background/70 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-medium">{conversation.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {conversation.time}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {conversation.last}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Operations Team</CardTitle>
            <CardDescription>Today’s coordination thread.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.map((message) => (
              <div
                key={`${message.author}-${message.body}`}
                className={[
                  "max-w-[80%] rounded-2xl p-4 text-sm leading-6",
                  message.own
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-background border border-border/70 text-muted-foreground",
                ].join(" ")}
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                  {message.author}
                </p>
                <p>{message.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
