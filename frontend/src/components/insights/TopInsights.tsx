import { useInsights } from "@/hooks/useInsights";
import { Badge } from "@/components/shared/Badge";
import { PRODUCT_AREA_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { InsightFilters } from "@/types/insight";
import type { Insight } from "@/types/insight";

interface Props {
  filters: InsightFilters;
  onSelect: (insight: Insight) => void;
}

function summarize(insight: Insight): string {
  const parts: string[] = [];

  // Account context
  if (insight.account_name) {
    parts.push(`${insight.account_name}`);
    if (insight.icp) parts[0] += ` (${insight.icp})`;
  }

  // Opportunity context
  if (insight.opportunity_amount && insight.opportunity_amount > 0) {
    parts.push(`${formatCurrency(insight.opportunity_amount)} pipeline`);
  }
  if (insight.opportunity_stage) {
    parts.push(`Stage: ${insight.opportunity_stage}`);
  }

  return parts.join(" · ");
}

function priorityLabel(score: number | undefined): { text: string; className: string } {
  if (score == null) return { text: "—", className: "text-slate-400" };
  if (score >= 5) return { text: "Critical", className: "text-red-600 bg-red-50" };
  if (score >= 3) return { text: "High", className: "text-amber-600 bg-amber-50" };
  return { text: "Medium", className: "text-blue-600 bg-blue-50" };
}

export function TopInsights({ filters, onSelect }: Props) {
  const { data, isLoading } = useInsights({
    ...filters,
    page: 1,
    page_size: 3,
    sort_by: "priority_score",
    unique_insight_status: "Key Record",
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-40 animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  const items = data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">
        Top Priority Insights
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((insight, idx) => {
          const priority = priorityLabel(insight.priority_score);
          return (
            <div
              key={insight.id}
              className="card cursor-pointer border-l-4 p-4 transition-shadow hover:shadow-md"
              style={{ borderLeftColor: PRODUCT_AREA_COLORS[insight.product_area] ?? "#94A3B8" }}
              onClick={() => onSelect(insight)}
            >
              {/* Header: rank + priority + area */}
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                  {idx + 1}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priority.className}`}>
                  {insight.priority_score?.toFixed(1)} — {priority.text}
                </span>
                <Badge
                  label={insight.product_area}
                  color={PRODUCT_AREA_COLORS[insight.product_area]}
                  variant="subtle"
                />
              </div>

              {/* Insight text */}
              <p className="mb-2 text-sm leading-snug text-slate-700 line-clamp-3">
                {insight.insight_text}
              </p>

              {/* Context line */}
              <p className="text-[11px] text-slate-500">
                {summarize(insight)}
              </p>

              {/* Category + source */}
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  {insight.insight_category}
                </span>
                <span className="text-[10px] text-slate-400">
                  via {insight.source_tool}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
