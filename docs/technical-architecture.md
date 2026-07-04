# Technical Architecture

## Design

SignalForge Local is static-first. The audit engine runs in `site/app.js`, so the product works without a server, database, paid API, or build system.

## Components

- `site/index.html` - landing page, audit form, offers, admin dashboard
- `site/app.js` - scoring engine, recommendation logic, local lead storage, report export
- `site/styles.css` - responsive visual system
- `functions/api/leads.js` - optional Cloudflare Pages Function for server-side lead capture
- `scripts/generate_report.py` - local report generator
- `scripts/weekly_growth_report.py` - operator review automation
- `tests/audit-engine.test.mjs` - dependency-free scoring regression tests

## Data Flow

1. Visitor enters public business information.
2. Browser computes category scores and recommendations.
3. Browser stores lead summary in `localStorage`.
4. If hosted over HTTP(S), browser attempts `POST /api/leads`.
5. Cloudflare Function writes to D1 when `DB` is bound.
6. Operator exports leads or queries D1.

## Database Schema

The optional D1 endpoint creates this table automatically:

```sql
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  business_name TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  website TEXT NOT NULL,
  email TEXT,
  score INTEGER NOT NULL,
  offer TEXT NOT NULL,
  payload TEXT NOT NULL
);
```

## Privacy

The MVP avoids invasive analytics and paid pixels. Use aggregate, non-sensitive events until customer consent requirements are reviewed.

## Maintenance

Weekly:

- Export new leads
- Run `weekly_growth_report.py`
- Review weak categories and update one article or outreach angle
- Add any new fulfilled customer result to a case study file

Monthly:

- Re-score pricing
- Remove confusing form fields
- Retire outreach segments with poor response rates
- Add one vertical-specific recommendation rule

