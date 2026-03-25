from typing import Optional

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_insights: int
    key_records: int
    total_accounts: int
    sources_active: int
    total_arr: float = 0
    avg_priority_score: float = 0
    top_vertical: Optional[str] = None


class AreaCount(BaseModel):
    product_area: str
    count: int


class CategoryCount(BaseModel):
    insight_category: str
    count: int


class AccountCount(BaseModel):
    account_name: str
    count: int
    icp: Optional[str] = None
    vertical: Optional[str] = None
    opportunity_amount: float = 0
    total_revenue: float = 0
    priority_group: Optional[str] = None
    avg_priority: float = 0
    top_area: Optional[str] = None


class TrendPoint(BaseModel):
    week: str
    count: int


class VerticalCount(BaseModel):
    vertical: str
    count: int
    total_opportunity: float = 0


class OpportunityStageCount(BaseModel):
    opportunity_stage: str
    count: int
    total_opportunity: float = 0


class PriorityMatrixPoint(BaseModel):
    product_area: str
    count: int
    avg_priority: float
    total_arr: float
    account_count: int


class ThemeHeatmapCell(BaseModel):
    product_area: str
    insight_category: str
    count: int
    account_count: int


class WordFrequency(BaseModel):
    word: str
    count: int
