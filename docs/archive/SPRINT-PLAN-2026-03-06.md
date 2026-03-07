# OffMind Launch Sprint — March 7-8 (Weekend) + Week 1

**Goal:** Payment-ready Saturday night. First sales by Monday.
**Updated:** 2026-03-06

---

## Three Parallel Streams

```
STREAM A: Product Engineering     STREAM B: Launch Infrastructure     STREAM C: Marketing & Content
(Claude leads, Paulo reviews)     (Split: Claude + Paulo)             (Claude drafts, Paulo posts)
─────────────────────────────     ─────────────────────────────────   ─────────────────────────────
A1. Fix build blocker             B1. Create Stripe prices            C1. Rewrite landing page copy
A2. Migrate CSS to Zinc           B2. Email list setup (Kit)          C2. Write X thread
A3. Unify accent (drop terra)     B3. Product Hunt Upcoming page      C3. Write Reddit posts (3)
A4. Rewrite pricing section       B4. Privacy policy page             C4. Write Show HN post
A5. Rewrite hero section          B5. Terms of service page           C5. Write LinkedIn post
A6. Add builder credibility       B6. Create OG image + favicon       C6. Record 30s demo video
A7. Restructure landing sections  B7. Set up PostHog analytics        C7. Write email sequence (3)
A8. Deploy + test checkout        B8. Directory submissions           C8. Write YouTube Short scripts
        │                                   │                                    │
        ▼                                   ▼                                    ▼
   DEPLOY GATE                        INFRA GATE                          CONTENT GATE
  (Must pass before                 (Must pass before                   (Must pass before
   anything goes live)               marketing starts)                   posting anything)
```

---

## Dependency Map

```
A1 (Fix Resend) ──────────────► A8 (Deploy) ──► LIVE
                                    ▲
A2 (Zinc CSS) ─────────────────────┘
A3 (Drop terracotta) ──────────────┘
A4 (Pricing section) ──────────────┘
A5 (Hero rewrite) ─────────────────┘
A6 (Builder section) ──────────────┘
A7 (Section reorder) ──────────────┘

B1 (Stripe prices) ───► A4 (needs price IDs for checkout links)
B4 (Privacy) ──────────► A8 (required for Stripe/legal)
B5 (Terms) ────────────► A8 (required for Stripe/legal)

C1-C7 can be written in parallel with A/B streams
C content goes LIVE only after A8 (deploy) passes
```

**Translation:** Claude can work on A2-A7 and C1-C7 simultaneously while Paulo does B1-B3. The bottleneck is A1 (build fix) → A8 (deploy).

---

## Saturday March 7 — Sprint Day 1

### Morning Block (8:00 - 12:00 BRT)

| Time | Stream | Task | Who | Duration | Notes |
|------|--------|------|-----|----------|-------|
| 08:00 | A | **A1. Fix Resend API guard** | Claude | 15 min | Guard `new Resend()` with env check. Unblocks deploy. |
| 08:15 | A | **A2. Migrate CSS to Zinc palette** | Claude | 90 min | Swap 11 CSS variables in globals.css. Test all pages. |
| 08:15 | B | **B1. Create Stripe prices** | Paulo | 30 min | Stripe Dashboard → 3 one-time prices: $49, $79, $149. Copy price IDs. |
| 08:45 | B | **B2. Set up Kit email list** | Paulo | 30 min | kit.com → free account → create form → get embed code. |
| 09:00 | B | **B3. Product Hunt Upcoming** | Paulo | 30 min | producthunt.com → create upcoming page → add screenshots. |
| 09:45 | A | **A3. Unify accent system** | Claude | 45 min | Remove terracotta tokens. CTA → teal or white. |
| 10:30 | A+C | **A5. Rewrite hero section** | Claude | 60 min | New badge, headline, subtitle, CTAs per marketing plan. |
| 11:30 | A+C | **A4. Rewrite pricing section** | Claude | 90 min | 3 founding member tiers with Stripe checkout links. |

### Afternoon Block (13:00 - 18:00 BRT)

| Time | Stream | Task | Who | Duration | Notes |
|------|--------|------|-----|----------|-------|
| 13:00 | A | **A6. Add builder credibility section** | Claude | 45 min | "Built by Paulo Pereira" section below how-it-works. |
| 13:45 | A | **A7. Restructure landing sections** | Claude | 60 min | Reorder per design research. Remove unsourced stats. |
| 13:00 | C | **C1. Full copy pass** | Claude | 120 min | Every section rewritten (parallel with A6/A7). |
| 15:00 | B | **B4. Privacy policy page** | Claude | 45 min | Generate + add as /privacy route. |
| 15:45 | B | **B5. Terms of service page** | Claude | 45 min | Generate + add as /terms route. |
| 16:30 | C | **C2. Write X thread** | Claude | 30 min | "What 6 months of building taught me" thread. |
| 17:00 | C | **C3. Write Reddit posts** | Claude | 60 min | r/productivity, r/ClaudeAI, r/Notion — all 3 drafts. |
| 18:00 | C | **C7. Write email sequence** | Claude | 45 min | 3 emails configured in Kit. |

### Evening Block (19:00 - 22:00 BRT)

| Time | Stream | Task | Who | Duration | Notes |
|------|--------|------|-----|----------|-------|
| 19:00 | A | **A8. Deploy to Vercel** | Claude | 30 min | `vercel deploy --prod`. Verify getoffmind.com. |
| 19:30 | B | **Test checkout flow** | Paulo | 30 min | Buy each tier in test mode. Verify webhook creates account. |
| 20:00 | B | **Embed Kit form on landing** | Claude | 15 min | Replace waitlist form with Kit email capture. |
| 20:15 | B | **B7. Configure PostHog** | Claude | 30 min | Already in deps. Add tracking to key events. |
| 20:45 | C | **C4. Write Show HN post** | Claude | 15 min | Draft ready for Tuesday posting. |
| 21:00 | — | **Go/No-Go review** | Both | 30 min | Checklist: site live? checkout works? email captures? |
| 21:30 | C | Post X thread (bridge post) | Paulo | 15 min | First public content about OffMind. |

---

## Sunday March 8 — Sprint Day 2

### Morning (08:00 - 12:00)

| Task | Who | Duration | Notes |
|------|-----|----------|-------|
| Fix any Saturday bugs/issues | Claude | 60 min | Based on Go/No-Go review |
| **B6. Create OG image + favicon** | Claude | 60 min | SVG generation for social sharing |
| **C6. Record 30-second demo video** | Paulo | 45 min | Screen record: capture → AI route → Today view |
| **C5. Write LinkedIn post** | Claude | 20 min | Professional credibility angle |
| **C8. YouTube Short scripts (3)** | Claude | 30 min | Quick product demo scripts |
| Embed demo video on landing page | Claude | 30 min | Below hero, autoplay muted |

### Afternoon (13:00 - 18:00)

| Task | Who | Duration | Notes |
|------|-----|----------|-------|
| Final landing page polish + review | Both | 90 min | Paulo reviews, Claude adjusts |
| **Final deploy** | Claude | 15 min | Production deploy with all changes |
| Test everything end-to-end | Paulo | 60 min | Full user flow: land → browse → buy → account created |
| Post X thread if not posted Saturday | Paulo | 15 min | Evening post (20:00-21:00 BRT) |
| Post on r/SideProject | Paulo | 10 min | Using Claude's draft |

### End of Sunday Checklist

- [ ] getoffmind.com live and loading
- [ ] 3 Stripe tiers working (test purchase verified)
- [ ] Kit email form capturing subscribers
- [ ] Privacy policy + Terms live
- [ ] Hero copy rewritten
- [ ] CSS migrated to Zinc
- [ ] Builder credibility section added
- [ ] OG image + favicon set
- [ ] Product Hunt Upcoming page live
- [ ] X thread posted
- [ ] Reddit post draft ready for Monday
- [ ] Show HN draft ready for Tuesday
- [ ] Email sequence configured in Kit
- [ ] Demo video recorded

---

## Week 1 Calendar (Mon-Fri, March 9-13)

| Date | Morning | Afternoon | Evening |
|------|---------|-----------|---------|
| **Mon 9** | Post demo video on X (13:00) | Post r/SideProject | Monitor engagement, reply to comments |
| **Tue 10** | LinkedIn post (08:00) | Show HN post (10:00 EST = 12:00 BRT) | Reply to ALL HN comments |
| **Wed 11** | Post r/ClaudeAI (10:00) | X post: founding member update | Reply to Reddit comments |
| **Thu 12** | Post r/productivity (10:00) | X builder insight post (20:00) | Check metrics, adjust |
| **Fri 13** | Post r/Notion (10:00) | **Week 1 retrospective** | Send Email 3 (urgency) to list |

---

## How We Work Together (The Flow)

### Claude's Role (this session + future sessions):
1. **Code changes** — I write all code (CSS, JSX, API routes, legal pages)
2. **Content drafts** — I write all posts, threads, emails (you review + post manually)
3. **Design implementation** — I execute the design research recommendations
4. **Analysis** — I track metrics and suggest adjustments

### Paulo's Role:
1. **Stripe setup** — You create prices in Stripe Dashboard (I can't access it)
2. **Kit setup** — You create the account (I can't do signups)
3. **Product Hunt** — You create the page (needs your PH account)
4. **Posting** — You post all content manually (non-negotiable rule)
5. **Demo video** — You record the screen (I can't access the running app)
6. **Checkout testing** — You verify the payment flow works
7. **Review** — You approve every landing page change before deploy

### Session Structure:
```
This Session (now):
  → Approve the plan
  → Start Stream A (engineering) immediately
  → I work on A1, A2, A3 while you set up B1, B2, B3

Next Session (Saturday morning if context runs out):
  → /continue offmind-dev
  → Pick up where we left off
  → Stream A continues, Stream C starts

During the week:
  → Quick sessions for posting content (I draft, you post)
  → Daily metrics check (5 min session)
```

---

## Decision: How to Start RIGHT NOW

**Option 1: Start Engineering (Stream A)**
I begin coding: fix Resend → migrate CSS → rewrite hero. You set up Stripe + Kit + PH in parallel.
*Best if: you have time tonight and want to maximize Saturday.*

**Option 2: Start Saturday Fresh**
We save everything, you review the 4 research docs + this plan overnight. We execute Saturday 08:00 sharp.
*Best if: it's late and you want to absorb the strategy first.*

**Option 3: Start Content First (Stream C)**
I draft all content now (threads, Reddit posts, emails). Engineering waits for Saturday.
*Best if: you want to review content drafts tonight and start with polished copy tomorrow.*
