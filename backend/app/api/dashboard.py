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
    TrendPoint,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _apply_dashboard_filters(query, product_area, insight_category, account_name, date_from, date_to):
    if product_area:
        query = query.filter(Insight.product_area == product_area)
    if insight_category:
        query = query.filter(Insight.insight_category == insight_category)
    if account_name:
        query = query.filter(Insight.account_name.ilike(f"%{account_name}%"))
    if date_from:
        query = query.filter(Insight.date_of_record >= date_from)
    if date_to:
        query = query.filter(Insight.date_of_record <= date_to)
    return query


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    base = _apply_dashboard_filters(db.query(Insight), product_area, insight_category, account_name, date_from, date_to)
    total_insights = base.count()
    key_records = base.filter(Insight.unique_insight_status == "Key Record").count()
    total_accounts = base.with_entities(func.count(func.distinct(Insight.account_name))).scalar() or 0
    sources_active = base.with_entities(func.count(func.distinct(Insight.source_tool))).scalar() or 0
    return DashboardSummary(
        total_insights=total_insights,
        key_records=key_records,
        total_accounts=total_accounts,
        sources_active=sources_active,
    )


@router.get("/by-area", response_model=list[AreaCount])
def insights_by_area(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = _apply_dashboard_filters(db.query(Insight), product_area, insight_category, account_name, date_from, date_to)
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
    db: Session = Depends(get_db),
):
    q = _apply_dashboard_filters(db.query(Insight), product_area, insight_category, account_name, date_from, date_to)
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
    db: Session = Depends(get_db),
):
    q = _apply_dashboard_filters(db.query(Insight), product_area, insight_category, account_name, date_from, date_to)
    rows = (
        q.with_entities(Insight.account_name, func.count(Insight.id).label("count"))
        .group_by(Insight.account_name)
        .order_by(func.count(Insight.id).desc())
        .limit(20)
        .all()
    )
    return [AccountCount(account_name=r[0], count=r[1]) for r in rows]


@router.get("/trend", response_model=list[TrendPoint])
def insights_trend(
    product_area: Optional[str] = Query(None),
    insight_category: Optional[str] = Query(None),
    account_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = _apply_dashboard_filters(db.query(Insight), product_area, insight_category, account_name, date_from, date_to)
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
