import { useSearchParams } from "react-router-dom";
import { PRODUCT_AREAS, INSIGHT_CATEGORIES } from "@/lib/constants";

const ICP_OPTIONS = ["AI Enterprise", "AI Native", "Enterprise", "SMB"];
const VERTICAL_OPTIONS = [
  "AI/ML", "Autonomous Vehicles", "Cloud & Infrastructure",
  "Cybersecurity", "Defense & Government", "Energy & Sustainability",
  "Financial Services", "Healthcare & Life Sciences", "Media & Entertainment",
  "Robotics", "Social Media & Networking", "Technology & SaaS",
];

export function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();

  const productArea = searchParams.get("product_area") ?? "";
  const category = searchParams.get("insight_category") ?? "";
  const vertical = searchParams.get("vertical") ?? "";
  const icp = searchParams.get("icp") ?? "";

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

  const hasFilters = productArea || category || vertical || icp;

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
