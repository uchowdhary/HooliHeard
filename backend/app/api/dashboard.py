from typing import Optional

from sqlalchemy import func
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.insight import Insight
from app.schemas.dashboard import (
    AccountCount,
    AreaCount,
    CategoryCount,
    DashboardSummary,
    OpportunityStageCount,
    PriorityMatrixPoint,
    ThemeHeatmapCell,
    TrendPoint,
    VerticalCount,
    WordFrequency,
)
from app.services.priority_service import (
    get_enhanced_accounts,
    get_enhanced_summary,
    get_insights_by_opportunity_stage,
    get_insights_by_vertical,
    get_priority_matrix,
    get_theme_heatmap,
    get_word_frequencies,
    _apply_priority_filters,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _filters_dict(**kwargs):
    return {k: v for k, v in kwargs.items()}


def _common_filters(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    icp: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    opportunity_stage: Optional[str] = Query(None),
    source_tool: Optional[str] = Query(None),
):
    return {
        "product_area": product_area,
        "insight_category": insight_category,
        "account_name": account_name,
        "date_from": date_from,
        "date_to": date_to,
        "icp": icp,
        "vertical": vertical,
        "opportunity_stage": opportunity_stage,
        "source_tool": source_tool,
    }


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    icp: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    opportunity_stage: Optional[str] = Query(None),
    source_tool: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    f = _filters_dict(
        product_area=product_area, insight_category=insight_category,
        account_name=account_name, date_from=date_from, date_to=date_to,
        icp=icp, vertical=vertical, opportunity_stage=opportunity_stage,
        source_tool=source_tool,
    )
    base = _apply_priority_filters(db.query(Insight), f)
    total_insights = base.count()
    key_records = base.filter(Insight.unique_insight_status == "Key Record").count()
    total_accounts = base.with_entities(func.count(func.distinct(Insight.account_name))).scalar() or 0
    sources_active = base.with_entities(func.count(func.distinct(Insight.source_tool))).scalar() or 0

    enhanced = get_enhanced_summary(db, f)

    return DashboardSummary(
        total_insights=total_insights,
        key_records=key_records,
        total_accounts=total_accounts,
        sources_active=sources_active,
        total_arr=enhanced["total_arr"],
        avg_priority_score=enhanced["avg_priority_score"],
        top_vertical=enhanced["top_vertical"],
    )


@router.get("/by-area", response_model=list[AreaCount])
def insights_by_area(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    icp: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    opportunity_stage: Optional[str] = Query(None),
    source_tool: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    f = _filters_dict(
        product_area=product_area, insight_category=insight_category,
        account_name=account_name, date_from=date_from, date_to=date_to,
        icp=icp, vertical=vertical, opportunity_stage=opportunity_stage,
        source_tool=source_tool,
    )
    q = _apply_priority_filters(db.query(Insight), f)
    rows = (
        q.with_entities(Insight.product_area, func.count(Insight.id).label("count"))
        .group_by(Insight.product_area)
        .order_by(func.count(Insight.id).desc())
        .all()
    )
    return [AreaCount(product_area=r[0], count=r[1]) for r in rows]


@router.get("/by-category", response_model=list[CategoryCount])
def insights_by_category(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    icp: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    opportunity_stage: Optional[str] = Query(None),
    source_tool: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    f = _filters_dict(
        product_area=product_area, insight_category=insight_category,
        account_name=account_name, date_from=date_from, date_to=date_to,
        icp=icp, vertical=vertical, opportunity_stage=opportunity_stage,
        source_tool=source_tool,
    )
    q = _apply_priority_filters(db.query(Insight), f)
    rows = (
        q.with_entities(Insight.insight_category, func.count(Insight.id).label("count"))
        .group_by(Insight.insight_category)
        .order_by(func.count(Insight.id).desc())
        .all()
    )
    return [CategoryCount(insight_category=r[0], count=r[1]) for r in rows]


@router.get("/by-account", response_model=list[AccountCount])
def insights_by_account(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    icp: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    opportunity_stage: Optional[str] = Query(None),
    source_tool: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    f = _filters_dict(
        product_area=product_area, insight_category=insight_category,
        account_name=account_name, date_from=date_from, date_to=date_to,
        icp=icp, vertical=vertical, opportunity_stage=opportunity_stage,
        source_tool=source_tool,
    )
    rows = get_enhanced_accounts(db, f, limit=20)
    return [AccountCount(**r) for r in rows]


@router.get("/trend", response_model=list[TrendPoint])
def insights_trend(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    icp: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    opportunity_stage: Optional[str] = Query(None),
    source_tool: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    f = _filters_dict(
        product_area=product_area, insight_category=insight_category,
        account_name=account_name, date_from=date_from, date_to=date_to,
        icp=icp, vertical=vertical, opportunity_stage=opportunity_stage,
        source_tool=source_tool,
    )
    q = _apply_priority_filters(db.query(Insight), f)
    rows = (
        q.with_entities(
            func.to_char(func.date_trunc("week", Insight.date_of_record), "YYYY-MM-DD").label("week"),
            func.count(Insight.id).label("count"),
        )
        .group_by(func.date_trunc("week", Insight.date_of_record))
        .order_by(func.date_trunc("week", Insight.date_of_record))
        .all()
    )
    return [TrendPoint(week=r[0], count=r[1]) for r in rows]


@router.get("/by-vertical", response_model=list[VerticalCount])
def insights_by_vertical(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    icp: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    opportunity_stage: Optional[str] = Query(None),
    source_tool: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    f = _filters_dict(
        product_area=product_area, insight_category=insight_category,
        account_name=account_name, date_from=date_from, date_to=date_to,
        icp=icp, vertical=vertical, opportunity_stage=opportunity_stage,
        source_tool=source_tool,
    )
    rows = get_insights_by_vertical(db, f)
    return [VerticalCount(**r) for r in rows]


@router.get("/by-opportunity-stage", response_model=list[OpportunityStageCount])
def insights_by_opportunity_stage(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    icp: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    opportunity_stage: Optional[str] = Query(None),
    source_tool: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    f = _filters_dict(
        product_area=product_area, insight_category=insight_category,
        account_name=account_name, date_from=date_from, date_to=date_to,
        icp=icp, vertical=vertical, opportunity_stage=opportunity_stage,
        source_tool=source_tool,
    )
    rows = get_insights_by_opportunity_stage(db, f)
    return [OpportunityStageCount(**r) for r in rows]


@router.get("/priority-matrix", response_model=list[PriorityMatrixPoint])
def priority_matrix(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    icp: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    opportunity_stage: Optional[str] = Query(None),
    source_tool: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    f = _filters_dict(
        product_area=product_area, insight_category=insight_category,
        account_name=account_name, date_from=date_from, date_to=date_to,
        icp=icp, vertical=vertical, opportunity_stage=opportunity_stage,
        source_tool=source_tool,
    )
    rows = get_priority_matrix(db, f)
    return [PriorityMatrixPoint(**r) for r in rows]


@router.get("/theme-heatmap", response_model=list[ThemeHeatmapCell])
def theme_heatmap(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    icp: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    opportunity_stage: Optional[str] = Query(None),
    source_tool: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    f = _filters_dict(
        product_area=product_area, insight_category=insight_category,
        account_name=account_name, date_from=date_from, date_to=date_to,
        icp=icp, vertical=vertical, opportunity_stage=opportunity_stage,
        source_tool=source_tool,
    )
    rows = get_theme_heatmap(db, f)
    return [ThemeHeatmapCell(**r) for r in rows]


@router.get("/word-frequencies", response_model=list[WordFrequency])
def word_frequencies(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    icp: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    opportunity_stage: Optional[str] = Query(None),
    source_tool: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    f = _filters_dict(
        product_area=product_area, insight_category=insight_category,
        account_name=account_name, date_from=date_from, date_to=date_to,
        icp=icp, vertical=vertical, opportunity_stage=opportunity_stage,
        source_tool=source_tool,
    )
    rows = get_word_frequencies(db, f)
    return [WordFrequency(**r) for r in rows]
