import type { Insight } from "@/types/insight";
import { Badge } from "@/components/shared/Badge";
import { PRODUCT_AREA_COLORS, URGENCY_COLORS, SOURCE_TOOLS } from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Props {
  insight: Insight | undefined;
  loading: boolean;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

export function InsightDetail({ insight, loading, onClose }: Props) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Insight Detail
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading || !insight ? (
            <div className="space-y-4">
              <div className="h-6 w-1/3 animate-pulse rounded bg-slate-100" />
              <div className="h-32 animate-pulse rounded bg-slate-100" />
              <div className="h-6 w-1/2 animate-pulse rounded bg-slate-100" />
            </div>
          ) : (
            <>
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  label={insight.product_area}
                  color={PRODUCT_AREA_COLORS[insight.product_area]}
                  variant="filled"
                />
                <Badge label={insight.insight_category} />
                <Badge
                  label={
                    insight.unique_insight_status === "Key Record"
                      ? "Key Record"
                      : "Duplicate"
                  }
                  color={
                    insight.unique_insight_status === "Key Record"
                      ? "#10B981"
                      : "#94a3b8"
                  }
                  variant="subtle"
                />
                {insight.urgency_level && (
                  <Badge
                    label={insight.urgency_level}
                    color={URGENCY_COLORS[insight.urgency_level] ?? "#94a3b8"}
                    variant="subtle"
                  />
                )}
                {insight.priority_score != null && (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    insight.priority_score >= 5
                      ? "bg-red-50 text-red-700"
                      : insight.priority_score >= 2
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }`}>
                    Priority: {insight.priority_score.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Insight Text */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Insight
                </label>
                <p className="text-sm leading-relaxed text-slate-700">
                  {insight.insight_text}
                </p>
              </div>

              {/* Account Card */}
              <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Account
                </label>
                <p className="text-sm font-semibold text-slate-900">
                  {insight.account_name}
                  {insight.account_priority_group && (
                    <span className="ml-2 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      {insight.account_priority_group}
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-2">
                  {insight.icp && (
                    <div>
                      <span className="text-slate-400">ICP:</span>{" "}
                      <span className="font-medium text-slate-700">{insight.icp}</span>
                    </div>
                  )}
                  {insight.vertical && (
                    <div>
                      <span className="text-slate-400">Vertical:</span>{" "}
                      <span className="font-medium text-slate-700">{insight.vertical}</span>
                    </div>
                  )}
                  {insight.opportunity_amount != null && (
                    <div>
                      <span className="text-slate-400">Opportunity:</span>{" "}
                      <span className="font-medium text-slate-700">{formatCurrency(insight.opportunity_amount)}</span>
                    </div>
                  )}
                  {insight.opportunity_stage && (
                    <div>
                      <span className="text-slate-400">Stage:</span>{" "}
                      <span className="font-medium text-slate-700">{insight.opportunity_stage}</span>
                    </div>
                  )}
                  {insight.total_revenue != null && insight.total_revenue > 0 && (
                    <div>
                      <span className="text-slate-400">Revenue:</span>{" "}
                      <span className="font-medium text-slate-700">{formatCurrency(insight.total_revenue)}</span>
                    </div>
                  )}
                  {insight.closed_won_opp_count != null && (
                    <div>
                      <span className="text-slate-400">Won Opps:</span>{" "}
                      <span className="font-medium text-slate-700">{insight.closed_won_opp_count}</span>
                    </div>
                  )}
                  {insight.gpu_types && (
                    <div className="col-span-2">
                      <span className="text-slate-400">GPU Types:</span>{" "}
                      <span className="font-medium text-slate-700">{insight.gpu_types}</span>
                    </div>
                  )}
                  {insight.competitors_mentioned && (
                    <div className="col-span-2">
                      <span className="text-slate-400">Competitors:</span>{" "}
                      <span className="font-medium text-red-600">{insight.competitors_mentioned}</span>
                    </div>
                  )}
                  {insight.workloads && (
                    <div className="col-span-2">
                      <span className="text-slate-400">Workloads:</span>{" "}
                      <span className="font-medium text-slate-700">{insight.workloads}</span>
                    </div>
                  )}
                </div>
                {insight.role_present && (
                  <p className="mt-1 text-xs text-slate-500">
                    Contact: {insight.role_present}
                  </p>
                )}
              </div>

              {/* Source */}
              <div className="rounded-lg border border-slate-200 p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Source
                </label>
                <div className="flex items-center gap-3">
                  {SOURCE_TOOLS[insight.source_tool] && (
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                      style={{
                        backgroundColor:
                          SOURCE_TOOLS[insight.source_tool].color,
                      }}
                    >
                      {SOURCE_TOOLS[insight.source_tool].icon}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {SOURCE_TOOLS[insight.source_tool]?.label ??
                        insight.source_tool}
                    </p>
                    <p className="text-xs text-slate-500">
                      {insight.input_data_source}
                    </p>
                  </div>
                </div>
                {insight.source_link && (
                  <a
                    href={insight.source_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    View source
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-xs text-slate-500">
                <DetailRow label="Product Subcategory" value={insight.product_subcategory} />
                <DetailRow label="Date of Record" value={formatDate(insight.date_of_record)} />
                <DetailRow label="Use Case" value={insight.use_case} />
                <DetailRow label="Conversation Type" value={insight.conversation_type} />
                <DetailRow label="Dedup Group" value={insight.dedup_group_key} />
                <DetailRow label="Comments" value={insight.comments} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
