import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


LEADS_PATH = Path("zero-capital-business/data/leads.json")
OUTPUT_PATH = Path("zero-capital-business/reports/weekly-growth-report.md")


def main():
    leads = read_leads()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(render(leads), encoding="utf-8")
    print(OUTPUT_PATH)


def read_leads():
    if not LEADS_PATH.exists():
        return []
    return json.loads(LEADS_PATH.read_text(encoding="utf-8"))


def render(leads):
    offers = Counter(lead.get("offer", "Unknown") for lead in leads)
    average_score = round(sum(float(lead.get("score", 0)) for lead in leads) / len(leads), 1) if leads else 0
    lines = [
        "# Weekly Growth Report",
        "",
        f"Generated: {datetime.now(timezone.utc).isoformat()}",
        f"Lead count: {len(leads)}",
        f"Average audit score: {average_score}",
        "",
        "## Offer Demand",
        "",
    ]
    if offers:
        lines.extend(f"- {offer}: {count}" for offer, count in offers.most_common())
    else:
        lines.append("- No leads recorded yet.")
    lines.extend(
        [
            "",
            "## Next Actions",
            "",
            "- Follow up with every Growth Sprint lead within one business day.",
            "- Turn the most common weak category into the next blog post.",
            "- Ask completed Starter Fix customers for one testimonial and one referral.",
        ]
    )
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    main()
