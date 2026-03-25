import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card } from "@/components/shared/Card";
import type { TrendPoint } from "@/types/dashboard";

interface Props {
  data: TrendPoint[] | undefined;
  loading: boolean;
}

function formatWeek(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TrendChart({ data, loading }: Props) {
  const formatted = data?.map((d) => ({ ...d, label: formatWeek(d.week) }));

  return (
    <Card title="Insight Trend (Weekly)">
      {loading || !formatted ? (
        <div className="h-56 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={formatted}
            margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "13px",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fill="url(#trendGradient)"
              dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
