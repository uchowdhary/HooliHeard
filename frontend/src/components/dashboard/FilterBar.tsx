import { useSearchParams } from "react-router-dom";
import { PRODUCT_AREAS, INSIGHT_CATEGORIES } from "@/lib/constants";

export function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();

  const productArea = searchParams.get("product_area") ?? "";
  const category = searchParams.get("insight_category") ?? "";

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchParams({});
  };

  const hasFilters = productArea || category;

  return (
    <div className="card flex items-center gap-4 px-6 py-4">
      <span className="text-sm font-medium text-slate-600">Filters</span>

      <select
        value={productArea}
        onChange={(e) => updateParam("product_area", e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All Categories</option>
        {INSIGHT_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
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
