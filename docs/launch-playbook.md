# Launch Playbook

## Day 0 Setup

1. Open `zero-capital-business/site/index.html` and run three demo audits.
2. Replace the deployed site's contact address after creating an email account.
3. Publish the static site with GitHub Pages or Cloudflare Pages.
4. Read `site/privacy.html` and `site/terms.html`; revise for the operator's jurisdiction and risk tolerance.

## Free Deployment: GitHub Pages

1. Create a GitHub repository.
2. Push this workspace.
3. In repository settings, enable Pages.
4. Select the branch and folder containing `zero-capital-business/site`.
5. Visit the generated Pages URL and run a test audit.

## Free Deployment: Cloudflare Pages With Optional API

1. Create a free Cloudflare account.
2. Create a Pages project connected to the GitHub repository.
3. Set build command to empty and output directory to `zero-capital-business/site`.
4. Copy `zero-capital-business/functions` into the Pages Functions directory if deploying from the business folder root.
5. Create a free D1 database named `signalforge_leads`.
6. Bind it as `DB` in Pages project settings.
7. Deploy and submit a test audit over HTTPS.

## First Prospecting Sprint

1. Pick one vertical and one geography.
2. Search Google Maps for 50 businesses.
3. Record business name, website, review count, rating, visible CTA, and one obvious improvement.
4. Send no more than 10 personalized emails per day.
5. Follow up once after three business days with one additional useful observation.

## Qualification Rules

Prioritize businesses that meet at least two:

- More than 20 reviews but weak website conversion
- Rating above 4.3 but low review velocity
- Good service but no service pages
- Unclaimed or incomplete profile
- Mobile website hides call or booking action
- Owner recently posted or appears active

## Launch Metrics

- Audit completions
- Lead export count
- Email replies
- Paid conversions
- Time to fulfill each offer
- Repeatable fixes discovered
- Testimonials collected

