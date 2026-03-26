import { PRODUCT_AREAS, INSIGHT_CATEGORIES, SOURCE_OPTIONS, TIME_RANGE_OPTIONS } from "@/lib/constants";
import type { InsightFilters as IFilters } from "@/types/insight";

interface Props {
  filters: IFilters;
  onChange: (filters: IFilters) => void;
}

const ICP_OPTIONS = ["AI Enterprise", "AI Native", "Enterprise", "SMB"];
const SORT_OPTIONS = [
  { label: "Date (newest)", value: "date_of_record" },
  { label: "Priority (highest)", value: "priority_score" },
  { label: "Opportunity $ (highest)", value: "opportunity_amount" },
  { label: "Revenue (highest)", value: "total_revenue" },
  { label: "Account name", value: "account_name" },
];

export function InsightFilters({ filters, onChange }: Props) {
  const update = (key: keyof IFilters, value: string | number) => {
    // Use strict check: empty string clears, but 0 is a valid value
    const resolved = value === "" ? undefined : value;
    onChange({ ...filters, [key]: resolved, page: 1 });
  };

  const clear = () => {
    onChange({ page: 1, page_size: 20, sort_by: "priority_score" });
  };

  const selectClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="w-64 shrink-0 space-y-5">
      <div className="card p-5 space-y-5">
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>

        {/* Sort */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Sort By
          </label>
          <select
            value={filters.sort_by ?? ""}
            onChange={(e) => update("sort_by", e.target.value)}
            className={selectClass}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Product Area */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Product Area
          </label>
          <select
            value={filters.product_area ?? ""}
            onChange={(e) => update("product_area", e.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {PRODUCT_AREAS.map((pa) => (
              <option key={pa.value} value={pa.value}>
                {pa.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Category
          </label>
          <select
            value={filters.insight_category ?? ""}
            onChange={(e) => update("insight_category", e.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {INSIGHT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* ICP Tier */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            ICP Tier
          </label>
          <select
            value={filters.icp ?? ""}
            onChange={(e) => update("icp", e.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {ICP_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Source
          </label>
          <select
            value={filters.source_tool ?? ""}
            onChange={(e) => update("source_tool", e.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Time Range
          </label>
          <select
            value={filters.time_range ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              // Compute date_from from time_range
              let dateFrom = "";
              if (val) {
                const now = new Date();
                let from: Date | null = null;
                if (val === "last_week") from = new Date(now.getTime() - 7 * 86400000);
                else if (val === "last_month") from = new Date(now.getTime() - 30 * 86400000);
                else if (val === "last_quarter") from = new Date(now.getTime() - 90 * 86400000);
                if (from) dateFrom = from.toISOString().slice(0, 10);
              }
              onChange({
                ...filters,
                time_range: val || undefined,
                date_from: dateFrom || undefined,
                date_to: undefined,
                page: 1,
              });
            }}
            className={selectClass}
          >
            {TIME_RANGE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Account search */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Account
          </label>
          <input
            type="text"
            placeholder="Search accounts..."
            value={filters.account_name ?? ""}
            onChange={(e) => update("account_name", e.target.value)}
            className={selectClass}
          />
        </div>

        {/* Date range */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Date From
          </label>
          <input
            type="date"
            value={filters.date_from ?? ""}
            onChange={(e) => update("date_from", e.target.value)}
            className={selectClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Date To
          </label>
          <input
            type="date"
            value={filters.date_to ?? ""}
            onChange={(e) => update("date_to", e.target.value)}
            className={selectClass}
          />
        </div>

        {/* Dedup status */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Status
          </label>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {[
              { label: "All", value: "" },
              { label: "Key Only", value: "Key Record" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => update("unique_insight_status", opt.value)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  (filters.unique_insight_status ?? "") === opt.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={clear}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
