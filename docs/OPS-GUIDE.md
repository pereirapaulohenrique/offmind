# OffMind — Operations Guide

**Created:** 2026-03-07
**Purpose:** Quick reference for day-to-day operations after launch. Dashboards, credentials, events, and how to check everything.

---

## Dashboards & Access

| Service | URL | Login |
|---------|-----|-------|
| **PostHog** (Analytics) | https://us.posthog.com | Paulo's account |
| **Sentry** (Errors) | https://offmind.sentry.io | Paulo's account |
| **Stripe** (Payments) | https://dashboard.stripe.com | Paulo's account |
| **Vercel** (Hosting) | https://vercel.com/dashboard | Paulo's account |
| **Supabase** (Database) | https://supabase.com/dashboard/project/xxipgnrcxyagxsfnulwo | Paulo's account |

---

## PostHog — Product Analytics

### How to check analytics

1. Go to https://us.posthog.com
2. **Dashboards** tab for overview (create your first dashboard after launch)
3. **Events** tab to see raw events flowing in real-time
4. **Insights** tab to build custom charts and funnels

### Events being tracked

| Event | Where it fires | Properties | What it tells you |
|-------|---------------|------------|-------------------|
| `$pageview` | Every page load (auto) | `$current_url`, `$referrer` | Traffic, popular pages, referral sources |
| `cta_clicked` | Landing page CTAs | `cta_name`, `location` | Which CTAs get clicked, where on the page |
| `signup` | Signup page (both methods) | `method` (always `'email'`) | How many people create accounts |
| `checkout_started` | Pricing cards + settings | `plan` (`starter`/`builder`/`believer`) | Which tier people attempt to buy |
| `purchase_completed` | Stripe webhook (server) | `plan`, `mode` | Confirmed purchases (source of truth for revenue) |
| `subscription_started` | Stripe webhook (server) | `plan`, `mode` | Recurring subscriptions (post-founding phase) |
| `onboarding_completed` | Onboarding flow | `destinations_count` | Setup completion rate |
| `item_captured` | Any capture action | `source`, `has_attachments` | Capture volume and channels |
| `item_processed` | Organizing an item | `destination_slug` | Where items end up |
| `item_scheduled` | Scheduling an item | `is_all_day` | Calendar adoption |
| `first_capture` | First-ever capture | `source` | Activation signal |
| `ai_feature_used` | AI actions | `action` | AI adoption |
| `page_created` | Creating a page | — | Pages feature adoption |
| `project_created` | Creating a project | — | Projects feature adoption |
| `search_used` | Search action | `has_results` | Search usage and quality |

### Key CTA locations tracked

| `cta_name` | `location` | What the user clicked |
|------------|------------|----------------------|
| `get_access` | `nav` | "Get Access" button in top nav |
| `get_lifetime_access` | `hero` | "Get Lifetime Access" in hero section |
| `see_how_it_works` | `hero` | "See How It Works" in hero section |
| `get_starter_access` | `pricing` | Starter tier pricing card |
| `get_builder_access` | `pricing` | Builder tier pricing card |
| `get_believer_access` | `pricing` | Believer tier pricing card |
| `get_lifetime_access` | `final_cta` | "Get Lifetime Access" at bottom of page |

### Building your first funnel

In PostHog > **Insights** > New Insight > **Funnel**:

1. Step 1: `$pageview` where `$current_url` contains `/` (landing page visit)
2. Step 2: `cta_clicked` (clicked a CTA)
3. Step 3: `signup` (created account)
4. Step 4: `checkout_started` (started checkout)
5. Step 5: `purchase_completed` (paid)

This shows you exactly where people drop off.

### Code locations

| File | What it does |
|------|-------------|
| `lib/analytics/events.ts` | All typed event functions (single source of truth) |
| `lib/analytics/posthog.ts` | PostHog client initialization |
| `lib/analytics/server.ts` | Server-side PostHog client (used by webhook) |
| `components/analytics/PostHogProvider.tsx` | Wraps app, auto-tracks pageviews |
| `app/api/stripe/webhook/route.ts` | Server-side purchase/subscription events |

---

## Sentry — Error Monitoring

### How to check for errors

1. Go to https://offmind.sentry.io
2. **Issues** tab shows all errors grouped by type
3. Click any issue to see: stack trace, browser info, user info, how many times it happened
4. Set up **Alerts** to get notified by email when errors spike

### What's monitored

- All unhandled JavaScript errors (client-side, automatic)
- All API route errors (server-side, via `Sentry.captureException`)
- Performance data (page load times, API latency)

### Key alert to set up (do this on launch day)

In Sentry > **Alerts** > Create Alert:
- **When:** An issue is first seen
- **Then:** Send email notification
- This ensures you know about new errors within minutes.

---

## Stripe — Payments

### How to check payments

1. Go to https://dashboard.stripe.com
2. **Payments** tab shows all completed payments
3. **Customers** tab shows all customer records
4. **Products** tab shows your 3 founding member tiers

### Founding member tiers

| Tier | Price | Stripe Price ID | Spots |
|------|-------|----------------|-------|
| Starter | $49 | `price_1T8QkKC4JCvU2KtyLO48LFn7` | 50 |
| Builder | $79 | `price_1T8QlpC4JCvU2KtyTCfpY7R1` | 100 |
| Believer | $149 | `price_1T8QokC4JCvU2KtyMSJMEdf4` | 50 |

### Testing checkout

Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC.

### Webhook flow

When someone pays:
1. Stripe sends `checkout.session.completed` event to `/api/stripe/webhook`
2. Webhook creates/updates a row in `subscriptions` table (Supabase)
3. Webhook fires `purchase_completed` event to PostHog (server-side)
4. User is redirected to `/home?welcome=founding-member`

---

## Vercel — Hosting & Deploys

### How to deploy

Every push to `main` triggers an automatic deployment on Vercel.

To deploy manually:
```bash
cd ~/Projects/New\ Project/offmind
git push origin main
```

### Environment variables

All env vars are set in Vercel dashboard > Project Settings > Environment Variables.
Local values are in `.env.local` (never committed to git).

### Custom domain

`getoffmind.com` is configured in Vercel > Project > Domains.

---

## Supabase — Database & Auth

### Key tables

| Table | What it stores |
|-------|---------------|
| `items` | All captured thoughts/tasks |
| `destinations` | Spaces, projects, lists |
| `subscriptions` | User subscription/founding member status |
| `profiles` | User profile data |
| `pages` | Rich text documents |

### Row-Level Security (RLS)

All tables have RLS enabled. Users can only read/write their own data. This is enforced at the database level.

---

## Quick Checklist — Launch Day

- [ ] Push to main (triggers Vercel deploy)
- [ ] Verify https://getoffmind.com loads
- [ ] Test checkout with Stripe test card (all 3 tiers)
- [ ] Switch Stripe to live mode (Dashboard > toggle "Test mode" off)
- [ ] Update `.env` on Vercel with live Stripe keys
- [ ] Redeploy after env var change
- [ ] Check PostHog — events should start flowing
- [ ] Set up Sentry alert for new issues
- [ ] Check Sentry — verify no errors from production

---

## Quick Checklist — Daily (First Week)

- [ ] Check Sentry for new errors (fix anything critical immediately)
- [ ] Check PostHog Events tab for traffic and funnel activity
- [ ] Check Stripe Payments for new customers
- [ ] Respond to any user feedback within 24 hours

---

*This guide covers the operational basics. For product roadmap and dev specs, see PRODUCT-SPEC.md. For launch strategy and marketing sequence, see LAUNCH-PLAYBOOK.md.*
