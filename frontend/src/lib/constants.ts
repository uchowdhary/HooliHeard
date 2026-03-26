export const SOURCE_OPTIONS = [
  { label: "Gong", value: "Gong" },
  { label: "CRs - JIRA", value: "Jira" },
  { label: "SFDC", value: "SFDC" },
];

export const TIME_RANGE_OPTIONS = [
  { label: "All Time", value: "" },
  { label: "Last Week", value: "last_week" },
  { label: "Last Month", value: "last_month" },
  { label: "Last Quarter", value: "last_quarter" },
];

export const PRODUCT_AREAS = [
  { label: "Infra", value: "Infra", color: "#3B82F6" },
  { label: "CKS", value: "CKS", color: "#10B981" },
  { label: "Platform", value: "Platform", color: "#F59E0B" },
  { label: "AI Services", value: "AI Services", color: "#8B5CF6" },
] as const;

export const PRODUCT_AREA_COLORS: Record<string, string> = {
  Infra: "#3B82F6",
  CKS: "#10B981",
  Platform: "#F59E0B",
  "AI Services": "#8B5CF6",
};

export const INSIGHT_CATEGORIES = [
  "Capacity",
  "Capacity Issues",
  "Customer Requirements (Enhancement)",
  "Customer Requirements (Blocker)",
  "Issues",
  "Competition / Alternatives",
  "Pricing / Terms",
  "Process / Operational Friction",
  "Product Fit / Scope",
  "Education Gaps",
  "GTM / Partnership",
  "Success Pattern / Win Signal",
  "Null",
] as const;

export const URGENCY_COLORS: Record<string, string> = {
  High: "#EF4444",
  Medium: "#F59E0B",
  Low: "#10B981",
};

export const OPPORTUNITY_STAGE_COLORS: Record<string, string> = {
  Discovery: "#EC4899",
  "Capacity Review": "#F59E0B",
  "Closed Won": "#10B981",
  "Technical Evaluation": "#6366F1",
  "Legal Redlines": "#F97316",
  Negotiations: "#3B82F6",
  "Closed Lost": "#EF4444",
  Other: "#94A3B8",
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
  "Competition / Alternatives": "Mentions of competitors or alternative solutions",
  "GTM / Partnership": "Go-to-market collaboration or partnership opportunities",
  "Success Pattern / Win Signal": "Positive signals — wins, expansions, advocacy",
  "Process / Operational Friction": "Internal process issues affecting customer experience",
  "Product Fit / Scope": "Product-market fit issues or scope mismatches",
};

export const ICP_OPTIONS = ["AI Enterprise", "AI Native", "AI Native (SMB)"];

export const VERTICAL_OPTIONS = [
  "AI / LLMs", "AI / Research", "AI / Search", "AI Research",
  "AI Research / Generative AI", "Autonomous Vehicles", "Biotech / Drug Discovery",
  "Cybersecurity", "Cybersecurity / Federal", "Financial Services",
  "Financial Services / Quantitative Trading", "Generative AI",
  "Generative AI / Image Generation", "Generative AI / Video", "Multiple",
  "Pharma / Life Sciences", "Robotics", "Robotics / Automotive",
  "Robotics / Humanoid AI", "SaaS / NLP / Writing AI",
];

export const SOURCE_TOOLS: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  Gong: { icon: "G", color: "#7C3AED", label: "Gong" },
  SFDC: { icon: "S", color: "#00A1E0", label: "SFDC" },
  Jira: { icon: "J", color: "#0052CC", label: "Jira" },
};
