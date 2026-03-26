import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/shared/Card";
import { OPPORTUNITY_STAGE_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { OpportunityStageCount } from "@/types/dashboard";

interface Props {
  data: OpportunityStageCount[] | undefined;
  loading: boolean;
}

export function OpportunityPipeline({ data, loading }: Props) {
  const navigate = useNavigate();

  const chartData = useMemo(() => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const top5 = sorted.slice(0, 5);
    const rest = sorted.slice(5);
    if (rest.length > 0) {
      top5.push({
        opportunity_stage: "Other",
        count: rest.reduce((s, d) => s + d.count, 0),
        total_opportunity: rest.reduce((s, d) => s + d.total_opportunity, 0),
      });
    }
    return top5;
  }, [data]);

  const handleClick = (entry: OpportunityStageCount) => {
    if (entry.opportunity_stage === "Other") return;
    navigate(`/insights?opportunity_stage=${encodeURIComponent(entry.opportunity_stage)}`);
  };

  return (
    <Card title="Insights by Opportunity Stage">
      {loading || !data ? (
        <div className="h-64 animate-pulse rounded bg-slate-100" />
      ) : chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          No opportunity stage data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 36 + 40)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="opportunity_stage"
              type="category"
              tick={{ fontSize: 11 }}
              width={120}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload as OpportunityStageCount;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
                    <p className="font-semibold text-slate-900">{d.opportunity_stage}</p>
                    <p className="text-slate-600">{d.count} insights</p>
                    <p className="text-slate-600">Pipeline: {formatCurrency(d.total_opportunity)}</p>
                    {d.opportunity_stage !== "Other" && (
                      <p className="mt-1 text-blue-500">Click to view insights</p>
                    )}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={(_data, index) => {
                if (chartData[index]) handleClick(chartData[index]);
              }}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={OPPORTUNITY_STAGE_COLORS[entry.opportunity_stage] ?? "#94A3B8"}
                  stroke={entry.opportunity_stage === "Closed Lost" ? "#991B1B" : undefined}
                  strokeWidth={entry.opportunity_stage === "Closed Lost" ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
