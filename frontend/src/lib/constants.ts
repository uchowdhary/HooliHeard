export const PRODUCT_AREAS = [
  { label: "Infra", value: "Infra", color: "#3B82F6" },
  { label: "CKS", value: "CKS", color: "#10B981" },
  { label: "Platform", value: "Platform", color: "#F59E0B" },
  { label: "AI Services", value: "AI Services", color: "#8B5CF6" },
  { label: "W&B", value: "W&B", color: "#EC4899" },
] as const;

export const PRODUCT_AREA_COLORS: Record<string, string> = {
  Infra: "#3B82F6",
  CKS: "#10B981",
  Platform: "#F59E0B",
  "AI Services": "#8B5CF6",
  "W&B": "#EC4899",
};

export const INSIGHT_CATEGORIES = [
  "Capacity",
  "Capacity Issues",
  "Pricing / Terms",
  "Customer Requirements (Enhancement)",
  "Customer Requirements (Blocker)",
  "Issues",
  "Education Gaps",
  "Null",
  "Product Fit / Scope",
  "Competition / Alternatives",
  "GTM / Partnership",
  "Success Pattern / Win Signal",
  "Process / Operational Friction",
] as const;

export const URGENCY_COLORS: Record<string, string> = {
  High: "#EF4444",
  Medium: "#F59E0B",
  Low: "#10B981",
};

export const OPPORTUNITY_STAGE_COLORS: Record<string, string> = {
  "Closed Won": "#10B981",
  "Closed Lost": "#EF4444",
  Negotiation: "#3B82F6",
  Negotiations: "#3B82F6",
  Proposal: "#8B5CF6",
  "Capacity Review": "#F59E0B",
  Discovery: "#EC4899",
  "Discovery / Prospect": "#EC4899",
  "Technical Evaluation": "#6366F1",
  "Active Discussion / BMaaS": "#F97316",
  "Active Customer": "#14B8A6",
  Prospecting: "#6B7280",
  New: "#94A3B8",
};

export const CATEGORY_DEFINITIONS: Record<string, string> = {
  "Capacity": "Customer needs for compute, GPU, or storage capacity",
  "Capacity Issues": "Existing capacity problems — outages, delays, shortages",
  "Pricing / Terms": "Pricing concerns, contract terms, commercial negotiations",
  "Customer Requirements (Enhancement)": "Feature requests or improvements to existing capabilities",
  "Customer Requirements (Blocker)": "Missing capabilities that block adoption or expansion",
  "Issues": "Bugs, technical problems, or service disruptions",
  "Education Gaps": "Customer confusion or lack of documentation/training",
  "Null": "Uncategorized or informational signals",
  "Product Fit / Scope": "Whether product capabilities match the customer's use case",
  "Competition / Alternatives": "Mentions of competitors or alternative solutions",
  "GTM / Partnership": "Go-to-market collaboration or partnership opportunities",
  "Success Pattern / Win Signal": "Positive signals — wins, expansions, advocacy",
  "Process / Operational Friction": "Internal process issues affecting customer experience",
};

export const SOURCE_TOOLS: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  Gong: { icon: "G", color: "#7C3AED", label: "Gong" },
  Salesforce: { icon: "S", color: "#00A1E0", label: "Salesforce" },
  Jira: { icon: "J", color: "#0052CC", label: "Jira" },
  Slack: { icon: "#", color: "#E01E5A", label: "Slack" },
  Qualtrics: { icon: "Q", color: "#1BAD4F", label: "Qualtrics" },
};
