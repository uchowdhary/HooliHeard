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

  const handleClick = (entry: OpportunityStageCount) => {
    navigate(`/insights?opportunity_stage=${encodeURIComponent(entry.opportunity_stage)}`);
  };

  return (
    <Card title="Insights by Opportunity Stage">
      {loading || !data ? (
        <div className="h-64 animate-pulse rounded bg-slate-100" />
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          No opportunity stage data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="opportunity_stage"
              type="category"
              tick={{ fontSize: 11 }}
              width={90}
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
                    <p className="mt-1 text-blue-500">Click to view insights</p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={(_data, index) => {
                if (data[index]) handleClick(data[index]);
              }}
            >
              {data.map((entry, i) => (
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
