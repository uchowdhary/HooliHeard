import { useQuery } from "@tanstack/react-query";
import type {
  DashboardSummary,
  AreaCount,
  CategoryCount,
  AccountCount,
  TrendPoint,
  VerticalCount,
  OpportunityStageCount,
  PriorityMatrixPoint,
} from "@/types/dashboard";
import type { InsightFilters } from "@/types/insight";

export function useSummary(filters?: InsightFilters) {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard", "summary", filters],
    queryFn: () =>
      import("@/api/dashboard").then((m) => m.fetchSummary(filters)),
  });
}

export function useByArea(filters?: InsightFilters) {
  return useQuery<AreaCount[]>({
    queryKey: ["dashboard", "by-area", filters],
    queryFn: () =>
      import("@/api/dashboard").then((m) => m.fetchByArea(filters)),
  });
}

export function useByCategory(filters?: InsightFilters) {
  return useQuery<CategoryCount[]>({
    queryKey: ["dashboard", "by-category", filters],
    queryFn: () =>
      import("@/api/dashboard").then((m) => m.fetchByCategory(filters)),
  });
}

export function useByAccount(filters?: InsightFilters) {
  return useQuery<AccountCount[]>({
    queryKey: ["dashboard", "by-account", filters],
    queryFn: () =>
      import("@/api/dashboard").then((m) => m.fetchByAccount(filters)),
  });
}

export function useTrend(filters?: InsightFilters) {
  return useQuery<TrendPoint[]>({
    queryKey: ["dashboard", "trend", filters],
    queryFn: () =>
      import("@/api/dashboard").then((m) => m.fetchTrend(filters)),
  });
}

export function useByVertical(filters?: InsightFilters) {
  return useQuery<VerticalCount[]>({
    queryKey: ["dashboard", "by-vertical", filters],
    queryFn: () =>
      import("@/api/dashboard").then((m) => m.fetchByVertical(filters)),
  });
}

export function useByOpportunityStage(filters?: InsightFilters) {
  return useQuery<OpportunityStageCount[]>({
    queryKey: ["dashboard", "by-opportunity-stage", filters],
    queryFn: () =>
      import("@/api/dashboard").then((m) => m.fetchByOpportunityStage(filters)),
  });
}

export function usePriorityMatrix(filters?: InsightFilters) {
  return useQuery<PriorityMatrixPoint[]>({
    queryKey: ["dashboard", "priority-matrix", filters],
    queryFn: () =>
      import("@/api/dashboard").then((m) => m.fetchPriorityMatrix(filters)),
  });
}
