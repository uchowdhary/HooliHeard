import { Card } from "@/components/shared/Card";
import type { AccountCount } from "@/types/dashboard";

interface Props {
  data: AccountCount[] | undefined;
  loading: boolean;
}

// Map top accounts to their primary product area for the demo
const ACCOUNT_TOP_AREAS: Record<string, string> = {
  Anthropic: "Infra",
  Meta: "CKS",
  Microsoft: "Platform",
  Cohere: "W&B",
  "Mistral AI": "AI Services",
  "Inflection AI": "Infra",
  "Stability AI": "Platform",
  "Character.AI": "Platform",
  "Runway ML": "AI Services",
  "Hugging Face": "AI Services",
};

const AREA_DOT_COLORS: Record<string, string> = {
  Infra: "bg-blue-500",
  CKS: "bg-emerald-500",
  Platform: "bg-amber-500",
  "AI Services": "bg-violet-500",
  "W&B": "bg-pink-500",
};

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
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 pl-6">
                  Top Area
                </th>
              </tr>
            </thead>
            <tbody>
              {top10.map((row, i) => {
                const area =
                  ACCOUNT_TOP_AREAS[row.account_name] ?? "Platform";
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
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-700 tabular-nums">
                      {row.count}
                    </td>
                    <td className="py-3 pl-6">
                      <span className="inline-flex items-center gap-2 text-slate-600">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${AREA_DOT_COLORS[area] ?? "bg-slate-400"}`}
                        />
                        {area}
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
