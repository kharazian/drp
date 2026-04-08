export const analyticsMetrics = [
  {
    label: "On-Time Delivery",
    value: "96.4%",
    hint: "+1.8 pts after route-window tuning",
  },
  {
    label: "Stops Completed",
    value: "8,942",
    hint: "Stable field throughput across the last 7 days",
  },
  {
    label: "Exceptions Rate",
    value: "4.82%",
    hint: "-0.6 pts after proof-of-delivery checks",
  },
  {
    label: "Dispatch Response",
    value: "12m 24s",
    hint: "Average time to resolve route escalations",
  },
] as const

export const analyticsChannels = [
  {
    channel: "Urban Core Routes",
    users: "3,420",
    share: "38%",
    trend: "+12%",
  },
  {
    channel: "Suburban Loops",
    users: "1,955",
    share: "22%",
    trend: "+7%",
  },
  {
    channel: "Partner Carriers",
    users: "1,404",
    share: "16%",
    trend: "+4%",
  },
  { channel: "Rush Deliveries", users: "1,233", share: "14%", trend: "-2%" },
  {
    channel: "Returns Pickup",
    users: "930",
    share: "10%",
    trend: "+9%",
  },
] as const

export const roadmapCards = [
  {
    title: "Hub Performance",
    description:
      "Monitor throughput, dock readiness, and route backlog by depot.",
  },
  {
    title: "Exception Watch",
    description:
      "Track failed deliveries, redelivery attempts, and SLA-risk stops.",
  },
  {
    title: "Carrier Scorecard",
    description:
      "Compare partner carriers by on-time rate, scan quality, and cost.",
  },
] as const

export const kanbanColumns = [
  {
    title: "Backlog",
    count: 4,
    tasks: [
      {
        title: "Design depot exception dashboard",
        tag: "Reporting",
        priority: "High",
        owner: "SC",
      },
      {
        title: "Audit dispatcher permission matrix",
        tag: "Security",
        priority: "Medium",
        owner: "PP",
      },
      {
        title: "Create route-variance chart pack",
        tag: "Frontend",
        priority: "Medium",
        owner: "AR",
      },
      {
        title: "Draft field rollout checklist for new hub",
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
        title: "Ship driver proof-of-delivery summary",
        tag: "Product",
        priority: "High",
        owner: "AR",
      },
      {
        title: "Refresh dispatch control board visuals",
        tag: "Frontend",
        priority: "Medium",
        owner: "SC",
      },
      {
        title: "Map route-manager permissions by role",
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
        title: "Refine mobile handoff workflow",
        tag: "UX",
        priority: "High",
        owner: "JW",
      },
      {
        title: "Standardize exception summary header",
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
        title: "Add morning dispatch command center",
        tag: "Dashboard",
        priority: "High",
        owner: "AR",
      },
      {
        title: "Rebrand field login and footer screens",
        tag: "Brand",
        priority: "Low",
        owner: "PP",
      },
      {
        title: "Tighten route card styling and spacing",
        tag: "Design",
        priority: "Low",
        owner: "SC",
      },
    ],
  },
] as const

export const profileHighlights = [
  { label: "Role", value: "Dispatch Supervisor" },
  { label: "Hub", value: "Toronto Central" },
  { label: "Coverage", value: "Ontario East" },
  { label: "Shift", value: "Morning Watch" },
] as const

export const profileActivity = [
  "Approved reroute coverage for two delayed suburban loops.",
  "Reviewed proof-of-delivery exceptions from the morning shift.",
  "Shared depot performance summary with regional operations leadership.",
  "Updated dispatch alerts and escalation preferences.",
] as const

export const profilePermissions = [
  { area: "Control Tower", access: "Full access" },
  { area: "Route Analytics", access: "View and export" },
  { area: "Dispatch Board", access: "Edit and assign" },
  { area: "Driver Accounts", access: "Manage access" },
  { area: "Billing", access: "Read only" },
] as const
