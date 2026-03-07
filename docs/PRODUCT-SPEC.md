# OffMind — Product Development Spec v2

**Created:** 2026-03-06 (v1) | **Updated:** 2026-03-07 (v2)
**Source:** Paulo's usage notes + architecture review + premium product audit + competitive deep research
**Status:** Active
**Branch:** main

---

## How to Use This Document

This is the single source of truth for all OffMind development. Every work item has an ID (OM-XXX), impact tier, effort estimate, owner, and status.

**Impact Tiers (highest first):**

| Tier | Name | Meaning |
|---|---|---|
| **T1** | Launch Gate | Cannot launch without this. Legal, build, payment blockers. |
| **T2** | Premium Baseline | Without this, product doesn't justify $79+. UX bugs, polish, accessibility. |
| **T3** | Retention & Habits | Without this, users churn after month 1. Rituals, analytics, notifications. |
| **T4** | Differentiation | What makes OffMind unique vs. competitors. Thinking layer, AI reflection. |
| **T5** | Scale & Ecosystem | Post-product-market-fit. API, integrations, platform expansion. |

**Status codes:** `Done` | `In Progress` | `Not Started` | `Blocked` | `Deferred`
**Owners:** `Claude` | `Paulo` | `Both`
**Commit references:** Use `OM-XXX` in commit messages.

---

## T1 — Launch Gate

*Without these items resolved, OffMind cannot go live with payments.*

### OM-001: Fix Module-Scope Build Errors
**Type:** Bug | **Owner:** Claude | **Effort:** 45 min
**Status:** Done ✓

Created shared `getSupabaseAdmin()` singleton in `lib/supabase/admin.ts`, converted `lib/email/resend.ts` to lazy `getResend()`, all routes use handler-scope initialization. `next build` passes cleanly.

### OM-002: Privacy Policy Page
**Type:** Legal | **Owner:** Claude | **Effort:** 45 min
**Status:** Done ✓

14-section policy with LGPD/GDPR coverage at `/privacy`.

### OM-003: Terms of Service Page
**Type:** Legal | **Owner:** Claude | **Effort:** 45 min
**Status:** Done ✓

14-section ToS at `/terms`.

### OM-004: Stripe Founding Member Checkout Integration
**Type:** Feature | **Owner:** Paulo | **Effort:** 2-3 hours
**Status:** Done ✓

Stripe prices created (Starter $49, Builder $79, Believer $149). All one-time payment mode. Checkout, webhook, and portal routes wired. Price IDs in `.env`. Pricing card CTAs connected.

### OM-005: Landing Page Complete Revamp
**Type:** Design + Code | **Owner:** Claude | **Effort:** 8-12 hours
**Status:** Done ✓

Complete rewrite using "Precision Void" design. Zinc-950 + teal accents. 3-tier founding member pricing. Builder credibility section. OG image + Twitter card auto-generation.

### OM-006: Deploy to Vercel (Production)
**Type:** Infrastructure | **Owner:** Both | **Effort:** 30 min
**Depends on:** OM-004
**Status:** Done ✓

Deployed to Vercel. Domain getoffmind.com verified with DNS/SSL. All 8 env vars configured.

### OM-040: Landing Page Social Proof
**Type:** Conversion | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

Zero social proof on landing page. For $49-$149 lifetime, this is the #1 conversion killer.
- Add dynamic waitlist count (`/api/waitlist/count` endpoint exists)
- Add "Join X overthinkers" counter near hero
- Add 2-3 testimonials section (beta testers or early users)
- Add credibility indicators (tech logos strip exists, enhance)

### OM-041: Custom 404 Pages
**Type:** Polish | **Owner:** Claude | **Effort:** 30 min
**Status:** Not Started

No custom 404. Bad URLs get default Next.js page. Add branded `app/not-found.tsx` and `app/(dashboard)/not-found.tsx` with navigation back to app.

### OM-042: Error Boundary on Landing Page
**Type:** Resilience | **Owner:** Claude | **Effort:** 15 min
**Status:** Not Started

Landing page is `'use client'` with no error boundary. If FAQ animation or pricing crashes, entire page goes white. Wrap with `ErrorBoundary` component (already exists in `components/shared/`).

---

## T1 Infrastructure Checklist

These are Paulo-led items required before going live:

| ID | Item | Owner | Status |
|---|---|---|---|
| INF-001 | Create 3 Stripe Prices in Dashboard | Paulo | Done ✓ |
| INF-002 | Add Price IDs to .env vars | Paulo | Done ✓ |
| INF-003 | Wire pricing buttons to checkout API | Claude | Done ✓ |
| INF-004 | Update lib/stripe/client.ts with founding tiers | Claude | Done ✓ |
| INF-005 | Vercel project setup & deploy | Both | Done ✓ |
| INF-006 | Verify getoffmind.com DNS/SSL | Paulo | Done ✓ |
| INF-007 | PostHog project creation + key | Paulo | Done ✓ |
| INF-008 | Sentry project creation + DSN | Paulo | Done ✓ |
| INF-009 | Test checkout flow end-to-end | Both | Done ✓ |
| INF-010 | Verify all routes in production | Both | Done ✓ |
| INF-011 | Wire pricing card CTAs to actual checkout | Claude | Done ✓ |
| INF-012 | Remove "14-day free trial" from signup page | Claude | Done ✓ |
| INF-013 | Unify domain to getoffmind.com everywhere | Claude | Done ✓ |
| INF-014 | Update Stripe webhook for new tier names | Claude | Done ✓ |
| INF-015 | Instrument PostHog CTA/signup/checkout/purchase events | Claude | Done ✓ |

---

## T2 — Premium Baseline

*Without these, the product doesn't justify $79+. UX bugs, polish, accessibility.*

### UX Bugs (from Paulo's usage notes)

#### OM-010: Backlog View — Real-time Refresh Bug
**Type:** Bug | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

Items edited in backlog don't refresh. Delete in detail screen → card still visible. Prioritize item → board view shows it in wrong column until page refresh. Root cause: missing Zustand store or React Query cache invalidation after mutations.

#### OM-011: Save & Route Button UX Confusion
**Type:** UX Redesign | **Owner:** Claude | **Effort:** 3-4 hours
**Status:** Not Started

- **Inbox processing:** Keep "Save and Route" (first-time routing)
- **Routed item edit:** Change to "Save" only (no re-routing)
- **Re-route action (top bar):** Add confirmation dialog + warning about form changes

#### OM-012: Dropdown Readability Issues
**Type:** Bug (UI) | **Owner:** Claude | **Effort:** 1-2 hours
**Status:** Not Started

Property pill dropdowns have contrast/readability issues. Check contrast ratios, font sizes, padding.

#### OM-013: Duplicate Effort Fields
**Type:** Bug | **Owner:** Claude | **Effort:** 1 hour
**Status:** Not Started

Two effort fields exist. Investigate, determine canonical, remove duplicate.

#### OM-014: Standard Sorting for Screens
**Type:** UX | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

Define and implement per-screen defaults: Inbox (newest first), Backlog (priority → due date → created), Board (priority within columns), Schedule (chronological), Today (drag order).

### Analytics & Monitoring

#### OM-016: PostHog Analytics Configuration
**Type:** Infrastructure | **Owner:** Claude | **Effort:** 1-2 hours
**Depends on:** INF-007 (Paulo creates PostHog project)
**Status:** Done ✓

PostHog configured. Project key in env. Provider initialized. Event tracking functions in `lib/analytics/events.ts` (cta_clicked, signup, checkout_started, purchase_completed + auto pageviews).

#### OM-017: Sentry Error Monitoring Configuration
**Type:** Infrastructure | **Owner:** Claude | **Effort:** 1 hour
**Depends on:** INF-008 (Paulo creates Sentry project)
**Status:** Done ✓

Sentry configured at offmind.sentry.io. DSN in env. Source maps uploading. `global-error.tsx` captures exceptions.

### Undo & Safety

#### OM-043: Undo on Destructive Actions
**Type:** UX | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

Archive/delete show toast but no undo. `useUndoableAction` hook exists but isn't wired to archive/delete. Wire it in. Toast: "Item archived. [Undo]" for 8 seconds.

#### OM-044: Account Delete Confirmation
**Type:** Safety | **Owner:** Claude | **Effort:** 1 hour
**Status:** Not Started

Settings has `/api/account/delete` with no "type DELETE to confirm" pattern. Add confirmation dialog with text input. Critical for a paid product.

### Accessibility (WCAG 2.1 AA)

#### OM-045: Skip Navigation Link
**Type:** Accessibility | **Owner:** Claude | **Effort:** 30 min
**Status:** Not Started

No "Skip to main content" link. Every page forces tabbing through sidebar. Add visually-hidden skip link as first focusable element.

#### OM-046: Respect `prefers-reduced-motion`
**Type:** Accessibility | **Owner:** Claude | **Effort:** 1-2 hours
**Status:** Not Started

Framer Motion animations everywhere, zero `prefers-reduced-motion` support. Add media query to `globals.css`. Use Framer Motion `useReducedMotion()` in key components.

#### OM-047: `aria-live` Regions for Dynamic Updates
**Type:** Accessibility | **Owner:** Claude | **Effort:** 1-2 hours
**Status:** Not Started

Realtime item changes (add/remove via Supabase) aren't announced to screen readers. Add `aria-live="polite"` regions on item lists.

### Polish & Settings

#### OM-048: Keyboard Shortcut Help Modal
**Type:** UX | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

Cmd+K, Cmd+N, Cmd+0/1/2/3 exist but are invisible. No discovery mechanism. Add `?` shortcut that opens help modal listing all shortcuts. Premium pattern: Linear, Notion, Superhuman all have this.

#### OM-049: Data Export in Settings UI
**Type:** Trust + GDPR | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

`/api/export` endpoint exists but not exposed in UI. Add "Export Data" section to Settings with JSON and CSV options. Required for GDPR compliance and user trust at $149 price point.

#### OM-050: Theme Toggle in Settings UI
**Type:** Feature | **Owner:** Claude | **Effort:** 1-2 hours
**Status:** Not Started

`stores/ui.ts` has `theme` state and `toggleTheme()`. Design system has light mode tokens in `01-DESIGN-SYSTEM.md`. No UI toggle exists. Add to Settings page.

#### OM-051: Global Search in Command Palette
**Type:** Feature | **Owner:** Claude | **Effort:** 3-4 hours
**Status:** Not Started

Command palette navigates between pages and creates items but doesn't search across items, pages, and projects by content. A user with 200+ items needs to find things fast. Add search query capability to `CommandPalette.tsx`.

#### OM-052: Favicon & PWA Icons
**Type:** Polish | **Owner:** Claude | **Effort:** 1 hour
**Status:** Not Started

No complete favicon set (favicon.ico, apple-touch-icon, manifest.json). OG image generator exists but tab favicon is incomplete. Create proper icon set from OffMind logo.

#### OM-053: Breadcrumbs in Dashboard
**Type:** UX | **Owner:** Claude | **Effort:** 1-2 hours
**Status:** Not Started

No breadcrumb trail in `/spaces/[id]`, `/projects/[id]`, `/pages/[id]`. Users navigating nested content lose spatial context. Add to Header component.

---

## T3 — Retention & Habits

*Without these, users churn after month 1. These are the behavior systems that create daily usage habits.*

### Rituals System

#### OM-060: Morning Planning Ritual
**Type:** Feature (strategic) | **Owner:** Claude | **Effort:** 8-12 hours
**Status:** Not Started

**Research basis:** Sunsama ($20/mo) — morning planning ritual saves users 1-2 hours/day from eliminated decision fatigue. Sunsama's entire value proposition.

OffMind's `/today` page is passive (shows committed items). Should become active (guides daily planning). Guided 5-min flow on first daily open:

1. "Here's what rolled over from yesterday" (auto-detected uncommitted items)
2. "Here are your calendar events today" (Google Cal integration exists)
3. "Pick what you'll commit to today" (drag from backlog → today)
4. "How many hours of deep work do you want?" (daily intention)
5. "You're set. Focus on these." (locked Today view)

User should be able to skip ritual and go straight to Today if desired.

#### OM-061: Evening Shutdown Ritual
**Type:** Feature (strategic) | **Owner:** Claude | **Effort:** 6-8 hours
**Status:** Not Started

**Research basis:** Sunsama's shutdown ritual provides psychological closure. End-of-day review captures accomplishments, surfaces improvement opportunities.

Triggered by user action or time-of-day notification:

1. "Here's what you completed today" (celebration, confetti component exists)
2. "These items didn't get done. Move to tomorrow or back to backlog?" (quick triage)
3. "Quick reflection: How was your focus today?" (1-5 scale + optional text)
4. "You're done for today. Close your laptop." (Done screen)

Data feeds into Personal Analytics (OM-063).

### Personal Analytics

#### OM-062: Capture & Processing Analytics
**Type:** Feature | **Owner:** Claude | **Effort:** 6-8 hours
**Status:** Not Started

**Research basis:** Todoist Karma (users screenshot and share their streaks). RescueTime daily reports. Users love seeing their own data.

New page: `/insights` with:
- **Capture velocity**: Items captured per day/week (trend line chart)
- **Processing ratio**: Inbox items in vs. processed out (keeping up?)
- **Category distribution**: Where items go (pie chart: backlog, reference, someday, scheduled)
- **AI usage**: "AI processed 12 items for you this week"

Data source: Query Supabase directly. No additional tracking needed — timestamps and destination changes already tracked.

#### OM-063: Productivity & Focus Analytics
**Type:** Feature | **Owner:** Claude | **Effort:** 6-8 hours
**Depends on:** OM-060, OM-061 (ritual data)
**Status:** Not Started

- **Completion rate**: Committed items completed vs. rolled over (weekly)
- **Focus score**: % of committed items done on scheduled day
- **Stale item alerts**: "23 items in backlog 30+ days"
- **Weekly trends**: "Captured 40% more than last week"
- **Streak tracking**: Daily usage, weekly review, inbox zero streaks
- **Reflection history**: From shutdown ritual data (OM-061)

Visual: GitHub contribution graph for daily engagement. Charts via Recharts (not currently installed, lightweight alternative possible).

### Habits & Recurrence

#### OM-064: Recurring Items
**Type:** Feature | **Owner:** Claude | **Effort:** 6-8 hours
**Status:** Not Started

**Research basis:** 40-50% of productivity app usage is recurring tasks. Without recurrence, users need a separate tool for habits.

Schema changes: Add `recurrence_rule` field to items table (iCal RRULE format: `FREQ=DAILY`, `FREQ=WEEKLY;BYDAY=MO,WE,FR`, etc.). On completion, auto-create next occurrence.

UI: Recurrence picker on item detail. Show recurring icon on item cards. Today view shows recurring items due today.

#### OM-065: Habit Tracker (Lightweight)
**Type:** Feature | **Owner:** Claude | **Effort:** 4-6 hours
**Depends on:** OM-064 (recurrence infrastructure)
**Status:** Not Started

Separate from tasks. A habit is a daily/weekly thing you track:
- "Read 30 min" — daily. Check off. See streak.
- "Exercise" — 3x/week. Track completion.
- Visual streak calendar (GitHub contribution graph style)
- Weekly review streak already exists. Should be part of habit system.

### Notifications & Reminders

#### OM-066: Contextual Reminders
**Type:** Feature | **Owner:** Claude | **Effort:** 4-6 hours
**Status:** Not Started

"Remind me about this at 3pm" or "Remind me tomorrow morning." Delivery via:
- Browser push notification (Notification API)
- Email (Resend configured, extend templates)
- Telegram (bot already exists)

Schema: Add `reminder_at` field to items. Background job or Supabase edge function for trigger.

#### OM-067: Daily Digest Email
**Type:** Feature | **Owner:** Claude | **Effort:** 3-4 hours
**Depends on:** Resend (already configured)
**Status:** Not Started

Morning email: "Good morning, Paulo. 5 items committed + 2 meetings today." One-click link to OffMind. Configurable in Settings (on/off, preferred time).

Template in `lib/email/templates.ts` (file exists, extend with digest template).

#### OM-068: Stale Item & Inbox Nudges
**Type:** Feature | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

- Weekly stale item email: "12 items in backlog 30+ days. Review?"
- Inbox overflow alert: "25 unprocessed items. Take 5 minutes to triage?"
- AI endpoint `/api/ai/stale-items` already exists. Make it proactive.

### Templates

#### OM-069: Item & Page Templates
**Type:** Feature | **Owner:** Claude | **Effort:** 4-6 hours
**Status:** Not Started

**Research basis:** Templates reduce time-to-value. New users with templates activate 50% faster.

Item templates:
- "Meeting Notes" (Attendees, Decisions, Action Items sections)
- "Project Kickoff" (Goals, Milestones, Risks)
- "Decision" (Options, Pros/Cons, Decision)

Page templates:
- "Weekly Review Summary"
- "Project Brief"
- "Knowledge Base Entry"

Implementation: Template registry (JSON). Template picker in create flow. Pre-fill content.

#### OM-070: Space Templates (Onboarding Accelerator)
**Type:** Feature | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

Show during onboarding: "Pick your life areas":
- "Work" with suggested destinations: Projects, Meetings, Follow-ups
- "Personal" with: Goals, Errands, Someday/Maybe
- "Health" with: Exercise, Meals, Appointments
- "Learning" with: Courses, Books, Notes
- "Finance" with: Bills, Investments, Goals

### Onboarding & Activation

#### OM-071: Progressive Onboarding Milestones
**Type:** Feature | **Owner:** Claude | **Effort:** 4-6 hours
**Status:** Not Started

**Research basis:** Users not activated within 72 hours = 90% churn. Progressive milestones extend activation window.

Beyond the existing 5-step wizard:
- Day 1: Capture 5 items (badge: "Brain Dump Champion")
- Day 3: Process inbox to zero (badge: "Inbox Zero")
- Week 1: Complete first weekly review (badge: "Reflector")
- Week 2: Use AI on 10 items (badge: "AI Partner")
- Month 1: 30-day usage streak (badge: "Compound Thinker")

Show progress in sidebar or settings. Subtle, not gamified to the point of annoyance.

#### OM-072: Define & Track Aha Moment
**Type:** Analytics | **Owner:** Both | **Effort:** 2-3 hours
**Status:** Not Started

Define OffMind's activation event: "User captures 5+ items AND processes 3+ to destinations within first 48 hours."

Track in PostHog. Create funnel: Signup → First Capture → 5 Captures → 3 Processed → Activated. Target: 60%+ activation within 72 hours.

### Organize Page Redesign

#### OM-015: Organize Page Rethink
**Type:** UX Redesign | **Owner:** Claude | **Effort:** 4-6 hours
**Status:** Not Started

Paulo's vision: "A person who thinks a lot captures many things and might have 10+ destinations. If all of them are not visible at a glance, the chance the user forgets them is high."

Redesign as dashboard-like overview: all destinations with item counts, oldest item age, AI-suggested actions. AI reminders for neglected items. Encourage users to keep items alive.

### Offline & Error Recovery

#### OM-073: Offline / Network Error Handling
**Type:** Resilience | **Owner:** Claude | **Effort:** 4-6 hours
**Status:** Not Started

Lost internet = captures fail silently. No offline indicator. Add:
- Connection status indicator in header
- Queue captures locally (localStorage) when offline
- "You're offline. Changes sync when you reconnect." banner
- Auto-retry queued operations on reconnection

### Bulk Operations

#### OM-024: Bulk Select in Inbox
**Type:** Feature | **Owner:** Claude | **Effort:** 3-4 hours
**Status:** Not Started

Checkbox selection on inbox items. Toolbar with bulk actions: Route All, Archive All, Tag All, Delete All. BulkAIActions.tsx exists for AI operations — extend pattern to basic ops.

---

## T4 — Differentiation

*What makes OffMind unique vs. Todoist, Notion, Sunsama. The thinking layer + AI reflection.*

### Time Awareness

#### OM-074: Estimated Duration on Items
**Type:** Feature | **Owner:** Claude | **Effort:** 3-4 hours
**Status:** Not Started

**Research basis:** Akiflow, Sunsama, Reclaim all have time estimation. #1 overwhelm cause: committing to 12 hours in an 8-hour day.

Optional field on items: "How long?" (15m, 30m, 1h, 2h, half-day). Today view shows total: "4.5 hours planned." Overcommit warning: "8h of work + 3h meetings. Consider moving 2 items."

#### OM-075: Calendar Time Blocking
**Type:** Feature | **Owner:** Claude | **Effort:** 8-12 hours
**Depends on:** OM-074, Google Calendar write access
**Status:** Not Started

Drag item from Today to Calendar = create time block. Two-way sync: calendar event moves → item schedule updates. Google Calendar integration exists (read-only). Extend to write.

#### OM-076: Focus Timer
**Type:** Feature | **Owner:** Claude | **Effort:** 4-6 hours
**Status:** Not Started

Built-in timer: "Start working on [item]." Optional Pomodoro (25/5). Tracks actual vs. estimated time. Data feeds into Insights: "Estimated 30 min, took 1h 15m."

### Knowledge Connection

#### OM-077: Automatic Backlinks
**Type:** Feature | **Owner:** Claude | **Effort:** 6-8 hours
**Status:** Not Started

**Research basis:** Capacities, Obsidian, Roam — backlinks make knowledge graph. Differentiator between task manager and thinking tool.

When a page references an item or another page, create bidirectional link. Show "Referenced by" section on every page. Items already have `LinkedPageSection` and `ItemRelationsSection` — extend with automatic backlink detection.

#### OM-078: Daily Notes
**Type:** Feature | **Owner:** Claude | **Effort:** 4-6 hours
**Depends on:** Pages system (exists)
**Status:** Not Started

Auto-created page for each day. Quick capture can go here (or inbox, user's choice). Links to items completed that day (auto-generated). Becomes journal / running log. Navigation: calendar widget in sidebar for date selection.

### Voice & Multimodal

#### OM-079: Voice-to-Item with AI
**Type:** Feature | **Owner:** Claude | **Effort:** 6-8 hours
**Status:** Not Started

**Research basis:** Tana launched voice-to-item as killer feature. OffMind has `useAudioRecorder.ts` hook but no intelligence layer.

Press mic → speak → AI transcribes (Whisper API or browser SpeechRecognition) → extract items + dates + context. "Buy groceries tomorrow, schedule dentist Friday" → 2 items with dates. Anthropic API already configured.

#### OM-080: Natural Language Quick Add
**Type:** Feature | **Owner:** Claude | **Effort:** 3-4 hours
**Status:** Not Started

Capture bar: "Buy groceries tomorrow at 5pm" → auto-parse into item + scheduled_at. AI endpoint `/api/ai/extract-date` exists as separate call. Integrate inline into capture flow. Parse on submit, show preview before saving.

### AI Reflection (The Core Differentiator)

#### OM-023: AI Confidence Routing
**Type:** Architecture | **Owner:** Claude | **Effort:** 6-8 hours
**Status:** Not Started

Marketing says "AI routes your thoughts." Currently: AI suggests, user confirms. Gap: confidence threshold.

- High confidence (>90%): Auto-route with "AI routed this — undo?" notification
- Medium (60-90%): Show suggestion, user confirms
- Low (<60%): Manual processing

#### OM-081: AI Self-Knowledge Insights
**Type:** Feature (strategic) | **Owner:** Claude | **Effort:** 6-8 hours
**Depends on:** OM-062, OM-063 (analytics data)
**Status:** Not Started

AI that reflects on user behavior (not just processes items):
- "You committed to 8 items but completed 3 this week. You're overcommitting."
- "Most productive day: Wednesday. Worst: Monday."
- "15 backlog items mention 'data platform'. Consider creating a project."
- "You haven't reviewed your Someday/Maybe in 3 weeks."

This is what transforms OffMind from task pipeline to thinking partner. Uses existing AI infrastructure + analytics data.

### Embedded Integration

#### OM-025: Embedded Integration Vision
**Type:** Strategy | **Owner:** Both | **Effort:** varies
**Status:** Strategy defined — needs individual scoping

"OffMind is embedded with your life." Missing:
- Desktop global shortcut (Ctrl+Shift+Space → capture overlay)
- Chrome extension right-click capture
- Mobile PWA with share target (capture from any app's share menu)
- Telegram bot capture (exists, polish)
- Public API (see T5)

### Item Evolution

#### OM-031: Chained Items
**Type:** Feature | **Owner:** Claude | **Effort:** 6-8 hours
**Status:** Deferred

Items that generate others. "Ask Rajat about X → if yes → create follow-up task." Item dependency chain with conditional triggers.

#### OM-033: Day Planning Screen
**Type:** Feature | **Owner:** Claude | **Effort:** 4-6 hours
**Status:** Deferred (may merge with OM-060 Morning Ritual)

Today view "Plan" mode with drag-and-drop reordering of committed items. May become part of Morning Planning Ritual.

---

## T5 — Scale & Ecosystem

*Post-product-market-fit. Extend the platform.*

#### OM-082: Public REST API v1
**Type:** Platform | **Owner:** Claude | **Effort:** 12-16 hours
**Status:** Not Started

CRUD on items, pages, projects, spaces. Webhooks on item events (created, completed, moved). API key auth. Enables Zapier, Make, custom integrations.

#### OM-083: MCP Server for Claude
**Type:** Platform | **Owner:** Claude | **Effort:** 8-12 hours
**Status:** Not Started

OffMind as MCP tool for Claude Desktop/Code. "Add to OffMind inbox" from any Claude surface. "Show my today items." Unique differentiator no competitor can match — aligns with Compound OS architecture.

#### OM-084: Import from Other Tools
**Type:** Feature | **Owner:** Claude | **Effort:** 6-8 hours per source
**Status:** Not Started

Reduce switching barrier TO OffMind:
- Todoist (API import)
- Notion (CSV/Markdown)
- Apple Reminders (CSV)
- Generic CSV import

#### OM-030: Capture-to-Destination Direct Routing
**Type:** Feature | **Owner:** Claude | **Effort:** 3-4 hours
**Status:** Deferred

Optional fields in capture to route directly to destination. "Maybe ask community about this as a new feature."

#### OM-032: Subpages
**Type:** Feature | **Owner:** Claude | **Effort:** 8-12 hours
**Status:** Deferred

Hierarchical page model. Parent-child relationships. Navigation breadcrumbs.

#### OM-085: Changelog / What's New
**Type:** Trust | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

In-app changelog showing product updates. Builds trust that product is maintained. Badge indicator on new updates.

#### OM-086: Content Security Policy (CSP)
**Type:** Security | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

No CSP headers configured. Security baseline for product handling user data + Stripe payments. Add via Next.js middleware or headers config.

#### OM-087: Print / PDF Views
**Type:** Feature | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

No `@media print` styles. Add print-friendly view for Today, project overview, weekly review summary.

#### OM-088: Touch Gestures (Mobile)
**Type:** UX | **Owner:** Claude | **Effort:** 4-6 hours
**Status:** Not Started

No swipe-to-archive, swipe-to-schedule on mobile. Table stakes for mobile productivity tools.

#### OM-089: Rate Limit Feedback on AI Features
**Type:** UX | **Owner:** Claude | **Effort:** 1-2 hours
**Status:** Not Started

Backend rate limits exist but UI shows no usage indicators. Show "X/Y AI suggestions used today" and graceful degradation when limits hit.

#### OM-020: Tags on Backlog Items
**Type:** Feature | **Owner:** Claude | **Effort:** 4-6 hours
**Status:** Not Started

Tag model in Supabase, tag CRUD, tag filter on backlog view, tag pills on cards.

#### OM-021: Quick Actions & Highlight Colors
**Type:** UX | **Owner:** Claude | **Effort:** 3-4 hours
**Status:** Not Started

Backlog cards: add quick action buttons (change priority, destination, archive, schedule). Priority-based color coding on card border.

#### OM-022: Default View Preferences
**Type:** Feature | **Owner:** Claude | **Effort:** 2-3 hours
**Status:** Not Started

User preference in Supabase profile for per-screen defaults (backlog: board vs list, schedule: agenda vs week).

---

## Marketing & Content Stream

*Single source of truth for all marketing items. See LAUNCH-PLAYBOOK.md for strategy context.*

### Foundation (Week 1-2)
| ID | Item | Owner | Status |
|---|---|---|---|
| MKT-001 | Growth research | Claude | Done ✓ |
| MKT-002 | Social media audit | Claude | Done ✓ |
| MKT-003 | Content pillars document | Claude | Not Started |
| MKT-004 | Kit email landing page | Paulo | Not Started |
| MKT-005 | Lead magnet: "Compound Thinking Starter Kit" | Both | Not Started |
| MKT-006 | Buffer free account | Paulo | Not Started |
| MKT-007 | Update X bio with getoffmind.com | Paulo | Not Started |
| MKT-008 | Update LinkedIn headline | Paulo | Not Started |

### Launch Day
| ID | Item | Owner | Status |
|---|---|---|---|
| LCH-001 | Landing page live with pricing | Claude | Done ✓ |
| LCH-002 | Privacy + Terms pages | Claude | Done ✓ |
| LCH-003 | Build passes cleanly | Claude | Done ✓ |
| LCH-004 | OG image + Twitter cards | Claude | Done ✓ |
| LCH-005 | Stripe checkout tested | Both | Not Started |
| LCH-006 | Production deploy verified | Both | Not Started |
| LCH-007 | Analytics tracking verified | Both | Not Started |
| LCH-008 | Error monitoring verified | Both | Not Started |

### 30-Day Launch Playbook

#### Days 1-3: Seal the Pipe
| ID | Item | Owner | Status |
|---|---|---|---|
| MKT-100 | Update X bio with getoffmind.com | Paulo | Not Started |
| MKT-101 | Update LinkedIn headline | Paulo | Not Started |
| MKT-102 | Set up Kit email landing page | Paulo | Not Started |
| MKT-103 | Define content pillars document | Claude | Not Started |

#### Days 4-14: Conversations Not Campaigns
| ID | Item | Owner | Status |
|---|---|---|---|
| MKT-110 | Reddit: 3-5 helpful comments/day (r/ClaudeAI, r/analytics) | Paulo | Not Started |
| MKT-111 | Reddit: Hit 50 karma | Paulo | Not Started |
| MKT-112 | X: First build-in-public thread | Paulo | Not Started |
| MKT-113 | X: 3-5 genuine replies/day on AI/productivity threads | Paulo | Not Started |
| MKT-114 | LinkedIn: First post (insight, not product) | Paulo | Not Started |
| MKT-115 | Email first warm contacts (personal, not blast) | Paulo | Not Started |
| MKT-116 | Monitor Sentry for production errors | Claude | Not Started |
| MKT-117 | Monitor PostHog for conversions | Both | Not Started |

#### Days 15-21: Double Down on What Works
| ID | Item | Owner | Status |
|---|---|---|---|
| MKT-120 | Review Day 14 metrics: which channel converts? | Both | Not Started |
| MKT-121 | Reddit: first original post if karma > 50 | Paulo | Not Started |
| MKT-122 | X: reach 50 followers | Paulo | Not Started |
| MKT-123 | LinkedIn: establish 2 posts/week cadence | Paulo | Not Started |
| MKT-124 | Collect first testimonial from paying user | Paulo | Not Started |
| MKT-125 | Fix production bugs from user feedback | Claude | Not Started |
| MKT-126 | Deploy first P1 bug fixes | Claude | Not Started |

#### Days 22-30: Scale Channels (Conditional)
| ID | Item | Owner | Status |
|---|---|---|---|
| MKT-130 | GATE CHECK: 5+ customers + 1 testimonial? | Both | Not Started |
| MKT-131 | Consider X Premium (if X is converting) | Paulo | Not Started |
| MKT-132 | Create Indie Hackers profile + post | Paulo | Not Started |
| MKT-133 | List on SaaSHub | Paulo | Not Started |
| MKT-134 | List on AlternativeTo | Paulo | Not Started |
| MKT-135 | Create lead magnet: Compound Thinking Starter Kit | Both | Not Started |
| MKT-136 | Weekly review of all metrics | Both | Not Started |

#### Kill Criteria & Gates
| ID | Item | Owner | Status |
|---|---|---|---|
| MKT-140 | KILL: 0 customers after Day 14 → rewrite positioning | Both | Not Started |
| MKT-141 | KILL: < $200 revenue after Day 30 → fundamental pivot | Both | Not Started |
| MKT-142 | Product Hunt / Show HN only after gate passes | Both | Not Started |

---

## Implementation Plan

### Phase 1: Launch Ready (T1 Complete)
**Timeline:** This weekend sprint (March 7-8)
**Blockers:** Paulo creates Stripe prices (INF-001, INF-002)

| Order | Item | Effort | Depends on |
|---|---|---|---|
| 1 | OM-041: Custom 404 pages | 30 min | — |
| 2 | OM-042: Landing page error boundary | 15 min | — |
| 3 | OM-040: Landing page social proof | 2-3h | — |
| 4 | INF-003: Wire pricing buttons | 1-2h | INF-001, INF-002 |
| 5 | INF-004: Stripe client with tiers | 1h | INF-001 |
| 6 | OM-006: Deploy to Vercel | 30 min | INF-003, INF-005 |
| 7 | INF-009: Test checkout E2E | 1h | OM-006 |
| 8 | INF-010: Verify all routes | 30 min | OM-006 |

### Phase 2: Premium Polish (T2)
**Timeline:** Week 1 post-deploy

| Order | Item | Effort |
|---|---|---|
| 1 | OM-010: Backlog refresh bug | 2-3h |
| 2 | OM-011: Save & Route UX | 3-4h |
| 3 | OM-012: Dropdown readability | 1-2h |
| 4 | OM-013: Duplicate effort fields | 1h |
| 5 | OM-014: Standard sorting | 2-3h |
| 6 | OM-043: Undo on destructive actions | 2-3h |
| 7 | OM-044: Account delete confirmation | 1h |
| 8 | OM-045: Skip nav link | 30 min |
| 9 | OM-046: Reduced motion | 1-2h |
| 10 | OM-048: Keyboard shortcut help | 2-3h |
| 11 | OM-049: Data export UI | 2-3h |
| 12 | OM-050: Theme toggle UI | 1-2h |
| 13 | OM-051: Global search | 3-4h |
| 14 | OM-052: Favicon & PWA icons | 1h |
| 15 | OM-053: Breadcrumbs | 1-2h |
| 16 | OM-016: PostHog config | 1-2h |
| 17 | OM-017: Sentry config | 1h |

### Phase 3: Retention Systems (T3)
**Timeline:** Week 2-4 post-launch

| Priority | Item | Effort |
|---|---|---|
| 1 | OM-069: Templates | 4-6h |
| 2 | OM-070: Space templates (onboarding) | 2-3h |
| 3 | OM-071: Progressive onboarding | 4-6h |
| 4 | OM-060: Morning planning ritual | 8-12h |
| 5 | OM-061: Evening shutdown ritual | 6-8h |
| 6 | OM-064: Recurring items | 6-8h |
| 7 | OM-062: Capture analytics | 6-8h |
| 8 | OM-066: Reminders | 4-6h |
| 9 | OM-067: Daily digest email | 3-4h |
| 10 | OM-015: Organize rethink | 4-6h |
| 11 | OM-024: Bulk select inbox | 3-4h |
| 12 | OM-073: Offline handling | 4-6h |

### Phase 4: Differentiation (T4)
**Timeline:** Month 2+

Focus on highest-impact items first: AI Self-Knowledge, Time Awareness, Voice Capture. Exact prioritization based on user feedback from Phase 3 metrics.

### Phase 5: Scale (T5)
**Timeline:** Month 3+

Driven by user demand. MCP Server and Public API are strategic priorities. Import/export based on most-requested source platforms.

---

## Effort Summary

| Tier | Items | Estimated Effort |
|---|---|---|
| T1 Launch Gate | 9 items (+ 15 infra) | ~12-16h Claude + Paulo tasks |
| T2 Premium Baseline | 17 items | ~28-40h |
| T3 Retention & Habits | 14 items | ~60-80h |
| T4 Differentiation | 12 items | ~70-100h |
| T5 Scale & Ecosystem | 12 items | ~50-70h |
| Marketing & Launch | 35 items | Paulo-led |
| **Total tracked** | **114 items** | **~220-306h + marketing** |

---

## Conventions

1. **This spec is the source of truth** for what needs to be done.
2. **New items** get the next OM-XXX ID (current max: OM-089).
3. **Commit messages** reference OM-IDs.
4. **Status tracking:** Not Started → In Progress → Done → Verified
5. **No work starts on a new tier** until Paulo approves the plan.
6. **Design-first items** (marked in description) need a design review before implementation.
7. **Research references** are in `docs/PREMIUM-PRODUCT-AUDIT.md`.
8. **Roadmap sync:** After changing any item status, run `npm run sync-roadmap` to update the dashboard.
