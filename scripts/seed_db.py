#!/usr/bin/env python3
"""Seed the database with insights from xlsx, JSON, or generate sample data."""

import json
import math
import sys
import uuid
from datetime import date, datetime, timezone
from pathlib import Path

# Allow running from repo root or scripts/
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))

from app.config import settings  # noqa: E402
from app.db import engine, SessionLocal, create_all  # noqa: E402
from app.models.insight import Insight  # noqa: E402

# --- File discovery ---
# Try xlsx first (v3), then JSON (v2), then fallback paths
XLSX_FILE = ROOT / "data" / "output" / "Insights_Combined_2026.xlsx"
INSIGHTS_JSON = ROOT / "data" / "output" / "insights.json"
if not INSIGHTS_JSON.exists():
    INSIGHTS_JSON = Path("/data/output/insights.json")
if not INSIGHTS_JSON.exists():
    INSIGHTS_JSON = Path("insights.json")

# Also check for xlsx in alternate locations
if not XLSX_FILE.exists():
    XLSX_FILE = Path("/data/output/Insights_Combined_2026.xlsx")
if not XLSX_FILE.exists():
    XLSX_FILE = Path("Insights_Combined_2026.xlsx")

# --- Priority scoring ---

STAGE_WEIGHTS = {
    "Closed Won": 10, "Negotiation": 8, "Negotiations": 8,
    "Technical Evaluation": 7, "Proposal": 7, "Capacity Review": 6,
    "Active Discussion / BMaaS": 5, "Active Customer": 5,
    "Discovery / Prospect": 3, "Discovery": 3, "Prospecting": 2, "New": 1,
    "Closed Lost": 1,
}

CATEGORY_URGENCY = {
    "Customer Requirements (Blocker)": 10,
    "CX Requirement": 8,
    "Capacity Issues": 8,
    "Issues": 7,
    "Loss Signal (Capacity)": 7,
    "Loss Signal (Commercial)": 7,
    "Loss Signal (Product Model Mismatch)": 7,
    "Loss Signal (No Response / Stale)": 5,
    "Loss Signal (Unknown)": 5,
    "Process / Operational Friction": 6,
    "Customer Requirements (Enhancement)": 5,
    "Capacity": 5,
    "Competition / Alternatives": 5,
    "Pricing / Terms": 4,
    "Education Gaps": 3,
    "GTM / Partnership": 3,
    "Success Pattern / Win Signal": 2,
    "Null": 1,
}

TIER_MULTIPLIERS = {
    "AI Enterprise": 3.0, "AI Lab": 2.5, "AI Platform": 2.0, "AI Native": 1.5,
    "Top Account": 3.0, "Strategic": 3.0, "Growth": 2.0, "Standard": 1.0,
}


def compute_priority_score(row):
    """RICE-inspired priority score using log-scale for opportunity amount."""
    opp = row.get("opportunity_amount") or 0
    opp_score = min(10, max(1, math.log10(max(opp, 1)) - 2)) if opp > 0 else 1

    stage = row.get("opportunity_stage") or ""
    stage_score = STAGE_WEIGHTS.get(stage, 3)

    revenue = row.get("total_revenue") or 0
    won_count = row.get("closed_won_opp_count") or 0
    engagement_score = min(10, 1 + (math.log10(max(revenue, 1)) - 2 if revenue > 100 else 0) + won_count * 0.5)

    cat = row.get("insight_category") or ""
    cat_score = CATEGORY_URGENCY.get(cat, 3)

    tier = row.get("icp") or row.get("account_priority_group") or "Standard"
    multiplier = TIER_MULTIPLIERS.get(tier, 1.0)

    raw = (opp_score * stage_score * engagement_score * cat_score * multiplier) / 100
    return round(raw, 2)


def compute_urgency_level(row):
    cat = row.get("insight_category") or ""
    score = CATEGORY_URGENCY.get(cat, 3)
    if score >= 8:
        return "High"
    elif score >= 5:
        return "Medium"
    return "Low"


def load_xlsx(path: Path) -> list[dict]:
    """Load insights from an xlsx file."""
    import openpyxl

    wb = openpyxl.load_workbook(str(path), read_only=True)
    ws = wb.active

    rows = list(ws.iter_rows(values_only=True))
    headers = rows[0]
    data = []

    # Column name mapping (xlsx header → internal key)
    COL_MAP = {
        "Account Name": "account_name",
        "ICP": "icp",
        "Vertical": "vertical",
        "Stage": "opportunity_stage",
        "Opp Amount ($)": "opportunity_amount",
        "Use Case": "use_case",
        "GPU Types": "gpu_types",
        "Insight": "insight_text",
        "Product Area": "product_area",
        "Product Subcategory": "product_subcategory",
        "Insight Category": "insight_category",
        "Input Data Source": "input_data_source",
        "Source Tool": "source_tool",
        "Source Link": "source_link",
        "Date of Record": "date_of_record",
        "Period": "period",
        "Conversation Type": "conversation_type",
        "Comments": "comments",
        "Unique Insight Status": "unique_insight_status",
    }

    for row in rows[1:]:
        record = {}
        for i, header in enumerate(headers):
            key = COL_MAP.get(header, header)
            val = row[i] if i < len(row) else None
            record[key] = val

        # Skip rows with no insight text
        if not record.get("insight_text"):
            continue

        # Normalize date
        d = record.get("date_of_record")
        if isinstance(d, datetime):
            record["date_of_record"] = d.date()
        elif isinstance(d, str):
            record["date_of_record"] = date.fromisoformat(d[:10])
        elif d is None:
            record["date_of_record"] = date.today()

        # Normalize opportunity_amount to float
        opp = record.get("opportunity_amount")
        if opp is not None:
            try:
                record["opportunity_amount"] = float(opp)
            except (ValueError, TypeError):
                record["opportunity_amount"] = None

        # Build dedup group key
        record["dedup_group_key"] = "|".join([
            str(record.get("account_name", "")),
            str(record.get("date_of_record", "")),
            str(record.get("product_area", "")),
            str(record.get("product_subcategory", "")),
            str(record.get("insight_category", "")),
        ])

        data.append(record)

    wb.close()
    return data


def load_insights(data: list[dict], session) -> int:
    count = 0
    for row in data:
        priority = compute_priority_score(row)
        urgency = compute_urgency_level(row)

        d = row.get("date_of_record")
        if isinstance(d, str):
            d = date.fromisoformat(d[:10])
        elif isinstance(d, datetime):
            d = d.date()

        insight = Insight(
            id=uuid.uuid4(),
            account_name=row.get("account_name") or "Unknown",
            insight_text=row["insight_text"],
            product_area=row.get("product_area", "Unknown"),
            product_subcategory=row.get("product_subcategory", "General"),
            insight_category=row.get("insight_category", "Null"),
            input_data_source=row.get("input_data_source"),
            source_tool=row.get("source_tool", "unknown"),
            source_link=row.get("source_link"),
            role_present=row.get("role_present"),
            conversation_type=row.get("conversation_type"),
            date_of_record=d,
            comments=row.get("comments"),
            dedup_group_key=row.get("dedup_group_key"),
            unique_insight_status=row.get("unique_insight_status", "Key Record"),
            # Account enrichment
            icp=row.get("icp"),
            account_priority_group=row.get("account_priority_group"),
            vertical=row.get("vertical"),
            use_case=row.get("use_case"),
            workloads=row.get("workloads"),
            opportunity_stage=row.get("opportunity_stage"),
            opportunity_amount=row.get("opportunity_amount"),
            gpu_types=row.get("gpu_types"),
            competitors_mentioned=row.get("competitors_mentioned"),
            total_revenue=row.get("total_revenue"),
            most_recent_revenue_month=row.get("most_recent_revenue_month"),
            closed_won_opp_count=row.get("closed_won_opp_count"),
            # Computed
            priority_score=priority,
            urgency_level=urgency,
        )
        session.add(insight)
        count += 1
    session.commit()
    return count


def main():
    print("Creating tables...")
    create_all()

    session = SessionLocal()
    try:
        existing = session.query(Insight).count()
        if existing > 0:
            print(f"Database has {existing} insights. Clearing for re-seed...")
            session.query(Insight).delete()
            session.commit()

        if XLSX_FILE.exists():
            print(f"Loading insights from {XLSX_FILE}")
            data = load_xlsx(XLSX_FILE)
        elif INSIGHTS_JSON.exists():
            print(f"Loading insights from {INSIGHTS_JSON}")
            with open(INSIGHTS_JSON) as f:
                data = json.load(f)
            if isinstance(data, dict) and "insights" in data:
                data = data["insights"]
        else:
            print("No data file found. Cannot seed.")
            return

        count = load_insights(data, session)
        print(f"Seeded {count} insights into the database.")
    finally:
        session.close()


if __name__ == "__main__":
    main()
