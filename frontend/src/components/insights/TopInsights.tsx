import { useInsights } from "@/hooks/useInsights";
import { PRODUCT_AREA_COLORS } from "@/lib/constants";
import { formatCurrency, truncate } from "@/lib/utils";
import type { InsightFilters } from "@/types/insight";
import type { Insight } from "@/types/insight";

interface Props {
  filters: InsightFilters;
  onSelect: (insight: Insight) => void;
}

/** Build an exec-friendly one-liner from the raw insight text. */
function execSummary(insight: Insight): string {
  // Trim and cap at ~120 chars for a clean headline
  const text = insight.insight_text?.trim() ?? "";
  if (text.length <= 140) return text;
  return text.slice(0, 137).replace(/\s+\S*$/, "") + "...";
}

/** Business impact line — pipeline, stage, ICP */
function impactLine(insight: Insight): string {
  const parts: string[] = [];
  if (insight.opportunity_amount && insight.opportunity_amount > 0) {
    parts.push(`${formatCurrency(insight.opportunity_amount)} pipeline at risk`);
  }
  if (insight.opportunity_stage) {
    parts.push(insight.opportunity_stage);
  }
  if (insight.icp) {
    parts.push(insight.icp);
  }
  return parts.join(" · ");
}

function urgencyBadge(score: number | undefined): { text: string; bg: string; text_color: string } {
  if (score == null) return { text: "—", bg: "bg-slate-100", text_color: "text-slate-400" };
  if (score >= 5) return { text: "URGENT", bg: "bg-red-100", text_color: "text-red-700" };
  if (score >= 3) return { text: "HIGH", bg: "bg-amber-100", text_color: "text-amber-700" };
  return { text: "MONITOR", bg: "bg-blue-100", text_color: "text-blue-700" };
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
          <div key={i} className="card h-36 animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  const items = data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900">
          Top Customer Priorities
        </h3>
        <span className="text-xs text-slate-400">Ranked by business impact</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((insight, idx) => {
          const urgency = urgencyBadge(insight.priority_score);
          const impact = impactLine(insight);
          const areaColor = PRODUCT_AREA_COLORS[insight.product_area] ?? "#94A3B8";

          return (
            <div
              key={insight.id}
              className="card cursor-pointer border-l-4 p-4 transition-shadow hover:shadow-md"
              style={{ borderLeftColor: areaColor }}
              onClick={() => onSelect(insight)}
            >
              {/* Top row: rank + urgency + product area */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${urgency.bg} ${urgency.text_color}`}>
                    {urgency.text}
                  </span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: areaColor }}
                >
                  {insight.product_area}
                </span>
              </div>

              {/* Theme / category as headline */}
              <p className="mb-1 text-xs font-semibold text-slate-800">
                {insight.insight_category}
              </p>

              {/* Exec-friendly summary */}
              <p className="mb-2 text-sm leading-snug text-slate-600 line-clamp-2">
                {execSummary(insight)}
              </p>

              {/* Business impact */}
              {impact && (
                <p className="mb-1 text-[11px] font-medium text-slate-500">
                  {impact}
                </p>
              )}

              {/* Account + source */}
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-[11px] font-medium text-slate-700">
                  {truncate(insight.account_name || "Unknown", 25)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {insight.source_tool} · {insight.date_of_record?.toString().slice(0, 10)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
