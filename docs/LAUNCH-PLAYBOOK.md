# OffMind — Launch Playbook

**Created:** 2026-03-07
**Author:** Paulo Pereira + Claude (consolidated from Codex diagnosis + marketing research + product audit)
**Type:** Plan
**Status:** Active
**Replaces:** SPRINT-PLAN.md (archived), Marketing Execution Plan 2026-03-06 (archived)

---

## Why This Document Exists

OffMind had 34 marketing/launch files scattered across the project folder and vault. Multiple contradictory pricing models, broken checkout flows, and a marketing plan built for a company with an audience — which OffMind doesn't have yet.

This playbook is the **single source of truth** for: what to fix, what to sell, and how to get the first paying customers.

---

## Part 1: Current State Diagnosis

### What's Working

- Landing page design is premium (Zinc-950 + teal, clean typography, good builder section)
- Positioning is solid: "Your mind captures everything. OffMind organizes it."
- Trust stack structure exists (builder credibility, tech badges, refund guarantee)
- Founding member framing is correct (scarcity + one-time pricing + direct access)
- Content templates are drafted (X thread, Reddit posts, Show HN, LinkedIn)

### What Was Broken (ALL FIXED as of 2026-03-07)

#### 1. Pricing is Fragmented (4 conflicting models)

| Location | What It Says | File |
|---|---|---|
| Landing page | Founding Member: $49 / $79 / $149 (one-time) | `app/page.tsx:362-408` |
| Checkout API | Accepts: `monthly` / `annual` / `lifetime` (no `starter`/`builder`/`believer`) | `app/api/stripe/create-checkout/route.ts:21-24` |
| Stripe client PLANS | $9/mo, $79/yr, $199 once | `lib/stripe/client.ts:36-60` |
| Signup page | "Start your 14-day free trial" | `app/(auth)/signup/page.tsx:134` |

**Impact:** A user who clicks "Get Builder Access" sees nothing happen (`href="#"`). If they reach signup, they're promised a free trial. If they reach settings/billing, they see subscription pricing. Trust destroyed at every step.

#### 2. CTA Buttons Are Dead

All three pricing card CTAs are `<a href="#" data-plan={plan}>`. They don't link to checkout, don't redirect, don't do anything. This alone makes the product unsellable.

**File:** `app/page.tsx:716`

#### 3. Domain/Email Fragmentation

| Domain | Used In |
|---|---|
| `offmind.ai` | Desktop app default, landing page badge, test email, feedback route |
| `getoffmind.com` | Email templates, OG images, terms, privacy, refund FAQ |
| `hello@getoffmind.com` | Terms, privacy, waitlist API sender |
| `support@offmind.ai` | Help page, feedback API sender |

**Decision needed:** Pick ONE primary domain. Recommendation: `getoffmind.com` (already used for legal/transactional pages).

#### 4. Signup Contradicts the Offer

`signup/page.tsx:134` says "Start your 14-day free trial". The landing page says "Pay once. Use forever." These cannot coexist. New users who arrive from the landing page and see "free trial" will think the founding member purchase didn't work.

#### 5. Stripe Infrastructure Not Ready

- No Stripe Price objects created for $49/$79/$149
- `PRICES` object in `client.ts` maps to env vars that don't have values
- Checkout mode is `payment` only for `lifetime` plan; founding members need all tiers as `payment` mode
- Webhook doesn't handle the new tier names

---

## Part 2: The One Commercial Model

**Decision: Founding Member, 3 tiers, all one-time payments.**

| Tier | Price | Spots | Mode |
|---|---|---|---|
| Starter | $49 | 50 | `payment` (one-time) |
| Builder | $79 | 100 | `payment` (one-time) |
| Believer | $149 | 50 | `payment` (one-time) |

**Rules:**
- ALL are one-time Stripe Checkout sessions (`mode: 'payment'`)
- No free trial during founding member phase
- No subscription pricing visible anywhere
- After 200 spots fill → switch to $9/month subscription model
- 14-day money-back guarantee on all tiers

### Code Changes Required

#### A. `lib/stripe/client.ts` — Replace PRICES and PLANS

```typescript
// Price IDs from environment (Paulo creates in Stripe Dashboard)
export const PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER || '',
  builder: process.env.STRIPE_PRICE_BUILDER || '',
  believer: process.env.STRIPE_PRICE_BELIEVER || '',
};

export const PLANS = {
  starter: {
    name: 'Starter',
    price: '$49',
    priceId: PRICES.starter,
    spots: 50,
    features: ['Full OffMind access', 'AI-powered organizing', 'All capture methods', '1 year of updates', 'Community access'],
  },
  builder: {
    name: 'Builder',
    price: '$79',
    priceId: PRICES.builder,
    spots: 100,
    features: ['Everything in Starter', 'Lifetime updates', 'Priority support', 'Direct access to Paulo', 'All future features'],
  },
  believer: {
    name: 'Believer',
    price: '$149',
    priceId: PRICES.believer,
    spots: 50,
    features: ['Everything in Builder', 'All future products', 'Private Discord channel', 'Shape the roadmap', 'Founding member badge'],
  },
};
```

#### B. `app/api/stripe/create-checkout/route.ts` — All tiers use payment mode

```typescript
// All founding member tiers are one-time payments
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  mode: 'payment', // Always payment for founding members
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${appUrl}/home?welcome=founding-member`,
  cancel_url: `${appUrl}/#pricing`,
  metadata: {
    supabase_user_id: user.id,
    plan,
  },
});
```

#### C. `app/page.tsx` — Wire CTA buttons

Replace `<a href="#" data-plan={plan}>` with actual checkout links:
```tsx
<a href={`/api/stripe/create-checkout?plan=${plan}`}>
```

Or if the user must be logged in first, redirect to signup with plan parameter:
```tsx
<a href={`/signup?plan=${plan}`}>
```

#### D. `app/(auth)/signup/page.tsx` — Remove free trial language

Replace "Start your 14-day free trial" with:
- If `?plan=` parameter: "Complete your founding member purchase"
- If no parameter: "Create your OffMind account"

#### E. Domain Unification

Pick `getoffmind.com` as primary. Update:
- `app/page.tsx:154` — badge text: `offmind.ai` → remove or change to `getoffmind.com`
- `app/help/page.tsx:173,428,432` — `support@offmind.ai` → `hello@getoffmind.com`
- `app/api/feedback/route.ts:38,49` — `feedback@offmind.ai`, `noreply@offmind.ai` → `hello@getoffmind.com`
- `packages/capture-desktop/electron/main.ts:354` — `offmind.ai` → `getoffmind.com`
- `tests/e2e/helpers/auth.ts:3` — `e2e-test@offmind.ai` → `e2e-test@getoffmind.com`

#### F. `.env` — New variables needed

```bash
# Replace old price IDs
STRIPE_PRICE_STARTER=price_xxx    # Paulo creates in Stripe Dashboard
STRIPE_PRICE_BUILDER=price_xxx
STRIPE_PRICE_BELIEVER=price_xxx

# Remove old ones
# NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID (delete)
# NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID (delete)
# NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID (delete)
```

---

## Part 3: 30-Day Launch Sequence

### Principle

Visibility is not the bottleneck. The bottleneck is: **offer clarity + commercial consistency + proof + founder-led sales.**

The sequence: Fix the pipe → Turn on a trickle → Prove it converts → Then scale.

### Days 1-3: Seal the Pipe — ALL DONE (2026-03-07)

**Goal:** A user can land on getoffmind.com, understand the offer, click a button, pay, and get access. No contradictions, no dead ends.

| # | Task | Who | Status |
|---|---|---|---|
| 1 | Create 3 Stripe Price objects ($49/$79/$149, one-time) | Paulo + Claude (via Playwright) | DONE |
| 2 | Update `lib/stripe/client.ts` (new PRICES + PLANS) | Claude | DONE |
| 3 | Update `create-checkout/route.ts` (all payment mode, new plan names) | Claude | DONE |
| 4 | Wire pricing card CTAs to actual checkout | Claude | DONE |
| 5 | Remove "14-day free trial" from signup page | Claude | DONE |
| 6 | Unify domain to `getoffmind.com` across all files | Claude | DONE |
| 7 | Update Stripe webhook to handle new tier names | Claude | DONE |
| 8 | Deploy to Vercel + all env vars configured | Claude (via Playwright) | DONE |
| 9 | Create PostHog project + configure key | Claude (via Playwright) | DONE |
| 10 | Create Sentry project + configure DSN | Claude (via Playwright) | DONE |
| 11 | Verify getoffmind.com DNS/SSL on Vercel | Claude (via Playwright) | DONE |
| 12 | Instrument PostHog: CTA click, signup, checkout, purchase | Claude | DONE |

**All infrastructure complete. See `/docs/OPS-GUIDE.md` for how to access dashboards and check analytics.**

Remaining before go-live:
- Test checkout flow end-to-end with Stripe test card (Paulo, 30 min)
- Switch Stripe to live mode and update Vercel env vars with live keys
- Push to main to trigger production deploy

### Days 4-14: Turn On the Trickle (Conversations, Not Campaigns)

**Goal:** 15 outreach conversations, 5-8 serious talks, 3-5 real users giving feedback.

The first customers don't come from content. They come from **conversations.**

| Channel | Action | Target | Who |
|---|---|---|---|
| Reddit | 3-5 helpful comments/day in r/ClaudeAI, r/productivity, r/SaaS | Build karma, earn trust | Paulo |
| Reddit | 1 "I built" post on r/SideProject or r/SaaS (day 7+, if karma > 50) | First public post | Paulo |
| DM outreach | 10-15 warm DMs to people who posted about productivity pain on Reddit/X | Real conversations | Paulo |
| X | 1 original post/day + 3-5 genuine replies | Build-in-public presence | Paulo |
| Directories | Submit to BetaList, SaaSHub, AlternativeTo (low effort, long tail) | SEO + backlinks | Paulo |
| Founder onboarding | Manual onboarding for first 3-5 paying users (call, walkthrough, feedback) | Proof + testimonials | Paulo |

**What NOT to do in Days 4-14:**
- No Product Hunt (too early, no proof yet)
- No Show HN (no proof yet)
- No YouTube Shorts (compounding channel, not first-sales channel)
- No LinkedIn product mention (authority channel, not sales channel)
- No mass posting across 5 subreddits in one week (looks like spam)

### Days 15-21: Double Down on What Works

**Goal:** Identify which channel generated the most conversations or purchases. Invest there.

| Signal | Action |
|---|---|
| Reddit comments are generating DMs | Post your "I built" story on r/productivity or r/ClaudeAI |
| DM outreach is converting | Do 15 more, ask for referrals |
| X build-in-public is getting replies | Write the longer thread (content templates are ready) |
| Nobody is converting | Revisit landing page copy with real objections collected from conversations |
| People sign up but don't pay | The offer isn't clear or the product isn't convincing on first use. Fix onboarding. |

Also in this window:
- Publish first proof (real user quote, real usage screenshot, real metric)
- Adjust landing page based on actual objections heard in conversations
- Consider LinkedIn soft-mention if authority channel is warm

### Days 22-30: Only Now Consider Scale Channels

**Gate:** Only proceed if you have: (a) at least 5 paying customers, (b) at least 1 real proof/testimonial, (c) checkout flow working without issues.

If gate passes:
- Submit Show HN (weekday morning EST, use drafted post)
- Consider Product Hunt Upcoming page (actual launch = Week 5-6 at earliest)
- First YouTube Short (30-second product demo)
- Email blast to Kit list (if > 50 subscribers)

If gate doesn't pass:
- Don't. More visibility on a leaky funnel just burns trust.
- Go back to conversations. Find out why people aren't paying.

---

## Part 4: Content Templates (Ready to Use)

These were drafted in the marketing execution plan. The copy is good. The sequencing was wrong. Use them when the time comes per the schedule above.

### X Thread (Use: Day 7-10, after checkout is working)

Source: `~/.vault/pipeline/archive/superseded/offmind-marketing-execution-plan-2026-03-06.md` Part 4.

Key thread: "What 6 months of building a thinking system taught me" — 6 tweets, ends with product reveal.

### Reddit Posts (Use: Day 7-14, after karma > 50)

Three posts drafted:
1. **r/productivity** — "I spent 6 months building the productivity app I couldn't find"
2. **r/ClaudeAI** — Technical architecture showcase
3. **r/Notion** — Differentiation from Notion, respectful tone

**Rule:** Lead with value, product mention at the end, link only if asked in comments. Match each subreddit's culture.

### Show HN (Use: Day 22-30, only if gate passes)

Source: Same archived file, Part 4. Technical angle, architecture details, founding member mention at end.

### LinkedIn (Use: Ongoing, but never mention OffMind by name)

Authority-building only. Per `~/Business/CLAUDE.md`: "Never mention OffMind by name on LinkedIn." Reference as "something I've been building" with link only in comments if asked.

### Email Sequence (Use: When Kit is set up and has subscribers)

3 emails:
1. Welcome (immediate) — what OffMind is, founding member pricing
2. Differentiator (day 2) — the one thing Notion can't do
3. Urgency (day 5) — spots remaining

---

## Part 5: Success Metrics

### Days 1-3 (Pipe Sealed)

| Metric | Target | How |
|---|---|---|
| Checkout works | All 3 tiers complete purchase | Manual test |
| No pricing contradictions | Zero conflicting prices in any page | Manual audit |
| Domain consistent | `getoffmind.com` everywhere | grep audit |
| CTA tracking | PostHog tracks clicks, signups, purchases | PostHog dashboard |

### Days 4-14 (First Trickle)

| Metric | Target | How |
|---|---|---|
| Conversations started | 15+ | DMs + comment replies |
| Serious conversations | 5-8 | People who asked follow-up questions |
| First paying customer | 1+ | Stripe Dashboard |
| Landing page visits | 200+ | PostHog/Vercel Analytics |
| Reddit karma | 50+ | Reddit profile |

### Days 15-21 (Proof)

| Metric | Target | How |
|---|---|---|
| Paying customers (cumulative) | 5+ | Stripe |
| Real testimonials collected | 1-2 | From founder onboarding calls |
| Repeatable channel identified | 1 channel with > 2 conversions | Analysis |

### Days 22-30 (Scale Decision)

| Metric | Target | How |
|---|---|---|
| Paying customers (cumulative) | 10+ | Stripe |
| Revenue | $500+ | Stripe |
| Scale channel activated | Show HN or PH Upcoming live | Manual check |

### Kill / Pivot Criteria

| After | Signal | Action |
|---|---|---|
| 14 days | 0 paying customers | Rewrite positioning. The offer doesn't resonate. |
| 14 days | 1-4 customers | Keep going. Double down on the channel that worked. |
| 14 days | 5+ customers | Scale. Activate Show HN, start PH prep. |
| 30 days | < $200 revenue | Fundamental pivot needed. Problem might not be acute enough to pay for. |

---

## Part 6: What We Keep from Previous Research

These files remain in `~/.vault/pipeline/outputs/` as active research references. They don't need to be in this playbook but they inform decisions:

| File | What It Contains | Use When |
|---|---|---|
| `2026-02-25-product-hunt-research.md` | PH strategy, featured vs non-featured stats, 21-day prep timeline | Before PH launch (Day 22-30+) |
| `2026-02-24-reddit-growth-playbook.md` | Full Reddit strategy, karma building, post templates | Days 4-14 (Reddit phase) |
| `2026-02-26-subreddit-recommendation-intelligence.md` | 14 subreddits analyzed, tier ranking, promotion rules | Before any Reddit post |
| `2026-02-25-seed-users-research.md` | 40 DM targets from r/ClaudeAI | Days 4-14 (outreach phase) |
| `2026-02-25-seed-outreach-targets.md` | Discord + X outreach targets | Days 4-14 |
| `2026-02-26-targeting-list.md` | Full community + account targeting map | Ongoing reference |
| `2026-02-25-growth-research-synthesis.md` | Core finding: "free value → audience → product" sequence | Strategic context |
| `2026-02-25-linkedin-growth-research.md` | LinkedIn growth for builder persona | LinkedIn content strategy |
| `2026-02-23-x-growth-research.md` | X growth for zero-audience accounts | X content strategy |
| `2026-02-26-competitive-landscape-ai-memory.md` | AI memory market positioning | Competitive context |
| `2026-02-26-naming-and-niche-research.md` | "Compound Context" term, niche positioning | Brand/content strategy |
| `2026-02-25-six-questions-research.md` | Strategic decisions with verdicts | Content marketing choices |

---

## Part 7: Known Conflicts to Resolve

| Conflict | Options | Recommendation |
|---|---|---|
| Primary domain | `offmind.ai` vs `getoffmind.com` | `getoffmind.com` — already used for legal/transactional. `offmind.ai` can redirect. |
| LinkedIn OffMind mention | `CLAUDE.md` says never, execution plan says yes | Follow `CLAUDE.md`: never mention by name. LinkedIn is authority channel, not sales channel. |
| Free trial during founding phase | Signup says "14-day trial", landing says "pay once" | Remove trial language during founding phase. Founding members get immediate full access. |
| Post-founding pricing | FAQ says "$9/month", client.ts says "$9/mo" | Consistent. Keep $9/mo as post-founding price in FAQ and code. Just hide subscription UI during founding phase. |
| CLAUDE.md project file | Still says "$9/month" as business model | Update to reflect founding member phase. |

---

## Appendix: Document Map (Post-Consolidation)

### Active Documents (in `offmind/docs/`)

| Document | Purpose | Updated |
|---|---|---|
| **LAUNCH-PLAYBOOK.md** | Commercial model + 30-day launch sequence (THIS FILE) | 2026-03-07 |
| PRODUCT-SPEC.md | Master dev spec, 64 items, 5 impact tiers | 2026-03-07 |
| ARCHITECTURE.md | Tech stack, data model, API reference | 2026-03-07 |
| PREMIUM-PRODUCT-AUDIT.md | 27 product gaps + 11-category competitive analysis | 2026-03-07 |
| INDEX.md | Document catalog | 2026-03-07 |
| 01-DESIGN-SYSTEM.md | Visual design tokens, colors, typography | 2026-02-21 |
| 02-SCREEN-SPECS.md | Layout specs, sidebar, header, components | 2026-02-09 |
| 03-IMPLEMENTATION-PLAN.md | Phase 1-2 design system implementation | 2026-02-09 |
| ITEM-EVOLUTION-ROADMAP.md | Post-launch vision: items that grow | 2026-02-10 |

### Archived Documents (in `offmind/docs/archive/`)

| Document | Why Archived |
|---|---|
| SPRINT-PLAN-2026-03-06.md | Superseded by PRODUCT-SPEC v2 + LAUNCH-PLAYBOOK |

### Vault Research (in `~/.vault/pipeline/outputs/`)

12 active research files. See Part 6 for the full list. These are reference material, not operational documents.

### Vault Archived (in `~/.vault/pipeline/archive/`)

| Folder | Contents |
|---|---|
| `neuraldesk-marketing/` | 9 NeuralDesk-specific marketing files |
| `superseded/` | Sprint plan vault mirror, marketing execution plan (good thesis, wrong sequencing) |

---

*This playbook is the single source of truth for OffMind's commercial launch. All other marketing/launch documents are either archived or research references. When in doubt, this document wins.*
