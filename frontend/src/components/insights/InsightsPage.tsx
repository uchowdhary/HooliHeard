import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { InsightFilters } from "./InsightFilters";
import { InsightTable } from "./InsightTable";
import { InsightDetail } from "./InsightDetail";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { useInsights, useInsight } from "@/hooks/useInsights";
import type { InsightFilters as IFilters } from "@/types/insight";
import type { Insight } from "@/types/insight";

/** Keys that sync between the URL and internal filter state */
const URL_FILTER_KEYS = [
  "product_area", "insight_category", "account_name", "vertical",
  "icp", "opportunity_stage", "search",
] as const;

function filtersFromParams(sp: URLSearchParams): Partial<IFilters> {
  const out: Partial<IFilters> = {};
  for (const key of URL_FILTER_KEYS) {
    const val = sp.get(key);
    if (val) out[key] = val;
  }
  return out;
}

export function InsightsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFiltersRaw] = useState<IFilters>(() => ({
    page: 1,
    page_size: 20,
    sort_by: "priority_score",
    ...filtersFromParams(searchParams),
  }));

  // Track whether we're updating from URL to avoid circular updates
  const fromUrl = useRef(false);

  // Wrapper: when filters change locally, also push shared keys to URL
  const setFilters = useCallback((next: IFilters | ((prev: IFilters) => IFilters)) => {
    setFiltersRaw((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;

      // Push shared filter keys to URL so sidebar can carry them
      const sp = new URLSearchParams(window.location.search);
      let changed = false;
      for (const key of URL_FILTER_KEYS) {
        const val = resolved[key];
        if (val && sp.get(key) !== String(val)) { sp.set(key, String(val)); changed = true; }
        else if (!val && sp.has(key)) { sp.delete(key); changed = true; }
      }
      if (changed) {
        fromUrl.current = true;
        setSearchParams(sp, { replace: true });
      }

      return resolved;
    });
  }, [setSearchParams]);

  // When URL params change externally (e.g. navigating from dashboard), sync to state
  useEffect(() => {
    if (fromUrl.current) { fromUrl.current = false; return; }
    const incoming = filtersFromParams(searchParams);
    if (Object.keys(incoming).length > 0) {
      setFiltersRaw((f) => ({ ...f, ...incoming, page: 1 }));
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
