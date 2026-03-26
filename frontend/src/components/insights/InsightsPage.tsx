import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { InsightFilters } from "./InsightFilters";
import { InsightTable } from "./InsightTable";
import { InsightDetail } from "./InsightDetail";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { useInsights, useInsight } from "@/hooks/useInsights";
import type { InsightFilters as IFilters } from "@/types/insight";
import type { Insight } from "@/types/insight";

const URL_FILTER_KEYS = [
  "product_area", "insight_category", "account_name", "vertical",
  "icp", "opportunity_stage", "search",
] as const;

export function InsightsPage() {
  const [searchParams] = useSearchParams();

  // Build initial filters from URL search params (set by dashboard chart clicks)
  const urlFilters: Partial<IFilters> = {};
  for (const key of URL_FILTER_KEYS) {
    const val = searchParams.get(key);
    if (val) urlFilters[key] = val;
  }

  const [filters, setFilters] = useState<IFilters>({
    page: 1,
    page_size: 20,
    sort_by: "priority_score",
    ...urlFilters,
  });

  // Update filters when URL params change (e.g. clicking from dashboard)
  useEffect(() => {
    const newUrlFilters: Partial<IFilters> = {};
    for (const key of URL_FILTER_KEYS) {
      const val = searchParams.get(key);
      if (val) newUrlFilters[key] = val;
    }
    if (Object.keys(newUrlFilters).length > 0) {
      setFilters((f) => ({ ...f, ...newUrlFilters, page: 1 }));
    }
  }, [searchParams]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError, error, refetch } = useInsights(filters);
  const detail = useInsight(selectedId);

  const handleSelect = (insight: Insight) => {
    setSelectedId(insight.id);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { exportInsightsCsv } = await import("@/api/insights");
      const blob = await exportInsightsCsv(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "insights_export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-6">
      <InsightFilters filters={filters} onChange={setFilters} />

      <div className="flex-1 space-y-4">
        {isError && (
          <ErrorAlert
            message={String(error)}
            onRetry={() => refetch()}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {data
                ? `Showing ${data.items.length} of ${data.total} insights`
                : isLoading
                  ? "Loading..."
                  : ""}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        {/* Table */}
        <InsightTable
          data={data?.items ?? []}
          loading={isLoading}
          onSelect={handleSelect}
        />

        {/* Pagination */}
        {data && data.total > data.page_size && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))
              }
              disabled={(filters.page ?? 1) <= 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {data.page} of {Math.ceil(data.total / data.page_size)}
            </span>
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
              }
              disabled={
                (filters.page ?? 1) >=
                Math.ceil(data.total / data.page_size)
              }
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail slide-over */}
      {selectedId && (
        <InsightDetail
          insight={detail.data}
          loading={detail.isLoading}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
