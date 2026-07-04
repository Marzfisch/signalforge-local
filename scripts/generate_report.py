import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


WEIGHTS = {
    "visibility": 0.32,
    "trust": 0.24,
    "conversion": 0.24,
    "automation": 0.20,
}


def score(data):
    visibility = min(
        100,
        (24 if data.get("hasGBP") else 0)
        + (24 if data.get("hasServicePages") else 0)
        + (18 if data.get("hasSchema") else 0)
        + (14 if data.get("hasFAQ") else 0)
        + min(20, number(data.get("monthlyVisits")) / 75),
    )
    trust = min(
        100,
        min(36, number(data.get("reviewCount")) * 0.8)
        + max(0, min(34, (number(data.get("rating")) - 3.5) * 24))
        + min(30, number(data.get("reviewVelocity")) * 6),
    )
    conversion = min(
        100,
        (38 if data.get("hasBooking") else 0)
        + (18 if data.get("hasFAQ") else 0)
        + (18 if data.get("hasServicePages") else 0)
        + (14 if str(data.get("website", "")).startswith("https://") else 0)
        + min(12, number(data.get("monthlyVisits")) / 150),
    )
    automation = min(
        100,
        (45 if data.get("hasReviewWorkflow") else 0)
        + (22 if data.get("hasBooking") else 0)
        + (13 if data.get("hasFAQ") else 0)
        + (10 if data.get("hasSchema") else 0)
        + min(10, number(data.get("reviewVelocity")) * 2),
    )
    categories = {
        "visibility": round(visibility),
        "trust": round(trust),
        "conversion": round(conversion),
        "automation": round(automation),
    }
    total = round(sum(categories[key] * WEIGHTS[key] for key in categories))
    return total, categories


def recommendations(data, categories):
    items = []
    if not data.get("hasServicePages"):
        items.append("Create one focused page per core service and location.")
    if not data.get("hasGBP"):
        items.append("Claim and complete the Google Business Profile.")
    if not data.get("hasSchema"):
        items.append("Add LocalBusiness schema with profile and service details.")
    if number(data.get("reviewVelocity")) < 4:
        items.append("Install a review request workflow for satisfied customers.")
    if not data.get("hasBooking"):
        items.append("Place a call, booking, or quote action in the first mobile viewport.")
    if not data.get("hasFAQ"):
        items.append("Publish search-focused FAQs that answer buyer-intent questions.")
    if categories["automation"] < 65:
        items.append("Automate weekly checks for reviews, content ideas, and unanswered questions.")
    return items[:6]


def offer(total):
    if total < 55:
        return "Starter Fix"
    if total < 78:
        return "Growth Sprint"
    return "Care Plan"


def number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def slug(value):
    clean = "".join(char.lower() if char.isalnum() else "-" for char in str(value))
    while "--" in clean:
        clean = clean.replace("--", "-")
    return clean.strip("-") or "signalforge"


def markdown(data, total, categories, recs, recommended_offer):
    lines = [
        f"# SignalForge Local Audit: {data.get('businessName')}",
        "",
        f"Generated: {datetime.now(timezone.utc).isoformat()}",
        f"Location: {data.get('location')}",
        f"Category: {data.get('category')}",
        f"Website: {data.get('website')}",
        "",
        f"## Overall Score: {total}/100",
        "",
        "| Category | Score |",
        "| --- | ---: |",
    ]
    lines.extend(f"| {name.title()} | {value}/100 |" for name, value in categories.items())
    lines.extend(
        [
            "",
            f"## Recommended Offer: {recommended_offer}",
            "",
            "## Priority Fixes",
            "",
        ]
    )
    lines.extend(f"- {item}" for item in recs)
    lines.extend(
        [
            "",
            "## Follow-Up Prompt",
            "",
            "Ask which service and location the owner most wants to grow, then propose the smallest implementation scope that removes the top bottleneck.",
        ]
    )
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Generate a SignalForge Local audit report.")
    parser.add_argument("--input", required=True, help="Path to business JSON input.")
    parser.add_argument("--output", required=True, help="Directory for generated report files.")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    data = json.loads(input_path.read_text(encoding="utf-8"))
    total, categories = score(data)
    recs = recommendations(data, categories)
    recommended_offer = offer(total)
    report = markdown(data, total, categories, recs, recommended_offer)
    output_path = output_dir / f"{slug(data.get('businessName'))}-audit.md"
    output_path.write_text(report, encoding="utf-8")
    print(output_path)


if __name__ == "__main__":
    main()
