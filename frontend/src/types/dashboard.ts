export interface DashboardSummary {
  total_insights: number;
  key_records: number;
  total_accounts: number;
  sources_active: number;
  total_arr: number;
  avg_priority_score: number;
  top_vertical?: string;
}

export interface AreaCount {
  product_area: string;
  count: number;
}

export interface CategoryCount {
  insight_category: string;
  count: number;
}

export interface AccountCount {
  account_name: string;
  count: number;
  icp?: string;
  vertical?: string;
  opportunity_amount?: number;
  total_revenue?: number;
  priority_group?: string;
  avg_priority?: number;
  top_area?: string;
}

export interface TrendPoint {
  week: string;
  count: number;
}

export interface VerticalCount {
  vertical: string;
  count: number;
  total_opportunity: number;
}

export interface OpportunityStageCount {
  opportunity_stage: string;
  count: number;
  total_opportunity: number;
}

export interface PriorityMatrixPoint {
  product_area: string;
  count: number;
  avg_priority: number;
  total_arr: number;
  account_count: number;
}
