import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  "#9CA3AF", // "Other" — neutral gray
];

export function VerticalChart({ data, loading }: Props) {
  const navigate = useNavigate();

  // Top 10 by volume, rest collapsed into "Other"
  const chartData = useMemo(() => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const top10 = sorted.slice(0, 10);
    const rest = sorted.slice(10);
    if (rest.length > 0) {
      top10.push({
        vertical: "Other",
        count: rest.reduce((s, d) => s + d.count, 0),
        total_opportunity: rest.reduce((s, d) => s + (d.total_opportunity || 0), 0),
      });
    }
    return top10;
  }, [data]);

  const handleClick = (_data: unknown, index: number) => {
    if (chartData?.[index] && chartData[index].vertical !== "Other") {
      navigate(`/insights?vertical=${encodeURIComponent(chartData[index].vertical)}`);
    }
  };

  return (
    <Card title="Insights by Industry Vertical">
      {loading || !data ? (
        <div className="h-64 animate-pulse rounded bg-slate-100" />
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          No vertical data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <PieChart margin={{ left: 0, right: 0 }}>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="vertical"
              cx="30%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={2}
              cursor="pointer"
              onClick={handleClick}
            >
              {chartData.map((_, i) => (
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
                    {d.vertical !== "Other" && (
                      <p className="mt-1 text-blue-500">Click to view insights</p>
                    )}
                  </div>
                );
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconSize={10}
              wrapperStyle={{ fontSize: 11, maxHeight: 300, overflowY: "auto" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
