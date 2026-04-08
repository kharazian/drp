export const PAGE_META: Record<string, { title: string; description: string }> =
  {
    "/": {
      title: "Dashboard",
      description:
        "Monitor platform activity, stay on top of operations, and move quickly into the workflows that matter.",
    },
    "/items": {
      title: "Items",
      description:
        "Manage inventory records, review changes, and keep your workspace organized.",
    },
    "/analytics": {
      title: "Analytics",
      description:
        "Track KPIs, traffic mix, and reporting modules across the workspace.",
    },
    "/charts": {
      title: "Charts",
      description:
        "Preview chart-oriented modules and reporting visualizations.",
    },
    "/calendar": {
      title: "Calendar",
      description:
        "Review shared schedules, checkpoints, and upcoming meetings.",
    },
    "/mail": {
      title: "Mail",
      description: "Browse operational inbox threads and message activity.",
    },
    "/chat": {
      title: "Chat",
      description: "Coordinate with teams and customers in message threads.",
    },
    "/files": {
      title: "Files",
      description: "Browse shared exports, assets, and uploaded documents.",
    },
    "/kanban": {
      title: "Kanban",
      description:
        "Organize active initiatives with a board-style planning workflow.",
    },
    "/orders": {
      title: "Orders",
      description:
        "Track order flow, fulfillment progress, and shipment readiness.",
    },
    "/customers": {
      title: "Customers",
      description:
        "Review customer accounts, health signals, and regional coverage.",
    },
    "/invoices": {
      title: "Invoices",
      description: "Track invoice balances, due dates, and collection status.",
    },
    "/billing": {
      title: "Billing",
      description: "Manage subscription plans, payment methods, and usage.",
    },
    "/profile": {
      title: "Profile",
      description:
        "Review account highlights, recent activity, and permission coverage.",
    },
    "/admin": {
      title: "Administration",
      description:
        "Review users, permissions, and the operational health of your account directory.",
    },
    "/settings": {
      title: "Settings",
      description:
        "Update profile details, security controls, and day-to-day workspace preferences.",
    },
    "/help-support": {
      title: "Help & Support",
      description:
        "Browse docs, support options, and operational escalation paths.",
    },
    "/notifications": {
      title: "Notifications",
      description:
        "Review recent alerts, approvals, and important workspace updates.",
    },
  }

export const TOP_NAV_ITEMS = [
  { label: "Dashboard", path: "/" },
  { label: "Analytics", path: "/analytics" },
  { label: "Items", path: "/items" },
  { label: "Kanban", path: "/kanban" },
  { label: "Profile", path: "/profile" },
] as const
