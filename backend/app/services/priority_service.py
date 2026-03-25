"""Priority scoring and aggregation logic for insights."""

from sqlalchemy import func, literal_column
from sqlalchemy.orm import Session

from app.models.insight import Insight


def get_priority_ranked_insights(db: Session, filters: dict, limit: int = 50):
    """Return insights ranked by priority_score descending."""
    q = db.query(Insight).filter(Insight.priority_score.isnot(None))
    q = _apply_priority_filters(q, filters)
    return q.order_by(Insight.priority_score.desc()).limit(limit).all()


def get_insights_by_vertical(db: Session, filters: dict):
    """Count insights grouped by vertical."""
    q = db.query(
        Insight.vertical,
        func.count(Insight.id).label("count"),
        func.sum(Insight.opportunity_amount).label("total_opportunity"),
    ).filter(Insight.vertical.isnot(None))
    q = _apply_priority_filters(q, filters)
    rows = q.group_by(Insight.vertical).order_by(func.count(Insight.id).desc()).all()
    return [{"vertical": r[0], "count": r[1], "total_opportunity": float(r[2] or 0)} for r in rows]


def get_insights_by_opportunity_stage(db: Session, filters: dict):
    """Count insights grouped by opportunity_stage."""
    q = db.query(
        Insight.opportunity_stage,
        func.count(Insight.id).label("count"),
        func.sum(Insight.opportunity_amount).label("total_opportunity"),
    ).filter(Insight.opportunity_stage.isnot(None))
    q = _apply_priority_filters(q, filters)
    rows = q.group_by(Insight.opportunity_stage).order_by(func.sum(Insight.opportunity_amount).desc()).all()
    return [{"opportunity_stage": r[0], "count": r[1], "total_opportunity": float(r[2] or 0)} for r in rows]


def get_priority_matrix(db: Session, filters: dict):
    """Return data for priority scatter plot: product_area with avg priority, count, total ARR."""
    q = db.query(
        Insight.product_area,
        func.count(Insight.id).label("count"),
        func.avg(Insight.priority_score).label("avg_priority"),
        func.sum(Insight.opportunity_amount).label("total_arr"),
        func.count(func.distinct(Insight.account_name)).label("account_count"),
    )
    q = _apply_priority_filters(q, filters)
    rows = q.group_by(Insight.product_area).all()
    return [
        {
            "product_area": r[0],
            "count": r[1],
            "avg_priority": round(float(r[2] or 0), 2),
            "total_arr": float(r[3] or 0),
            "account_count": r[4],
        }
        for r in rows
    ]


def get_enhanced_summary(db: Session, filters: dict):
    """Extended summary with ARR and priority stats — respects filters."""
    base = db.query(Insight)
    base = _apply_priority_filters(base, filters)

    total_arr = base.with_entities(func.sum(Insight.opportunity_amount)).scalar() or 0
    avg_priority = (
        base.filter(Insight.priority_score.isnot(None))
        .with_entities(func.avg(Insight.priority_score))
        .scalar()
        or 0
    )

    top_vertical_row = (
        base.filter(Insight.vertical.isnot(None))
        .with_entities(Insight.vertical, func.count(Insight.id).label("c"))
        .group_by(Insight.vertical)
        .order_by(func.count(Insight.id).desc())
        .first()
    )
    top_vertical = top_vertical_row[0] if top_vertical_row else None

    return {
        "total_arr": float(total_arr),
        "avg_priority_score": round(float(avg_priority), 2),
        "top_vertical": top_vertical,
    }


def get_enhanced_accounts(db: Session, filters: dict, limit: int = 20):
    """Top accounts with enrichment data. Uses mode (most frequent) for top_area."""
    q = db.query(
        Insight.account_name,
        func.count(Insight.id).label("count"),
        func.max(Insight.icp).label("icp"),
        func.max(Insight.vertical).label("vertical"),
        func.max(Insight.opportunity_amount).label("opportunity_amount"),
        func.max(Insight.total_revenue).label("total_revenue"),
        func.max(Insight.account_priority_group).label("priority_group"),
        func.avg(Insight.priority_score).label("avg_priority"),
        func.mode().within_group(Insight.product_area).label("top_area"),
    )
    q = _apply_priority_filters(q, filters)
    rows = (
        q.group_by(Insight.account_name)
        .order_by(func.count(Insight.id).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "account_name": r[0],
            "count": r[1],
            "icp": r[2],
            "vertical": r[3],
            "opportunity_amount": float(r[4] or 0),
            "total_revenue": float(r[5] or 0),
            "priority_group": r[6],
            "avg_priority": round(float(r[7] or 0), 2),
            "top_area": r[8],
        }
        for r in rows
    ]


def get_theme_heatmap(db: Session, filters: dict):
    """Return product_area × insight_category matrix with counts and account counts."""
    q = db.query(
        Insight.product_area,
        Insight.insight_category,
        func.count(Insight.id).label("count"),
        func.count(func.distinct(Insight.account_name)).label("account_count"),
    )
    q = _apply_priority_filters(q, filters)
    rows = (
        q.group_by(Insight.product_area, Insight.insight_category)
        .order_by(func.count(Insight.id).desc())
        .all()
    )
    return [
        {
            "product_area": r[0],
            "insight_category": r[1],
            "count": r[2],
            "account_count": r[3],
        }
        for r in rows
    ]


# Common stop words to filter out of word frequency analysis
_STOP_WORDS = frozenset(
    "a an and are as at be but by for from had has have he her his i if in into is it "
    "its me my no nor not of on or our out own s she so some such t than that the their "
    "them then there these they this those to too up us very was we were what when where "
    "which while who whom why will with would you your about after all also am among any "
    "been before being between both can could did do does doing done during each few get "
    "got had has have having how however just like made may might more most much must need "
    "new now off often old only other our over own said same see should show since so still "
    "take through under use used using very want well went what when where which while who "
    "why will with work would yet customer customers asked asking wants wanted needs needed "
    "using currently issue issues CoreWeave coreweave".lower().split()
)


def get_word_frequencies(db: Session, filters: dict, limit: int = 80):
    """Extract word frequencies from insight_text for word cloud."""
    import re
    from collections import Counter

    q = _apply_priority_filters(db.query(Insight.insight_text), filters)
    rows = q.filter(Insight.insight_text.isnot(None)).all()

    word_counts: Counter = Counter()
    for (text,) in rows:
        words = re.findall(r"[a-zA-Z]{3,}", text.lower())
        word_counts.update(w for w in words if w not in _STOP_WORDS)

    return [{"word": w, "count": c} for w, c in word_counts.most_common(limit)]


def _apply_priority_filters(query, filters: dict):
    """Apply standard + priority-specific filters."""
    if filters.get("product_area"):
        query = query.filter(Insight.product_area == filters["product_area"])
    if filters.get("insight_category"):
        query = query.filter(Insight.insight_category == filters["insight_category"])
    if filters.get("account_name"):
        query = query.filter(Insight.account_name.ilike(f"%{filters['account_name']}%"))
    if filters.get("date_from"):
        query = query.filter(Insight.date_of_record >= filters["date_from"])
    if filters.get("date_to"):
        query = query.filter(Insight.date_of_record <= filters["date_to"])
    if filters.get("icp"):
        query = query.filter(Insight.icp == filters["icp"])
    if filters.get("vertical"):
        query = query.filter(Insight.vertical == filters["vertical"])
    if filters.get("opportunity_stage"):
        query = query.filter(Insight.opportunity_stage == filters["opportunity_stage"])
    if filters.get("min_priority_score") is not None:
        query = query.filter(Insight.priority_score >= float(filters["min_priority_score"]))
    if filters.get("unique_insight_status"):
        query = query.filter(Insight.unique_insight_status == filters["unique_insight_status"])
    return query
