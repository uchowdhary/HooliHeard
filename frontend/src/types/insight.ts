export interface Insight {
  id: string;
  account_name: string;
  insight_text: string;
  product_area: string;
  product_subcategory: string;
  insight_category: string;
  input_data_source: string;
  source_tool: string;
  source_link: string;
  role_present?: string;
  conversation_type?: string;
  date_of_record: string;
  unique_insight_status: string;
  dedup_group_key: string;
  comments?: string;
  created_at: string;
  // V2 account enrichment
  icp?: string;
  account_priority_group?: string;
  vertical?: string;
  use_case?: string;
  workloads?: string;
  opportunity_stage?: string;
  opportunity_amount?: number;
  gpu_types?: string;
  competitors_mentioned?: string;
  total_revenue?: number;
  most_recent_revenue_month?: string;
  closed_won_opp_count?: number;
  // Computed
  priority_score?: number;
  urgency_level?: string;
}

export interface InsightListResponse {
  items: Insight[];
  total: number;
  page: number;
  page_size: number;
}

export interface InsightFilters {
  product_area?: string;
  insight_category?: string;
  account_name?: string;
  date_from?: string;
  date_to?: string;
  unique_insight_status?: string;
  icp?: string;
  vertical?: string;
  opportunity_stage?: string;
  min_priority_score?: number;
  sort_by?: string;
  page?: number;
  page_size?: number;
}
