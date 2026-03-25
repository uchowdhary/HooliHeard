# V2 Dashboard Enhancement Plan

## 1. Data Model Changes (Priority: Highest)

V2 Excel data has rich account fields sitting unused. Surface them through DB → API → Frontend.

**Add columns to `insights` table:**
- `icp` (String) — Ideal Customer Profile tier
- `account_priority_group` (String)
- `vertical` (String) — Industry vertical
- `use_case` (Text)
- `workloads` (Text)
- `opportunity_stage` (String)
- `opportunity_amount` (Numeric) — Dollar value of opportunity
- `gpu_types` (String)
- `competitors_mentioned` (String)
- `total_revenue` (Numeric)
- `most_recent_revenue_month` (String)
- `closed_won_opp_count` (Integer)

**Add computed columns:**
- `priority_score` (Numeric) — Weighted composite score
- `urgency_level` (String) — High/Medium/Low

## 2. Priority Scoring Model

```
priority_score = (opportunity_weight × stage_weight × engagement_weight × category_weight × tier_multiplier) / 100
```

| Factor | Source Field | Weighting Logic |
|--------|-------------|-----------------|
| Opportunity size | `opportunity_amount` | Normalize to 1-10 scale |
| Customer stage | `opportunity_stage` | Closed Won=10, Negotiation=8, Proposal=6, Discovery=3, New=1 |
| Engagement length | `total_revenue` + `closed_won_opp_count` | Higher revenue = higher weight |
| Category urgency | `insight_category` | Blocker=10, Capacity Issues=8, Issues=7, Enhancement=5, Education=3 |
| Account tier | `icp` + `account_priority_group` | Tier 1/Strategic=3x, Tier 2=2x, Tier 3=1x |

## 3. Backend API Additions

**New endpoints:**
- `GET /api/dashboard/by-priority` — Ranked by priority_score, grouped by product area
- `GET /api/dashboard/by-vertical` — Breakdown by industry vertical
- `GET /api/dashboard/by-opportunity-stage` — Pipeline view
- `GET /api/dashboard/priority-matrix` — 2D scatter data (priority vs frequency, sized by ARR)

**Enhance existing:**
- `sort_by` param on `GET /api/insights`
- Filters: `icp`, `vertical`, `opportunity_stage`, `min_priority_score`
- Summary: total ARR, avg priority score, top vertical

## 4. Frontend Visualizations

| Component | Chart Type | Shows |
|-----------|-----------|-------|
| Priority Leaderboard | Ranked table | Top insights by score with account, area, $ |
| Priority × Area Matrix | Heatmap | Highest-priority areas |
| Opportunity Pipeline | Stacked bar | Insights by opp stage, colored by area |
| Customer ARR Coverage | KPI card | Total ARR represented |
| Vertical Breakdown | Donut | Industry distribution |
| Competitor Mentions | Bar chart | Competitors by area |

## 5. Implementation Sequence

| Step | Work | Files |
|------|------|-------|
| A | Add new columns to Insight model | `backend/app/models/insight.py` |
| B | Update seed_db.py for all 25 columns + priority_score | `scripts/seed_db.py` |
| C | Re-seed database | Run script |
| D | Add priority scoring service | `backend/app/services/priority_service.py` |
| E | Add/enhance API endpoints | `backend/app/api/dashboard.py`, `insights.py` |
| F | Update Pydantic schemas | `backend/app/schemas/` |
| G | Add Priority Dashboard page | `frontend/src/components/dashboard/` |
| H | Enhance FilterBar | `frontend/src/components/dashboard/FilterBar.tsx` |
| I | Add priority column + sorting to InsightsTable | `frontend/src/components/insights/` |
| J | Wire up CSV export button | `frontend/src/components/insights/InsightsPage.tsx` |
