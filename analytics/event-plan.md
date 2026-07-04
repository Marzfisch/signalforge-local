# Analytics Plan

The zero-cost version avoids paid analytics. Start with privacy-conscious aggregate events.

## Events

| Event | Trigger | Purpose |
| --- | --- | --- |
| `audit_started` | Visitor focuses first form field | Measures intent |
| `audit_completed` | Report generated | Measures product value |
| `report_downloaded` | JSON report download | Measures serious interest |
| `mailto_clicked` | Follow-up email link clicked | Measures conversion intent |
| `lead_exported` | Admin export clicked | Measures operator activity |

## KPIs

- Audit completion rate
- Qualified lead rate
- Reply rate
- Starter Fix close rate
- Growth Sprint close rate
- Care Plan retention
- Average fulfillment time

## Free Tools

- Browser local storage export
- Cloudflare Web Analytics free tier if hosted there
- Server logs from Cloudflare Pages Functions
- Manual weekly report from `scripts/weekly_growth_report.py`

