import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { PRODUCT_AREA_COLORS, URGENCY_COLORS, SOURCE_TOOLS } from "@/lib/constants";
import { truncate, formatDate, formatCurrency } from "@/lib/utils";
import type { Column } from "@/components/shared/DataTable";
import type { Insight } from "@/types/insight";

interface Props {
  data: Insight[];
  loading: boolean;
  onSelect: (insight: Insight) => void;
}

const columns: Column<Insight>[] = [
  {
    key: "priority",
    header: "Priority",
    width: "80px",
    sortable: true,
    sortKey: (row) => row.priority_score ?? 0,
    render: (row) => {
      const score = row.priority_score;
      if (score == null) return <span className="text-xs text-slate-400">—</span>;
      const color =
        score >= 5 ? "text-red-700 bg-red-50" :
        score >= 2 ? "text-amber-700 bg-amber-50" :
        "text-slate-600 bg-slate-50";
      return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${color}`}>
          {score.toFixed(1)}
        </span>
      );
    },
  },
  {
    key: "account",
    header: "Account",
    width: "140px",
    render: (row) => (
      <div>
        <span className="font-medium text-slate-900">{row.account_name}</span>
        {row.account_priority_group && (
          <span className="ml-1 text-[9px] font-semibold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
            {row.account_priority_group}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "insight",
    header: "Insight",
    render: (row) => (
      <span className="text-slate-600">{truncate(row.insight_text, 100)}</span>
    ),
  },
  {
    key: "area",
    header: "Area",
    width: "120px",
    render: (row) => (
      <Badge
        label={row.product_area}
        color={PRODUCT_AREA_COLORS[row.product_area]}
        variant="subtle"
      />
    ),
  },
  {
    key: "category",
    header: "Category",
    width: "150px",
    render: (row) => (
      <span className="text-xs text-slate-600">{row.insight_category}</span>
    ),
  },
  {
    key: "urgency",
    header: "Urgency",
    width: "80px",
    render: (row) => {
      const level = row.urgency_level;
      if (!level) return <span className="text-xs text-slate-400">—</span>;
      return (
        <Badge
          label={level}
          color={URGENCY_COLORS[level] ?? "#94a3b8"}
          variant="subtle"
        />
      );
    },
  },
  {
    key: "opportunity",
    header: "Opp $",
    width: "90px",
    sortable: true,
    sortKey: (row) => row.opportunity_amount ?? 0,
    render: (row) => (
      <span className="text-xs text-slate-600 tabular-nums">
        {row.opportunity_amount ? formatCurrency(row.opportunity_amount) : "—"}
      </span>
    ),
  },
  {
    key: "source",
    header: "Source",
    width: "60px",
    render: (row) => {
      const tool = SOURCE_TOOLS[row.source_tool];
      if (!tool) return <span className="text-xs text-slate-500">{row.source_tool}</span>;
      return (
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white"
          style={{ backgroundColor: tool.color }}
          title={tool.label}
        >
          {tool.icon}
        </span>
      );
    },
  },
  {
    key: "date",
    header: "Date",
    width: "100px",
    sortable: true,
    sortKey: (row) => row.date_of_record,
    render: (row) => (
      <span className="text-xs text-slate-500 tabular-nums">
        {formatDate(row.date_of_record)}
      </span>
    ),
  },
];

export function InsightTable({ data, loading, onSelect }: Props) {
  return (
    <div className="card overflow-hidden">
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onRowClick={onSelect}
        emptyMessage="No insights match your filters"
      />
    </div>
  );
}
