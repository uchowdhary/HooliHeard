import { useNavigate } from "react-router-dom";
import { Card } from "@/components/shared/Card";
import { PRODUCT_AREA_COLORS } from "@/lib/constants";
import type { ThemeHeatmapCell } from "@/types/dashboard";

interface Props {
  data?: ThemeHeatmapCell[];
  loading?: boolean;
}

function intensityColor(count: number, max: number): string {
  if (max === 0) return "bg-gray-50";
  const ratio = count / max;
  if (ratio >= 0.75) return "bg-orange-500 text-white";
  if (ratio >= 0.5) return "bg-orange-400 text-white";
  if (ratio >= 0.25) return "bg-orange-200 text-orange-900";
  if (count > 0) return "bg-orange-100 text-orange-800";
  return "bg-gray-50 text-gray-300";
}

export function ThemeHeatmap({ data, loading }: Props) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card title="Theme Heatmap by Product Area">
        <div className="flex h-64 items-center justify-center text-gray-400">Loading...</div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card title="Theme Heatmap by Product Area">
        <div className="flex h-64 items-center justify-center text-gray-400">No data</div>
      </Card>
    );
  }

  // Build matrix: rows = product areas, cols = categories
  const areas = [...new Set(data.map((d) => d.product_area))];
  const categories = [...new Set(data.map((d) => d.insight_category))];

  // Sort categories by total count descending
  const catTotals = new Map<string, number>();
  for (const d of data) {
    catTotals.set(d.insight_category, (catTotals.get(d.insight_category) ?? 0) + d.count);
  }
  categories.sort((a, b) => (catTotals.get(b) ?? 0) - (catTotals.get(a) ?? 0));

  // Sort areas by total count descending
  const areaTotals = new Map<string, number>();
  for (const d of data) {
    areaTotals.set(d.product_area, (areaTotals.get(d.product_area) ?? 0) + d.count);
  }
  areas.sort((a, b) => (areaTotals.get(b) ?? 0) - (areaTotals.get(a) ?? 0));

  const lookup = new Map<string, ThemeHeatmapCell>();
  for (const d of data) {
    lookup.set(`${d.product_area}|${d.insight_category}`, d);
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  // Shorten long category names
  const shortCat = (cat: string) =>
    cat
      .replace("Customer Requirements ", "CR ")
      .replace("Process / Operational Friction", "Friction")
      .replace("Competition / Alternatives", "Competition")
      .replace("Success Pattern / Win Signal", "Win Signal")
      .replace("Loss Signal (Product Model Mismatch)", "Loss (Mismatch)")
      .replace("Loss Signal (No Response / Stale)", "Loss (Stale)")
      .replace("Loss Signal (Commercial)", "Loss (Commercial)")
      .replace("Loss Signal (Capacity)", "Loss (Capacity)")
      .replace("Loss Signal (Unknown)", "Loss (Unknown)")
      .replace("Capacity Issues", "Capacity Iss.")
      .replace("Education Gaps", "Edu Gaps")
      .replace("GTM / Partnership", "GTM")
      .replace("Pricing / Terms", "Pricing")
      .replace("CX Requirement", "CX Req");

  return (
    <Card title="Theme Heatmap by Product Area" subtitle="Cell = insight count, hover for account count">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white px-2 py-1.5 text-left font-medium text-gray-500 z-10"></th>
              {areas.map((area) => (
                <th
                  key={area}
                  className="px-1.5 py-1.5 text-center font-medium text-gray-500 min-w-[70px]"
                  title={area}
                >
                  <span className="flex flex-col items-center gap-0.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PRODUCT_AREA_COLORS[area] ?? "#6B7280" }}
                    />
                    <span className="block max-w-[80px] truncate">{area}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat}>
                <td
                  className="sticky left-0 bg-white z-10 px-2 py-1 font-medium whitespace-nowrap"
                  title={cat}
                >
                  {shortCat(cat)}
                </td>
                {areas.map((area) => {
                  const cell = lookup.get(`${area}|${cat}`);
                  const count = cell?.count ?? 0;
                  const accounts = cell?.account_count ?? 0;
                  return (
                    <td
                      key={area}
                      className={`px-1.5 py-1 text-center font-semibold rounded-sm ${intensityColor(count, maxCount)} ${count > 0 ? "cursor-pointer hover:ring-2 hover:ring-blue-400" : ""}`}
                      title={count > 0 ? `${count} insights from ${accounts} account${accounts !== 1 ? "s" : ""} — click to view` : "—"}
                      onClick={() => {
                        if (count > 0) {
                          navigate(`/insights?product_area=${encodeURIComponent(area)}&insight_category=${encodeURIComponent(cat)}`);
                        }
                      }}
                    >
                      {count > 0 ? count : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
        <span>Fewer asks</span>
        <span className="inline-block h-3 w-4 rounded bg-orange-100" />
        <span className="inline-block h-3 w-4 rounded bg-orange-200" />
        <span className="inline-block h-3 w-4 rounded bg-orange-400" />
        <span className="inline-block h-3 w-4 rounded bg-orange-500" />
        <span>More asks</span>
      </div>
    </Card>
  );
}
