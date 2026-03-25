"""Local synthesis: extract insights from normalized signals without Claude API.

Reads all_signals.json, applies rule-based extraction + classification,
dedup logic, outputs to data/output/insights.json and insights.csv.
"""

import csv
import json
import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path

RAW_DIR = Path(__file__).parent.parent / "data" / "raw"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "output"

CSV_COLUMNS = [
    "account_name", "insight_text", "product_area", "product_subcategory",
    "insight_category", "input_data_source", "source_tool", "source_link",
    "date_of_record", "unique_insight_status", "dedup_group_key",
]

# Keyword-based classification rules
AREA_KEYWORDS = {
    "Infra": ["gpu", "h100", "h200", "b200", "b300", "a100", "capacity", "region", "data center",
              "networking", "peering", "direct connect", "egress", "storage", "chaos", "dfs",
              "caios", "object storage", "skus", "reservation", "flex reservation", "on-demand",
              "instance type", "compute", "reserved instance"],
    "CKS": ["kubernetes", "k8s", "cks", "node pool", "nodepool", "bma", "bmaas",
            "cluster", "bare metal", "conductor", "consumption model"],
    "Platform": ["console", "iam", "identity", "rbac", "scim", "okta", "entra",
                 "terraform", "api key", "audit log", "soc2", "compliance", "security",
                 "observability", "grafana", "dashboard", "billing", "mission control",
                 "telemetry", "monitoring", "onboarding", "self-service"],
    "AI Services": ["inference", "sunk", "slurm", "training", "model serving",
                    "scheduler", "mig", "mps", "gpu partitioning", "vllm", "tgi",
                    "batch inference", "serverless", "endpoint"],
    "W&B": ["wandb", "w&b", "weights", "biases", "weave", "sweeps", "artifacts",
            "registry", "experiments", "runs", "logging", "live logs"],
}

CATEGORY_KEYWORDS = {
    "Capacity": ["capacity", "availability", "scale", "more gpus", "need more"],
    "Capacity Issues": ["capacity blocker", "can't get", "no availability", "constrained"],
    "Pricing / Terms": ["pricing", "price", "cost", "billing", "contract", "commercial",
                        "rate", "charge", "refund", "overage", "flex reservation"],
    "Customer Requirements (Enhancement)": ["feature request", "enhancement", "would like",
        "nice to have", "want to", "improve", "add support", "new feature", "request"],
    "Customer Requirements (Blocker)": ["blocker", "blocking", "required", "must have",
        "go/no-go", "cannot proceed", "deal breaker", "prerequisite"],
    "Issues": ["bug", "incident", "broken", "error", "outage", "regression", "crash"],
    "Education Gaps": ["documentation", "docs", "not documented", "confusing", "unclear",
                       "education", "training materials", "how to"],
    "Product Fit / Scope": ["evaluate", "evaluating", "comparison", "alternative",
                            "right solution", "fit for"],
    "Competition / Alternatives": ["competitor", "lambda", "aws", "azure", "gcp",
                                   "google cloud", "compared to", "versus", "vs"],
    "GTM / Partnership": ["partnership", "integration", "partner", "co-sell", "go to market"],
    "Success Pattern / Win Signal": ["love", "great", "amazing", "excellent", "success",
                                     "working well", "happy with", "positive"],
    "Process / Operational Friction": ["process", "workflow", "operational", "internal",
                                       "governance", "scope creep"],
}

# Account name patterns from our data
KNOWN_ACCOUNTS = [
    "Nasdaq", "Mercado Libre", "Mistral AI", "Crowdstrike", "Hologen",
    "SAP", "Hippocratic AI", "IBM", "Red Hat", "Northflank", "PhysicsX",
    "TensorMesh", "Modal Labs", "Fireworks AI", "NVIDIA", "GSK",
    "AstraZeneca", "Quadrature", "Kaiko", "Isomorphic", "Heron",
    "Augment Code", "Anysphere", "Cursor", "Cohere", "Baseten",
    "Midjourney", "Applied Intuition", "Suno", "Microsoft", "Pinterest",
    "Capital One", "Weights & Biases",
]


def classify_area(text: str) -> tuple[str, str]:
    """Classify product area and subcategory from text."""
    text_lower = text.lower()
    scores = {}
    for area, keywords in AREA_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[area] = score

    if not scores:
        return "Platform", "Console / API / Terraform"

    area = max(scores, key=scores.get)

    # Determine subcategory
    subcategories = {
        "Infra": {"storage": "Storage", "chaos": "Storage", "dfs": "Storage",
                  "object storage": "Storage", "caios": "Storage",
                  "network": "Networking", "peering": "Networking",
                  "direct connect": "Networking", "egress": "Networking"},
        "CKS": {"bma": "BMaaS", "bare metal": "BMaaS",
                "consumption": "Consumption Models"},
        "Platform": {"security": "Security & Compliance", "compliance": "Security & Compliance",
                     "soc2": "Security & Compliance", "iam": "Security & Compliance",
                     "audit": "Security & Compliance",
                     "observability": "Observability", "grafana": "Observability",
                     "monitor": "Observability", "dashboard": "Observability",
                     "telemetry": "Observability", "billing": "Observability"},
        "AI Services": {"training": "SUNK / Training", "sunk": "SUNK / Training",
                        "slurm": "SUNK / Training", "scheduler": "SUNK / Training"},
    }

    defaults = {"Infra": "Compute", "CKS": "CKS", "Platform": "Console / API / Terraform",
                "AI Services": "Inference", "W&B": "n/a"}

    sub_map = subcategories.get(area, {})
    for keyword, subcategory in sub_map.items():
        if keyword in text_lower:
            return area, subcategory

    return area, defaults.get(area, "n/a")


def classify_category(text: str) -> str:
    """Classify insight category from text."""
    text_lower = text.lower()
    scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[cat] = score

    if not scores:
        return "Customer Requirements (Enhancement)"

    return max(scores, key=scores.get)


def extract_account(text: str):
    """Extract account name from text."""
    text_lower = text.lower()
    for account in KNOWN_ACCOUNTS:
        if account.lower() in text_lower:
            return account
    return None


def extract_date(signal: dict) -> str:
    """Extract date from signal."""
    ts = signal.get("timestamp", "")
    if ts:
        # Handle ISO format
        try:
            if "T" in ts:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            else:
                dt = datetime.strptime(ts[:10], "%Y-%m-%d")
            return dt.strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            pass
    return datetime.now().strftime("%Y-%m-%d")


def extract_insights_from_signal(signal: dict) -> list[dict]:
    """Extract one or more insights from a single signal."""
    content = signal.get("raw_content", "")
    if not content:
        return []

    source_tool = signal.get("source_tool", "Unknown")
    source_type = signal.get("source_type", "CX")
    source_link = signal.get("source_link", "")
    date = extract_date(signal)
    account = extract_account(content)

    insights = []

    if source_tool == "Jira":
        # Each Jira ticket is one insight
        # Extract summary line
        summary_match = re.search(r"Summary: (.+)", content)
        summary = summary_match.group(1).strip() if summary_match else content[:200]

        area, sub = classify_area(content)
        cat = classify_category(content)

        # Check for blocker indicators in Jira
        if any(w in content.lower() for w in ["blocker", "blocking", "critical", "must have"]):
            cat = "Customer Requirements (Blocker)"
        elif cat == "Customer Requirements (Enhancement)" and "bug" in content.lower():
            cat = "Issues"

        insights.append({
            "account_name": account,
            "insight_text": summary,
            "product_area": area,
            "product_subcategory": sub,
            "insight_category": cat,
            "input_data_source": source_type,
            "source_tool": source_tool,
            "source_link": source_link,
            "date_of_record": date,
        })

    elif source_tool == "Gong":
        # Extract multiple insights from call snippets
        snippets = re.findall(r"- (.+)", content)
        if not snippets:
            snippets = [content[:500]]

        # Combine snippets for a single insight per call (to avoid over-splitting)
        combined = " ".join(snippets)
        area, sub = classify_area(combined)
        cat = classify_category(combined)

        # Build a coherent insight text
        title_match = re.search(r"Gong Call: (.+)", content)
        title = title_match.group(1).strip() if title_match else "Customer call"

        insight_text = f"{title}: {combined[:300]}"

        insights.append({
            "account_name": account,
            "insight_text": insight_text,
            "product_area": area,
            "product_subcategory": sub,
            "insight_category": cat,
            "input_data_source": source_type,
            "source_tool": source_tool,
            "source_link": source_link,
            "date_of_record": date,
        })

        # If there are distinct topics, extract additional insights
        topics_match = re.search(r"Topics: (.+)", content)
        if topics_match:
            topics = [t.strip() for t in topics_match.group(1).split(",")]
            for topic in topics[1:]:  # Skip first (already covered)
                topic_area, topic_sub = classify_area(topic)
                if topic_area != area:  # Only add if it's a different area
                    insights.append({
                        "account_name": account,
                        "insight_text": f"{title}: {topic}",
                        "product_area": topic_area,
                        "product_subcategory": topic_sub,
                        "insight_category": classify_category(topic),
                        "input_data_source": source_type,
                        "source_tool": source_tool,
                        "source_link": source_link,
                        "date_of_record": date,
                    })

    elif source_tool == "Slack":
        snippets = re.findall(r"- (.+)", content)
        combined = " ".join(snippets) if snippets else content[:500]
        area, sub = classify_area(combined)
        cat = classify_category(combined)

        title_match = re.search(r"Title: (.+)", content)
        title = title_match.group(1).strip() if title_match else "Slack feedback"

        insights.append({
            "account_name": account,
            "insight_text": f"{title}: {combined[:300]}",
            "product_area": area,
            "product_subcategory": sub,
            "insight_category": cat,
            "input_data_source": source_type,
            "source_tool": source_tool,
            "source_link": source_link,
            "date_of_record": date,
        })

    elif source_tool == "Salesforce":
        snippets = re.findall(r"- (.+)", content)
        combined = " ".join(snippets) if snippets else content[:500]
        area, sub = classify_area(combined)
        cat = classify_category(combined)

        title_match = re.search(r"Salesforce: (.+)", content)
        title = title_match.group(1).strip() if title_match else "Salesforce record"

        insights.append({
            "account_name": account,
            "insight_text": f"{title}: {combined[:300]}",
            "product_area": area,
            "product_subcategory": sub,
            "insight_category": cat,
            "input_data_source": source_type,
            "source_tool": source_tool,
            "source_link": source_link,
            "date_of_record": date,
        })

    return insights


def week_of(date_str: str) -> str:
    try:
        dt = datetime.strptime(date_str[:10], "%Y-%m-%d")
        return f"{dt.isocalendar()[0]}-W{dt.isocalendar()[1]:02d}"
    except (ValueError, TypeError):
        return "unknown-week"


def apply_dedup(insights: list[dict]) -> list[dict]:
    """Apply dedup logic."""
    for insight in insights:
        date = insight.get("date_of_record", "")
        week = week_of(date)
        account = (insight.get("account_name") or "unknown").lower().strip()
        area = insight.get("product_area", "").strip()
        sub = insight.get("product_subcategory", "").strip()
        cat = insight.get("insight_category", "").strip()
        insight["dedup_group_key"] = f"{account}|{week}|{area}|{sub}|{cat}"

    groups: dict[str, list[dict]] = defaultdict(list)
    for insight in insights:
        groups[insight["dedup_group_key"]].append(insight)

    key_count = 0
    dupe_count = 0
    for group in groups.values():
        if len(group) == 1:
            group[0]["unique_insight_status"] = "Key Record"
            key_count += 1
        else:
            # Prefer VoF, then longest
            vof = [i for i in group if i.get("input_data_source") == "VoF"]
            candidates = vof if vof else group
            key_record = max(candidates, key=lambda i: len(i.get("insight_text", "").split()))
            for insight in group:
                if insight is key_record:
                    insight["unique_insight_status"] = "Key Record"
                    key_count += 1
                else:
                    insight["unique_insight_status"] = "Duplicate Record"
                    dupe_count += 1

    print(f"Dedup: {key_count} key records, {dupe_count} duplicates")
    return insights


def main():
    # Load normalized signals
    signals_path = RAW_DIR / "all_signals.json"
    if not signals_path.exists():
        print("Run normalize_raw.py first!")
        return

    signals = json.loads(signals_path.read_text())
    print(f"Loaded {len(signals)} signals")

    # Extract insights
    all_insights = []
    for signal in signals:
        insights = extract_insights_from_signal(signal)
        all_insights.extend(insights)

    print(f"Extracted {len(all_insights)} insights")

    # Dedup
    all_insights = apply_dedup(all_insights)

    # Write output
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    json_path = OUTPUT_DIR / "insights.json"
    json_path.write_text(json.dumps(all_insights, indent=2, default=str))
    print(f"Wrote {len(all_insights)} insights to {json_path}")

    csv_path = OUTPUT_DIR / "insights.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(all_insights)
    print(f"Wrote {len(all_insights)} insights to {csv_path}")

    # Summary
    key_records = [i for i in all_insights if i.get("unique_insight_status") == "Key Record"]
    areas = defaultdict(int)
    cats = defaultdict(int)
    sources = defaultdict(int)
    for i in key_records:
        areas[i.get("product_area", "Unknown")] += 1
        cats[i.get("insight_category", "Unknown")] += 1
        sources[i.get("source_tool", "Unknown")] += 1

    print("\n=== Summary ===")
    print(f"Total insights: {len(all_insights)}")
    print(f"Key records: {len(key_records)}")
    print(f"Duplicates: {len(all_insights) - len(key_records)}")
    print("\nBy product area:")
    for area, count in sorted(areas.items(), key=lambda x: -x[1]):
        print(f"  {area}: {count}")
    print("\nBy category:")
    for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")
    print("\nBy source:")
    for src, count in sorted(sources.items(), key=lambda x: -x[1]):
        print(f"  {src}: {count}")


if __name__ == "__main__":
    main()
