import { useState } from "react";
import { InsightFilters } from "./InsightFilters";
import { InsightTable } from "./InsightTable";
import { InsightDetail } from "./InsightDetail";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { useInsights, useInsight } from "@/hooks/useInsights";
import type { InsightFilters as IFilters } from "@/types/insight";
import type { Insight } from "@/types/insight";

export function InsightsPage() {
  const [filters, setFilters] = useState<IFilters>({
    page: 1,
    page_size: 20,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useInsights(filters);
  const detail = useInsight(selectedId);

  const handleSelect = (insight: Insight) => {
    setSelectedId(insight.id);
  };

  return (
    <div className="flex gap-6">
      <InsightFilters filters={filters} onChange={setFilters} />

      <div className="flex-1 space-y-4">
        {/* Error */}
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
