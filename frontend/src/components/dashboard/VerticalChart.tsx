import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/shared/Card";
import { formatCurrency } from "@/lib/utils";
import type { VerticalCount } from "@/types/dashboard";

interface Props {
  data: VerticalCount[] | undefined;
  loading: boolean;
}

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899",
  "#06B6D4", "#F97316", "#6366F1", "#14B8A6", "#E11D48",
];

export function VerticalChart({ data, loading }: Props) {
  return (
    <Card title="Insights by Industry Vertical">
      {loading || !data ? (
        <div className="h-64 animate-pulse rounded bg-slate-100" />
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          No vertical data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="vertical"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload as VerticalCount;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
                    <p className="font-semibold text-slate-900">{d.vertical}</p>
                    <p className="text-slate-600">{d.count} insights</p>
                    <p className="text-slate-600">Pipeline: {formatCurrency(d.total_opportunity)}</p>
                  </div>
                );
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconSize={10}
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
