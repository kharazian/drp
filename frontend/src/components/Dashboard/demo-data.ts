export const analyticsMetrics = [
  { label: "Revenue", value: "$128.4K", hint: "+14.8% from last month" },
  {
    label: "Active Users",
    value: "8,942",
    hint: "Stable engagement across the last 7 days",
  },
  {
    label: "Conversion",
    value: "4.82%",
    hint: "+0.6% after onboarding improvements",
  },
  {
    label: "Avg. Session",
    value: "12m 24s",
    hint: "Longer sessions on admin and reports pages",
  },
] as const

export const analyticsChannels = [
  { channel: "Organic Search", users: "3,420", share: "38%", trend: "+12%" },
  { channel: "Paid Social", users: "1,955", share: "22%", trend: "+7%" },
  { channel: "Referral", users: "1,404", share: "16%", trend: "+4%" },
  { channel: "Direct", users: "1,233", share: "14%", trend: "-2%" },
  { channel: "Email", users: "930", share: "10%", trend: "+9%" },
] as const

export const roadmapCards = [
  {
    title: "Executive Snapshot",
    description: "High-level KPIs for leadership with export-friendly layout.",
  },
  {
    title: "Funnel Insights",
    description: "Acquisition, activation, and retention summary by segment.",
  },
  {
    title: "Campaign Watch",
    description: "Performance trends by channel, region, and release window.",
  },
] as const

export const kanbanColumns = [
  {
    title: "Backlog",
    count: 4,
    tasks: [
      {
        title: "Design partner-facing reports",
        tag: "Design",
        priority: "High",
        owner: "SC",
      },
      {
        title: "Audit settings permission matrix",
        tag: "Security",
        priority: "Medium",
        owner: "PP",
      },
      {
        title: "Create reusable chart module",
        tag: "Frontend",
        priority: "Medium",
        owner: "AR",
      },
      {
        title: "Draft launch checklist for ops team",
        tag: "Ops",
        priority: "Low",
        owner: "JW",
      },
    ],
  },
  {
    title: "In Progress",
    count: 3,
    tasks: [
      {
        title: "Ship analytics overview page",
        tag: "Product",
        priority: "High",
        owner: "AR",
      },
      {
        title: "Refresh dashboard shell styles",
        tag: "Frontend",
        priority: "Medium",
        owner: "SC",
      },
      {
        title: "Map profile permissions by role",
        tag: "Admin",
        priority: "Medium",
        owner: "PP",
      },
    ],
  },
  {
    title: "In Review",
    count: 2,
    tasks: [
      {
        title: "Refine collapsed sidebar behavior",
        tag: "UX",
        priority: "High",
        owner: "JW",
      },
      {
        title: "Standardize page header component",
        tag: "UI",
        priority: "Low",
        owner: "SC",
      },
    ],
  },
  {
    title: "Done",
    count: 3,
    tasks: [
      {
        title: "Add richer dashboard entry page",
        tag: "Dashboard",
        priority: "High",
        owner: "AR",
      },
      {
        title: "Rebrand auth and footer screens",
        tag: "Brand",
        priority: "Low",
        owner: "PP",
      },
      {
        title: "Tighten card styling and spacing",
        tag: "Design",
        priority: "Low",
        owner: "SC",
      },
    ],
  },
] as const

export const profileHighlights = [
  { label: "Role", value: "Product Administrator" },
  { label: "Team", value: "Operations" },
  { label: "Region", value: "North America" },
  { label: "Status", value: "Available" },
] as const

export const profileActivity = [
  "Reviewed dashboard shell refresh for the admin workspace.",
  "Approved access updates for two internal accounts.",
  "Shared product KPI summary with operations leadership.",
  "Updated profile and notification preferences.",
] as const

export const profilePermissions = [
  { area: "Dashboard", access: "Full access" },
  { area: "Analytics", access: "View and export" },
  { area: "Kanban", access: "Edit and move tasks" },
  { area: "Administration", access: "Manage users" },
  { area: "Billing", access: "Restricted" },
] as const
