import { Card } from "@/components/shared/Card";
import { PRODUCT_AREA_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { AccountCount } from "@/types/dashboard";

interface Props {
  data: AccountCount[] | undefined;
  loading: boolean;
}

export function TopAccountsTable({ data, loading }: Props) {
  const top10 = data?.slice(0, 10) ?? [];

  return (
    <Card title="Top Accounts by Insight Volume">
      {loading || !data ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  #
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Account
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Insights
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 pl-4">
                  Top Area
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 pl-4">
                  ICP
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 pl-4">
                  Vertical
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Opp $
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody>
              {top10.map((row, i) => {
                const area = row.top_area ?? "Platform";
                return (
                  <tr
                    key={row.account_name}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-3 text-slate-400 font-mono text-xs">
                      {i + 1}
                    </td>
                    <td className="py-3 font-medium text-slate-900">
                      {row.account_name}
                      {row.priority_group && (
                        <span className="ml-2 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                          {row.priority_group}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-700 tabular-nums">
                      {row.count}
                    </td>
                    <td className="py-3 pl-4">
                      <span className="inline-flex items-center gap-2 text-slate-600">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: PRODUCT_AREA_COLORS[area] ?? "#6B7280" }}
                        />
                        {area}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-xs text-slate-600">
                      {row.icp ?? "—"}
                    </td>
                    <td className="py-3 pl-4 text-xs text-slate-600">
                      {row.vertical ?? "—"}
                    </td>
                    <td className="py-3 text-right text-xs text-slate-600 tabular-nums">
                      {row.opportunity_amount
                        ? formatCurrency(row.opportunity_amount)
                        : "—"}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                          (row.avg_priority ?? 0) >= 5
                            ? "bg-red-50 text-red-700"
                            : (row.avg_priority ?? 0) >= 2
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {row.avg_priority?.toFixed(1) ?? "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
