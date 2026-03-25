import { useSearchParams } from "react-router-dom";
import { StatCard } from "@/components/shared/Card";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { FilterBar } from "./FilterBar";
import { InsightsByArea } from "./InsightsByArea";
import { InsightsByCategory } from "./InsightsByCategory";
import { TrendChart } from "./TrendChart";
import { TopAccountsTable } from "./TopAccountsTable";
import { VerticalChart } from "./VerticalChart";
import { OpportunityPipeline } from "./OpportunityPipeline";
import { PriorityMatrix } from "./PriorityMatrix";
import { ThemeHeatmap } from "./ThemeHeatmap";
import { WordCloud } from "./WordCloud";
import {
  useSummary,
  useByArea,
  useByCategory,
  useByAccount,
  useTrend,
  useByVertical,
  useByOpportunityStage,
  usePriorityMatrix,
  useThemeHeatmap,
  useWordFrequencies,
} from "@/hooks/useDashboard";
import { formatNumber, formatCurrency } from "@/lib/utils";
import type { InsightFilters } from "@/types/insight";

export function DashboardPage() {
  const [searchParams] = useSearchParams();

  const filters: InsightFilters = {
    product_area: searchParams.get("product_area") ?? undefined,
    insight_category: searchParams.get("insight_category") ?? undefined,
    vertical: searchParams.get("vertical") ?? undefined,
    icp: searchParams.get("icp") ?? undefined,
  };

  const summary = useSummary(filters);
  const byArea = useByArea(filters);
  const byCategory = useByCategory(filters);
  const byAccount = useByAccount(filters);
  const trend = useTrend(filters);
  const byVertical = useByVertical(filters);
  const byOppStage = useByOpportunityStage(filters);
  const priorityMatrix = usePriorityMatrix(filters);
  const themeHeatmap = useThemeHeatmap(filters);
  const wordFreqs = useWordFrequencies(filters);

  const allQueries = [summary, byArea, byCategory, byAccount, trend, byVertical, byOppStage, priorityMatrix, themeHeatmap, wordFreqs];
  const hasError = allQueries.some((q) => q.isError);
  const firstError = allQueries.find((q) => q.isError)?.error;

  return (
    <div className="space-y-6">
      <FilterBar />

      {hasError && (
        <ErrorAlert
          message={String(firstError ?? "Unknown error")}
          onRetry={() => allQueries.forEach((q) => q.refetch())}
        />
      )}

      {/* Summary Stats — Row 1: core metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          title="Total Insights"
          value={
            summary.isLoading
              ? "..."
              : formatNumber(summary.data?.total_insights ?? 0)
          }
          subtitle="Across all sources"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          }
        />
        <StatCard
          title="Key Records"
          value={
            summary.isLoading
              ? "..."
              : formatNumber(summary.data?.key_records ?? 0)
          }
          subtitle="Unique, deduplicated"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <StatCard
          title="Accounts"
          value={
            summary.isLoading
              ? "..."
              : formatNumber(summary.data?.total_accounts ?? 0)
          }
          subtitle="Contributing feedback"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          }
        />
        <StatCard
          title="Sources"
          value={
            summary.isLoading
              ? "..."
              : String(summary.data?.sources_active ?? 0)
          }
          subtitle="Active data feeds"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          }
        />
      </div>

      {/* Summary Stats — Row 2: business metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          title="Total Pipeline"
          value={
            summary.isLoading
              ? "..."
              : formatCurrency(summary.data?.total_arr ?? 0)
          }
          subtitle="Opportunity value"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <StatCard
          title="Avg Priority"
          value={
            summary.isLoading
              ? "..."
              : String(summary.data?.avg_priority_score ?? 0)
          }
          subtitle="Weighted score"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          }
        />
        <StatCard
          title="Top Vertical"
          value={
            summary.isLoading
              ? "..."
              : summary.data?.top_vertical ?? "—"
          }
          subtitle="Most active industry"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
            </svg>
          }
        />
      </div>

      {/* Priority Matrix + Opportunity Pipeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PriorityMatrix data={priorityMatrix.data} loading={priorityMatrix.isLoading} />
        <OpportunityPipeline data={byOppStage.data} loading={byOppStage.isLoading} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InsightsByArea data={byArea.data} loading={byArea.isLoading} />
        <InsightsByCategory
          data={byCategory.data}
          loading={byCategory.isLoading}
        />
      </div>

      {/* Theme Heatmap — full width */}
      <ThemeHeatmap data={themeHeatmap.data} loading={themeHeatmap.isLoading} />

      {/* Word Cloud + Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WordCloud data={wordFreqs.data} loading={wordFreqs.isLoading} />
        <TrendChart data={trend.data} loading={trend.isLoading} />
      </div>

      {/* Vertical */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VerticalChart data={byVertical.data} loading={byVertical.isLoading} />
        <TopAccountsTable data={byAccount.data} loading={byAccount.isLoading} />
      </div>
    </div>
  );
}
