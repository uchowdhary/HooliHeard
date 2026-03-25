import { useQuery } from "@tanstack/react-query";
import type { Insight, InsightFilters, InsightListResponse } from "@/types/insight";

export function useInsights(filters: InsightFilters) {
  return useQuery<InsightListResponse>({
    queryKey: ["insights", filters],
    queryFn: () =>
      import("@/api/insights").then((m) => m.fetchInsights(filters)),
  });
}

export function useInsight(id: string | null) {
  return useQuery<Insight>({
    queryKey: ["insight", id],
    enabled: !!id,
    queryFn: () =>
      import("@/api/insights").then((m) => m.fetchInsight(id!)),
  });
}
