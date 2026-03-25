import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import UUID

from app.db import Base


class Insight(Base):
    __tablename__ = "insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    signal_id = Column(UUID(as_uuid=True), ForeignKey("signals.id"), nullable=True)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=True)
    account_name = Column(String(255), nullable=False)
    insight_text = Column(Text, nullable=False)
    product_area = Column(String(50), nullable=False)
    product_subcategory = Column(String(100), nullable=False)
    insight_category = Column(String(100), nullable=False)
    input_data_source = Column(String(50))
    source_tool = Column(String(50), nullable=False)
    source_link = Column(Text)
    role_present = Column(String(50))
    conversation_type = Column(String(50))
    date_of_record = Column(Date, nullable=False)
    comments = Column(Text)
    dedup_group_key = Column(String(500))
    unique_insight_status = Column(String(20), default="Key Record")
    pipeline_run_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # V2 account enrichment fields
    icp = Column(String(100), nullable=True)
    account_priority_group = Column(String(100), nullable=True)
    vertical = Column(String(100), nullable=True)
    use_case = Column(Text, nullable=True)
    workloads = Column(Text, nullable=True)
    opportunity_stage = Column(String(100), nullable=True)
    opportunity_amount = Column(Float, nullable=True)
    gpu_types = Column(Text, nullable=True)
    competitors_mentioned = Column(Text, nullable=True)
    total_revenue = Column(Float, nullable=True)
    most_recent_revenue_month = Column(String(50), nullable=True)
    closed_won_opp_count = Column(Integer, nullable=True)

    # Computed priority fields
    priority_score = Column(Float, nullable=True)
    urgency_level = Column(String(20), nullable=True)

    __table_args__ = (
        Index("ix_insights_account_name", "account_name"),
        Index("ix_insights_product_area", "product_area"),
        Index("ix_insights_insight_category", "insight_category"),
        Index("ix_insights_date_of_record", "date_of_record"),
        Index("ix_insights_dedup_group_key", "dedup_group_key"),
        Index("ix_insights_unique_insight_status", "unique_insight_status"),
    )
