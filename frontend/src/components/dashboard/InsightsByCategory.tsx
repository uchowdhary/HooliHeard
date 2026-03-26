import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/shared/Card";
import { CATEGORY_DEFINITIONS } from "@/lib/constants";
import type { CategoryCount } from "@/types/dashboard";
import { useState } from "react";

interface Props {
  data: CategoryCount[] | undefined;
  loading: boolean;
}

function CategoryInfo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        title="Category definitions"
      >
        i
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-50 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-xl text-xs max-h-[400px] overflow-y-auto">
            <p className="font-semibold text-slate-700 mb-2">Category Definitions</p>
            {Object.entries(CATEGORY_DEFINITIONS).map(([cat, def]) => (
              <div key={cat} className="mb-2">
                <p className="font-medium text-slate-800">{cat}</p>
                <p className="text-slate-500">{def}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function InsightsByCategory({ data, loading }: Props) {
  const navigate = useNavigate();
  const sorted = data ? [...data].sort((a, b) => b.count - a.count) : [];

  const handleClick = (entry: CategoryCount) => {
    navigate(`/insights?insight_category=${encodeURIComponent(entry.insight_category)}`);
  };

  return (
    <Card title="Insights by Category" action={<CategoryInfo />}>
      {loading || !data ? (
        <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(280, sorted.length * 28 + 40)}>
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="insight_category"
              width={160}
              tick={{ fontSize: 10, fill: "#64748b" }}
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
              formatter={(value: number) => [`${value} insights`, "Count"]}
            />
            <Bar
              dataKey="count"
              fill="#6366f1"
              radius={[0, 4, 4, 0]}
              maxBarSize={20}
              cursor="pointer"
              onClick={(_data, index) => {
                if (sorted[index]) handleClick(sorted[index]);
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
