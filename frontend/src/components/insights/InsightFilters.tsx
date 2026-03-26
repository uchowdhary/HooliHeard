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
    const resolved = value === "" ? undefined : value;
    onChange({ ...filters, [key]: resolved, page: 1 });
  };

  const clear = () => {
    onChange({ page: 1, page_size: 20, sort_by: "priority_score" });
  };

  const hasFilters = filters.product_area || filters.insight_category || filters.icp
    || filters.source_tool || filters.time_range || filters.account_name
    || filters.unique_insight_status === "Key Record";

  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="card flex flex-wrap items-center gap-3 px-6 py-4">
      <span className="text-sm font-medium text-slate-600">Filters</span>

      <select
        value={filters.product_area ?? ""}
        onChange={(e) => update("product_area", e.target.value)}
        className={selectClass}
      >
        <option value="">All Product Areas</option>
        {PRODUCT_AREAS.map((pa) => (
          <option key={pa.value} value={pa.value}>{pa.label}</option>
        ))}
      </select>

      <select
        value={filters.insight_category ?? ""}
        onChange={(e) => update("insight_category", e.target.value)}
        className={selectClass}
      >
        <option value="">All Categories</option>
        {INSIGHT_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <select
        value={filters.icp ?? ""}
        onChange={(e) => update("icp", e.target.value)}
        className={selectClass}
      >
        <option value="">All ICP Tiers</option>
        {ICP_OPTIONS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        value={filters.source_tool ?? ""}
        onChange={(e) => update("source_tool", e.target.value)}
        className={selectClass}
      >
        <option value="">All Sources</option>
        {SOURCE_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filters.time_range ?? ""}
        onChange={(e) => {
          const val = e.target.value;
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
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search accounts..."
        value={filters.account_name ?? ""}
        onChange={(e) => update("account_name", e.target.value)}
        className={`${selectClass} w-40`}
      />

      <select
        value={filters.sort_by ?? ""}
        onChange={(e) => update("sort_by", e.target.value)}
        className={selectClass}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {[
          { label: "All", value: "" },
          { label: "Key Only", value: "Key Record" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => update("unique_insight_status", opt.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              (filters.unique_insight_status ?? "") === opt.value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {hasFilters && (
        <button
          onClick={clear}
          className="ml-auto text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
