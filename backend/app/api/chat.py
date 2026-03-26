"""Chat endpoint — answers natural-language questions about insights data."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.config import settings
from app.db import get_db
from app.models.insight import Insight

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str


def _build_context(db: Session) -> str:
    """Build a concise data summary for Claude to answer questions."""
    parts: list[str] = []

    # Overall stats
    total = db.query(func.count(Insight.id)).scalar() or 0
    key_records = (
        db.query(func.count(Insight.id))
        .filter(Insight.unique_insight_status == "Key Record")
        .scalar()
        or 0
    )
    parts.append(f"Total insights: {total} ({key_records} key records)")

    # Top categories by count
    cats = (
        db.query(Insight.insight_category, func.count(Insight.id).label("cnt"))
        .group_by(Insight.insight_category)
        .order_by(desc("cnt"))
        .all()
    )
    parts.append("Insight categories (by volume): " + ", ".join(
        f"{c[0]}: {c[1]}" for c in cats
    ))

    # Top product areas
    areas = (
        db.query(Insight.product_area, func.count(Insight.id).label("cnt"))
        .group_by(Insight.product_area)
        .order_by(desc("cnt"))
        .all()
    )
    parts.append("Product areas: " + ", ".join(
        f"{a[0]}: {a[1]}" for a in areas
    ))

    # Top 15 accounts by insight count with pipeline info
    accts = (
        db.query(
            Insight.account_name,
            func.count(Insight.id).label("cnt"),
            func.sum(Insight.opportunity_amount).label("pipeline"),
            func.max(Insight.icp).label("icp"),
            func.max(Insight.opportunity_stage).label("stage"),
            func.max(Insight.vertical).label("vertical"),
        )
        .group_by(Insight.account_name)
        .order_by(desc("cnt"))
        .limit(15)
        .all()
    )
    acct_lines = []
    for a in accts:
        pipeline = f"${a.pipeline:,.0f}" if a.pipeline else "N/A"
        acct_lines.append(
            f"  {a.account_name}: {a.cnt} insights, pipeline={pipeline}, "
            f"ICP={a.icp or 'N/A'}, stage={a.stage or 'N/A'}, vertical={a.vertical or 'N/A'}"
        )
    parts.append("Top accounts:\n" + "\n".join(acct_lines))

    # Top 20 highest-priority insights
    top_insights = (
        db.query(Insight)
        .filter(Insight.unique_insight_status == "Key Record")
        .order_by(desc(Insight.priority_score))
        .limit(20)
        .all()
    )
    insight_lines = []
    for ins in top_insights:
        opp = f"${ins.opportunity_amount:,.0f}" if ins.opportunity_amount else "N/A"
        insight_lines.append(
            f"  [{ins.product_area}] [{ins.insight_category}] "
            f"Account: {ins.account_name} (ICP: {ins.icp or 'N/A'}, Pipeline: {opp}, Stage: {ins.opportunity_stage or 'N/A'}) — "
            f"Priority: {ins.priority_score} — {ins.insight_text[:200]}"
        )
    parts.append("Top 20 highest-priority key insights:\n" + "\n".join(insight_lines))

    # Product subcategories
    subcats = (
        db.query(Insight.product_area, Insight.product_subcategory, func.count(Insight.id).label("cnt"))
        .group_by(Insight.product_area, Insight.product_subcategory)
        .order_by(desc("cnt"))
        .limit(20)
        .all()
    )
    parts.append("Top product subcategories: " + ", ".join(
        f"{s[0]}/{s[1]}: {s[2]}" for s in subcats
    ))

    # Verticals
    verts = (
        db.query(Insight.vertical, func.count(Insight.id).label("cnt"))
        .filter(Insight.vertical.isnot(None))
        .group_by(Insight.vertical)
        .order_by(desc("cnt"))
        .limit(15)
        .all()
    )
    parts.append("Top verticals: " + ", ".join(
        f"{v[0]}: {v[1]}" for v in verts
    ))

    # Sources
    sources = (
        db.query(Insight.source_tool, func.count(Insight.id).label("cnt"))
        .group_by(Insight.source_tool)
        .order_by(desc("cnt"))
        .all()
    )
    parts.append("Sources: " + ", ".join(
        f"{s[0]}: {s[1]}" for s in sources
    ))

    return "\n\n".join(parts)


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    import anthropic

    if not settings.ANTHROPIC_API_KEY:
        return ChatResponse(answer="Chat is not configured — ANTHROPIC_API_KEY is not set.")

    context = _build_context(db)

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=1024,
        system=(
            "You are an AI assistant for Hooli Heard, a customer insights intelligence platform. "
            "You answer questions about customer feedback, product requests, and pipeline data. "
            "Use the data context provided to give specific, accurate answers with real account names, "
            "numbers, and details. Be concise and use bullet points. "
            "If the data doesn't contain enough information to answer, say so clearly. "
            "When asked about 'SUNK' or product areas, match to the closest product area in the data "
            "(e.g., SUNK could refer to Storage, Networking, or specific subcategories). "
            "Format currency values nicely. Keep answers under 300 words."
        ),
        messages=[
            {
                "role": "user",
                "content": f"DATA CONTEXT:\n{context}\n\nUSER QUESTION: {req.message}",
            }
        ],
    )

    answer = response.content[0].text
    return ChatResponse(answer=answer)
