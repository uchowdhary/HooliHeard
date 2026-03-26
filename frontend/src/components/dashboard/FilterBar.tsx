import { useSearchParams } from "react-router-dom";
import { PRODUCT_AREAS, INSIGHT_CATEGORIES, SOURCE_OPTIONS, TIME_RANGE_OPTIONS, ICP_OPTIONS, VERTICAL_OPTIONS } from "@/lib/constants";

export function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();

  const productArea = searchParams.get("product_area") ?? "";
  const category = searchParams.get("insight_category") ?? "";
  const vertical = searchParams.get("vertical") ?? "";
  const icp = searchParams.get("icp") ?? "";
  const sourceTool = searchParams.get("source_tool") ?? "";
  const timeRange = searchParams.get("time_range") ?? "";
  const accountName = searchParams.get("account_name") ?? "";

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // When time_range changes, compute date_from
    if (key === "time_range") {
      next.delete("date_from");
      if (value) {
        const now = new Date();
        let from: Date | null = null;
        if (value === "last_week") from = new Date(now.getTime() - 7 * 86400000);
        else if (value === "last_month") from = new Date(now.getTime() - 30 * 86400000);
        else if (value === "last_quarter") from = new Date(now.getTime() - 90 * 86400000);
        if (from) next.set("date_from", from.toISOString().slice(0, 10));
      }
    }
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchParams({});
  };

  const hasFilters = productArea || category || vertical || icp || sourceTool || timeRange || accountName;

  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="card flex flex-wrap items-center gap-3 px-6 py-4">
      <span className="text-sm font-medium text-slate-600">Filters</span>

      <select
        value={productArea}
        onChange={(e) => updateParam("product_area", e.target.value)}
        className={selectClass}
      >
        <option value="">All Product Areas</option>
        {PRODUCT_AREAS.map((pa) => (
          <option key={pa.value} value={pa.value}>
            {pa.label}
          </option>
        ))}
      </select>

      <select
        value={category}
        onChange={(e) => updateParam("insight_category", e.target.value)}
        className={selectClass}
      >
        <option value="">All Categories</option>
        {INSIGHT_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select
        value={icp}
        onChange={(e) => updateParam("icp", e.target.value)}
        className={selectClass}
      >
        <option value="">All ICP Tiers</option>
        {ICP_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={vertical}
        onChange={(e) => updateParam("vertical", e.target.value)}
        className={selectClass}
      >
        <option value="">All Verticals</option>
        {VERTICAL_OPTIONS.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>

      <select
        value={sourceTool}
        onChange={(e) => updateParam("source_tool", e.target.value)}
        className={selectClass}
      >
        <option value="">All Sources</option>
        {SOURCE_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search accounts..."
        value={accountName}
        onChange={(e) => updateParam("account_name", e.target.value)}
        className={`${selectClass} w-40`}
      />

      <select
        value={timeRange}
        onChange={(e) => updateParam("time_range", e.target.value)}
        className={selectClass}
      >
        {TIME_RANGE_OPTIONS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="ml-auto text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
