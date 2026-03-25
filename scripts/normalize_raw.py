"""Normalize raw data from MCP/Glean pulls into the format expected by synthesize.py.

Each signal needs: source_tool, source_type, raw_content, source_link, timestamp
"""

import json
from pathlib import Path

RAW_DIR = Path(__file__).parent.parent / "data" / "raw"


def normalize_jira(data: list[dict]) -> list[dict]:
    signals = []
    for issue in data:
        desc = issue.get("description") or ""
        # Truncate very long descriptions
        if len(desc) > 4000:
            desc = desc[:4000] + "..."
        raw = f"Jira CFR: {issue.get('key', '')}\n"
        raw += f"Summary: {issue.get('summary', '')}\n"
        raw += f"Priority: {issue.get('priority', '')}\n"
        raw += f"Status: {issue.get('status', '')}\n"
        raw += f"Labels: {', '.join(issue.get('labels', []))}\n"
        raw += f"Components: {', '.join(issue.get('components', []))}\n"
        raw += f"Assignee: {issue.get('assignee', '')}\n\n"
        raw += f"Description:\n{desc}"
        signals.append({
            "source_tool": "Jira",
            "source_type": "CX",
            "raw_content": raw,
            "source_link": issue.get("source_url", ""),
            "timestamp": issue.get("created", ""),
        })
    return signals


def normalize_gong(data: list[dict]) -> list[dict]:
    signals = []
    for call in data:
        raw = f"Gong Call: {call.get('title', '')}\n"
        raw += f"Account: {call.get('account', '')}\n"
        raw += f"Date: {call.get('date', '')}\n"
        raw += f"Owner: {call.get('owner', '')}\n"
        raw += f"Topics: {', '.join(call.get('topics', []))}\n\n"
        raw += "Key Excerpts:\n"
        for snippet in call.get("snippets", []):
            raw += f"- {snippet}\n"
        signals.append({
            "source_tool": "Gong",
            "source_type": "VoF",
            "raw_content": raw,
            "source_link": call.get("url", ""),
            "timestamp": call.get("date", ""),
        })
    return signals


def normalize_slack(data: list[dict]) -> list[dict]:
    signals = []
    for msg in data:
        raw = f"Slack Channel: #{msg.get('channel', '')}\n"
        raw += f"Title: {msg.get('title', '')}\n"
        raw += f"From: {msg.get('owner', '')}\n"
        raw += f"Date: {msg.get('date', '')}\n"
        raw += f"Topics: {', '.join(msg.get('topics', []))}\n\n"
        raw += "Content:\n"
        for snippet in msg.get("snippets", []):
            raw += f"- {snippet}\n"
        signals.append({
            "source_tool": "Slack",
            "source_type": "VoF",
            "raw_content": raw,
            "source_link": msg.get("url", ""),
            "timestamp": msg.get("date", ""),
        })
    return signals


def normalize_salesforce(data: list[dict]) -> list[dict]:
    signals = []
    for rec in data:
        raw = f"Salesforce: {rec.get('title', '')}\n"
        raw += f"Owner: {rec.get('owner', '')}\n"
        raw += f"Created: {rec.get('createTime', '')}\n"
        raw += f"Updated: {rec.get('updateTime', '')}\n"
        accounts = rec.get("account", [])
        if accounts:
            raw += f"Account: {', '.join(accounts) if isinstance(accounts, list) else accounts}\n"
        types = rec.get("type", [])
        if types:
            raw += f"Type: {', '.join(types) if isinstance(types, list) else types}\n"
        raw += "\nContent:\n"
        for snippet in rec.get("snippets", []):
            raw += f"- {snippet}\n"
        signals.append({
            "source_tool": "Salesforce",
            "source_type": "Loss" if "closed" in rec.get("title", "").lower() or "lost" in rec.get("title", "").lower() else "CX",
            "raw_content": raw,
            "source_link": rec.get("url", ""),
            "timestamp": rec.get("createTime", ""),
        })
    return signals


def main():
    all_signals = []

    normalizers = {
        "jira_cfr.json": normalize_jira,
        "gong.json": normalize_gong,
        "slack.json": normalize_slack,
        "salesforce.json": normalize_salesforce,
    }

    for filename, normalizer in normalizers.items():
        path = RAW_DIR / filename
        if path.exists():
            data = json.loads(path.read_text())
            signals = normalizer(data)
            print(f"{filename}: {len(data)} records → {len(signals)} signals")
            all_signals.extend(signals)
        else:
            print(f"{filename}: not found, skipping")

    # Write normalized signals
    output_path = RAW_DIR / "all_signals.json"
    output_path.write_text(json.dumps(all_signals, indent=2, default=str))
    print(f"\nTotal: {len(all_signals)} normalized signals → {output_path}")


if __name__ == "__main__":
    main()
