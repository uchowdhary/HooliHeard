import { useNavigate } from "react-router-dom";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/shared/Card";
import { PRODUCT_AREA_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { PriorityMatrixPoint } from "@/types/dashboard";

interface Props {
  data: PriorityMatrixPoint[] | undefined;
  loading: boolean;
}

export function PriorityMatrix({ data, loading }: Props) {
  const navigate = useNavigate();

  return (
    <Card title="Priority vs Volume by Product Area">
      {loading || !data ? (
        <div className="h-64 animate-pulse rounded bg-slate-100" />
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          No priority data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
            <XAxis
              dataKey="count"
              type="number"
              name="Insight Count"
              tick={{ fontSize: 12 }}
              label={{ value: "Insight Count", position: "insideBottom", offset: -5, fontSize: 12 }}
            />
            <YAxis
              dataKey="avg_priority"
              type="number"
              name="Avg Priority"
              tick={{ fontSize: 12 }}
              label={{ value: "Priority Score", angle: -90, position: "insideLeft", fontSize: 12 }}
            />
            <ZAxis
              dataKey="total_arr"
              type="number"
              range={[100, 800]}
              name="Total ARR"
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload as PriorityMatrixPoint;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
                    <p className="font-semibold text-slate-900">{d.product_area}</p>
                    <p className="text-slate-600">{d.count} insights from {d.account_count} accounts</p>
                    <p className="text-slate-600">Avg priority: {d.avg_priority}</p>
                    <p className="text-slate-600">Pipeline: {formatCurrency(d.total_arr)}</p>
                    <p className="mt-1 text-blue-500">Click to view insights</p>
                  </div>
                );
              }}
            />
            <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 20 }} />
            {data.map((entry) => (
              <Scatter
                key={entry.product_area}
                name={entry.product_area}
                data={[entry]}
                fill={PRODUCT_AREA_COLORS[entry.product_area] ?? "#94A3B8"}
                fillOpacity={0.85}
                cursor="pointer"
                onClick={() => {
                  navigate(`/insights?product_area=${encodeURIComponent(entry.product_area)}`);
                }}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
