import { useState, useMemo } from "react";
import { Badge } from "@/components/shared/Badge";
import { PRODUCT_AREA_COLORS, URGENCY_COLORS, SOURCE_TOOLS } from "@/lib/constants";
import { truncate, formatDate, formatCurrency, cn } from "@/lib/utils";
import type { Insight } from "@/types/insight";

interface Props {
  data: Insight[];
  loading: boolean;
  onSelect: (insight: Insight) => void;
}

type SortDir = "asc" | "desc";

/** Extract unique non-null values from a column */
function uniqueValues(data: Insight[], key: keyof Insight): string[] {
  const set = new Set<string>();
  for (const row of data) {
    const val = row[key];
    if (val != null && val !== "") set.add(String(val));
  }
  return [...set].sort();
}

export function InsightTable({ data, loading, onSelect }: Props) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  const updateColFilter = (key: string, value: string) => {
    setColFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  };

  // Apply column-level filters
  const filtered = useMemo(() => {
    let rows = data;
    for (const [key, val] of Object.entries(colFilters)) {
      if (val) {
        rows = rows.filter((row) => String((row as unknown as Record<string, unknown>)[key] ?? "") === val);
      }
    }
    return rows;
  }, [data, colFilters]);

  // Apply sorting
  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    const sortFns: Record<string, (row: Insight) => string | number> = {
      priority: (r) => r.priority_score ?? 0,
      opportunity: (r) => r.opportunity_amount ?? 0,
      date: (r) => r.date_of_record,
    };
    const fn = sortFns[sortCol];
    if (!fn) return filtered;
    return [...filtered].sort((a, b) => {
      const va = fn(a);
      const vb = fn(b);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortCol, sortDir]);

  const handleSort = (key: string) => {
    if (sortCol === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(key); setSortDir("desc"); }
  };

  const hasColFilters = Object.keys(colFilters).length > 0;

  const selectClass =
    "w-full mt-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-600 focus:border-blue-400 focus:outline-none";

  // Unique values for column filters (computed from full dataset, not filtered)
  const areaOptions = useMemo(() => uniqueValues(data, "product_area"), [data]);
  const categoryOptions = useMemo(() => uniqueValues(data, "insight_category"), [data]);
  const sourceOptions = useMemo(() => uniqueValues(data, "source_tool"), [data]);
  const urgencyOptions = useMemo(() => uniqueValues(data, "urgency_level"), [data]);

  if (loading) {
    return (
      <div className="card space-y-3 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card flex h-48 items-center justify-center text-sm text-slate-500">
        No insights match your filters
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {hasColFilters && (
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
          <span className="text-xs text-slate-500">
            {sorted.length} of {data.length} rows shown (column filters active)
          </span>
          <button
            onClick={() => setColFilters({})}
            className="text-xs font-medium text-blue-500 hover:text-blue-700"
          >
            Clear column filters
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-4 py-2 text-left" style={{ width: "80px" }}>
                <div
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:text-slate-700"
                  onClick={() => handleSort("priority")}
                >
                  Priority
                  {sortCol === "priority" && <span className="text-slate-400">{sortDir === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
              <th className="px-4 py-2 text-left" style={{ width: "140px" }}>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account</div>
              </th>
              <th className="px-4 py-2 text-left">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Insight</div>
              </th>
              <th className="px-4 py-2 text-left" style={{ width: "130px" }}>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Area</div>
                <select value={colFilters.product_area ?? ""} onChange={(e) => updateColFilter("product_area", e.target.value)} className={selectClass}>
                  <option value="">All</option>
                  {areaOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </th>
              <th className="px-4 py-2 text-left" style={{ width: "160px" }}>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category</div>
                <select value={colFilters.insight_category ?? ""} onChange={(e) => updateColFilter("insight_category", e.target.value)} className={selectClass}>
                  <option value="">All</option>
                  {categoryOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </th>
              <th className="px-4 py-2 text-left" style={{ width: "80px" }}>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Urgency</div>
                <select value={colFilters.urgency_level ?? ""} onChange={(e) => updateColFilter("urgency_level", e.target.value)} className={selectClass}>
                  <option value="">All</option>
                  {urgencyOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </th>
              <th className="px-4 py-2 text-left" style={{ width: "90px" }}>
                <div
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:text-slate-700"
                  onClick={() => handleSort("opportunity")}
                >
                  Opp $
                  {sortCol === "opportunity" && <span className="text-slate-400">{sortDir === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
              <th className="px-4 py-2 text-left" style={{ width: "70px" }}>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Source</div>
                <select value={colFilters.source_tool ?? ""} onChange={(e) => updateColFilter("source_tool", e.target.value)} className={selectClass}>
                  <option value="">All</option>
                  {sourceOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </th>
              <th className="px-4 py-2 text-left" style={{ width: "100px" }}>
                <div
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:text-slate-700"
                  onClick={() => handleSort("date")}
                >
                  Date
                  {sortCol === "date" && <span className="text-slate-400">{sortDir === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50"
                onClick={() => onSelect(row)}
              >
                <td className="px-4 py-3.5">
                  {row.priority_score != null ? (
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                      row.priority_score >= 5 ? "text-red-700 bg-red-50" :
                      row.priority_score >= 2 ? "text-amber-700 bg-amber-50" :
                      "text-slate-600 bg-slate-50"
                    }`}>
                      {row.priority_score.toFixed(1)}
                    </span>
                  ) : <span className="text-xs text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3.5">
                  <div>
                    <span className="font-medium text-slate-900">{row.account_name}</span>
                    {row.account_priority_group && (
                      <span className="ml-1 text-[9px] font-semibold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                        {row.account_priority_group}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-slate-600">{truncate(row.insight_text, 100)}</span>
                </td>
                <td className="px-4 py-3.5">
                  <Badge label={row.product_area} color={PRODUCT_AREA_COLORS[row.product_area]} variant="subtle" />
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-slate-600">{row.insight_category}</span>
                </td>
                <td className="px-4 py-3.5">
                  {row.urgency_level ? (
                    <Badge label={row.urgency_level} color={URGENCY_COLORS[row.urgency_level] ?? "#94a3b8"} variant="subtle" />
                  ) : <span className="text-xs text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-slate-600 tabular-nums">
                    {row.opportunity_amount ? formatCurrency(row.opportunity_amount) : "—"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  {(() => {
                    const tool = SOURCE_TOOLS[row.source_tool];
                    if (!tool) return <span className="text-xs text-slate-500">{row.source_tool}</span>;
                    return (
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white"
                        style={{ backgroundColor: tool.color }}
                        title={tool.label}
                      >
                        {tool.icon}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-slate-500 tabular-nums">{formatDate(row.date_of_record)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
