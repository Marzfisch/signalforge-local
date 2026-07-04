# SignalForge Local

SignalForge Local is a zero-capital productized service business for small local companies that need practical marketing and automation help but cannot justify a consultant retainer.

The public product is a free, browser-based Local SEO and AI-readiness audit. It gives owners a useful report immediately, then routes qualified leads into productized implementation offers:

- Starter Fix: one-time local presence cleanup
- Growth Sprint: content, review, and conversion improvements
- Care Plan: recurring monthly monitoring and execution

The business can launch with no paid software, no paid APIs, no ads, no inventory, and no employees. The first version is a static web app that can run locally, on GitHub Pages, or on Cloudflare Pages. Optional Cloudflare Pages Functions and D1 can capture leads on the free tier.

## Why This Business

Research performed on July 4, 2026 showed strong demand signals around AI-enabled small business operations, local marketing help, and automation. Small business owners report pressure from marketing, social content, and administration, while current AI tools often feel too broad or too complex. A productized diagnostic creates trust first, avoids paid acquisition, and converts through concrete next actions.

Scoring summary:

| Model | Revenue Potential | Automation | Startup Cost | Maintenance | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| Generic AI newsletter | Low | High | $0 | Medium | Too crowded and weak buyer intent |
| Digital template shop | Medium | High | $0 | Medium | Needs marketplace traction |
| Freelance automation agency | High | Medium | $0 | High | Too labor-heavy unless productized |
| Niche local audit and implementation | High | High | $0 | Low-Medium | Chosen |
| AI video service | High | Medium | $0 | High | Better later as an add-on |

## Repository Map

- `site/` - static public website, audit tool, lead capture, admin dashboard, legal pages
- `functions/` - optional free-tier Cloudflare Pages API endpoint
- `scripts/` - local automation scripts for report generation, lead export, and weekly growth review
- `docs/` - business plan, launch playbook, operations manual, technical architecture
- `marketing/` - blog posts, outreach emails, social posts, FAQ, onboarding
- `branding/` - naming, messaging, visual system, logo prompts
- `analytics/` - event plan and KPI definitions
- `tests/` - dependency-free regression checks for the audit engine

## Run Locally

Open `site/index.html` in a browser. No server is required.

To run the test suite:

```powershell
node .\zero-capital-business\tests\audit-engine.test.mjs
```

To generate a sample report:

```powershell
python .\zero-capital-business\scripts\generate_report.py --input .\zero-capital-business\scripts\sample_business.json --output .\zero-capital-business\reports
```

## Free Launch Path

1. Create a free GitHub account or use an existing one.
2. Push this repository to GitHub.
3. Enable GitHub Pages for `zero-capital-business/site`.
4. Add the URL to free profiles: Google Business Profile posts, LinkedIn, Reddit profile, relevant local directories, and email signature.
5. Use the outreach templates in `marketing/email-templates.md` for direct, non-spammy prospecting.
6. For lead capture without a server, use the built-in export button in the admin dashboard. For server-side capture, deploy to Cloudflare Pages and bind a free D1 database as documented in `docs/technical-architecture.md`.

## Revenue Offers

- Starter Fix: $149 one-time
- Growth Sprint: $399 one-time
- Care Plan: $199/month

The pricing is intentionally modest for fast validation. Raise prices after five completed case studies.

