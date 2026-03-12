# OffMind Documentation Index

**Last updated:** 2026-03-12 (reconciled)

---

## How to Use This Index

This is the single reference for all project documentation. Documents are organized by type and listed in chronological order within each category. Check here first before creating new docs to avoid duplication.

---

## Project Configuration

| File | Location | Description | Updated |
|---|---|---|---|
| CLAUDE.md | `/CLAUDE.md` | Claude Code project instructions. Tech stack, conventions, UX patterns, visual identity, keyboard shortcuts. | Active |
| README.md | `/README.md` | Default Next.js boilerplate. Not project-specific. | Boilerplate |
| .env.example | `/.env.example` | Environment variable template. All required keys. | Active |

---

## Design & Specification

| # | File | Location | Type | Phase | Description | Status |
|---|---|---|---|---|---|---|
| 01 | Design System | `/docs/01-DESIGN-SYSTEM.md` | Spec | Foundation | Complete design system: warm cream/charcoal surfaces, terracotta `#c27a5a` accent, DM Sans typography, Lucide icons, open loop monochrome logo, component patterns, animations. Light-first design. Rewritten Mar 12. | Final |
| 02 | Screen Specs | `/docs/02-SCREEN-SPECS.md` | Spec | Foundation | Global layout specs: sidebar (68px collapsed / 240px expanded), header, capture bar, navigation, component details. | Final |
| — | Vision | `/docs/VISION.md` | Vision | — | Product vision for Compound Intelligence: 3 levels of system intelligence (Pattern Recognition → Structure Generation → Compound Intelligence). The long-term differentiator. Promoted from v2 on Mar 12. | Active |

---

## Product & Strategy

| File | Location | Type | Phase | Description | Status |
|---|---|---|---|---|---|
| **Product Spec v2** | `/docs/PRODUCT-SPEC.md` | Spec | All phases | **Master development spec.** 90+ work items across 5 impact tiers (T1 Launch Gate → T5 Scale). Engineering, UX, accessibility, retention, differentiation, marketing. 5-phase implementation plan with dependencies. Created 2026-03-06, v2 rewrite 2026-03-07, design notes updated Mar 12. | **Active** |
| Architecture | `/docs/ARCHITECTURE.md` | Reference | — | Technical reference: full tech stack (DM Sans, terracotta accent, warm cream surfaces), directory structure, data model (10 tables), auth flow, state architecture, 14 AI endpoints, API patterns, design system summary, env vars, coding conventions. Updated Mar 12. | Active |
| Item Evolution Roadmap | `/docs/ITEM-EVOLUTION-ROADMAP.md` | Vision | Post-launch | "Items should grow, not just move." Destination-contextual interactions for Backlog, Schedule, Waiting, Someday, Reference, Questions. | Vision |
| Premium Product Audit | `/docs/PREMIUM-PRODUCT-AUDIT.md` | Analysis | Pre-launch | Two-part audit: (1) 27 product gaps against usability heuristics, WCAG AA, interaction design patterns. (2) 11-category strategic gap analysis vs. Sunsama, Akiflow, Todoist, Things 3, Reclaim, Tana, Capacities, Linear, Superhuman. **Research reference for PRODUCT-SPEC v2.** Created 2026-03-07. | Complete |

---

## Operations & Launch

| File | Location | Type | Phase | Description | Status |
|---|---|---|---|---|---|
| **Launch Playbook** | `/docs/LAUNCH-PLAYBOOK.md` | Plan | Launch | **Single source of truth for commercial model + 30-day launch sequence.** Consolidated from Codex diagnosis + marketing research + product audit. Defines ONE pricing model (3-tier founding member), all required code changes, 30-day phased plan (seal pipe → conversations → prove → scale), content templates, success metrics, kill criteria. Created 2026-03-07. Days 1-3 tasks ALL DONE as of 2026-03-07. | **Active** |
| **Ops Guide** | `/docs/OPS-GUIDE.md` | Reference | Post-launch | **How to check everything after launch.** PostHog dashboards + all tracked events, Sentry error monitoring, Stripe payments, Vercel deploys, Supabase tables. Launch day + daily checklists. Created 2026-03-07. | **Active** |
| Launch Roadmap | `/offmind-roadmap.html` | Dashboard | Launch | Interactive HTML dashboard. 5 impact tiers, 90+ items with owner badges, priority colors, progress bars, filters. localStorage persistence. Open in browser. Created 2026-03-07. | Active |
| Design Reference | `/tinker/design-reference.html` | Reference | Foundation | Visual design reference: light/dark app frames, light/dark heroes, design tokens grid. Terracotta + warm cream + DM Sans + Lucide icons + open loop logo. Created Mar 12. | Active |

### Archived

| File | Location | Reason |
|---|---|---|
| VISION v1 | `/docs/archive/VISION-v1.md` | Superseded by VISION.md (v2, promoted Mar 12) |
| Implementation Plan | `/docs/archive/03-IMPLEMENTATION-PLAN.md` | Completed historical reference. 7-phase redesign plan (archived Mar 12) |
| Sprint Plan | `/docs/archive/SPRINT-PLAN-2026-03-06.md` | Superseded by PRODUCT-SPEC v2 + LAUNCH-PLAYBOOK |
| Marketing Execution Plan | `~/.vault/pipeline/archive/superseded/` | Good thesis, wrong sequencing. Key elements consolidated into LAUNCH-PLAYBOOK |
| NeuralDesk Marketing (9 files) | `~/.vault/pipeline/archive/neuraldesk-marketing/` | NeuralDesk-specific, not OffMind |

### Research References (in `~/.vault/pipeline/outputs/`)

12 research files from Feb 23-27 remain as active references. See LAUNCH-PLAYBOOK Part 6 for the full list with descriptions. Key files:
- Product Hunt research, Reddit growth playbook, subreddit intelligence
- Seed user targets, outreach targets, targeting list
- Growth research synthesis, LinkedIn/X growth research
- Competitive landscape, naming/niche research

---

## Document Types

| Type | Description |
|---|---|
| **Spec** | Detailed technical or product specification. Source of truth for implementation. |
| **Plan** | Time-bound action plan with tasks, owners, and sequence. |
| **Analysis** | Research-backed assessment. Findings + recommendations. Not yet committed. |
| **Vision** | Long-term direction. Not scheduled. Informs future planning. |
| **Reference** | Technical documentation. Architecture, conventions, data model. Always current. |
| **Dashboard** | Interactive tool. Open in browser. |

---

## Document Lifecycle

```
Draft --> Review --> Active --> Complete --> Archived
                      |
                      +--> Superseded (by newer version)
```

- **Draft**: Work in progress. May be incomplete.
- **Review**: Ready for Paulo's review.
- **Active**: Approved and being used for current work.
- **Complete**: Finished. No longer being updated but still referenced.
- **Archived**: Outdated. Kept for historical reference only.
- **Final**: Specification that doesn't change unless the product direction changes.
- **Vision**: Not time-bound. Influences roadmap but isn't committed.

---

## Conventions

- All docs use Markdown.
- File names use UPPER-CASE-KEBAB for visibility in file explorers.
- Numbered files (01-, 02-, 03-) indicate reading order within a series.
- Each doc has metadata at the top: created date, author, phase, type, status.
- This index is updated whenever a new document is created.
