# OffMind - Project Context for Claude Code

## What is OffMind?

OffMind is a GTD (Getting Things Done) productivity app for overthinkers. The core idea: **"Get it off your mind."** Users capture thoughts instantly from anywhere, AI helps organize them, and a focused workflow turns chaos into committed action.

**Target audience:** Knowledge workers, overthinkers, people with too many tabs and note apps.
**Business model:** Free tier + Pro at $9/month (Stripe integration exists).
**Domain:** offmind.ai
**Core values:** "Zero friction — never lose a thought" + "Full flexibility with no complexity"

## Core Concept: The 3-Layer Workflow

Everything flows through three layers:

1. **Capture** (Blue `#6daef7`) - Zero-friction brain dump. Text, images, audio recordings pour in from: web app, persistent capture bar, Telegram bot, Chrome extension, desktop app. No organizing — just dump it.

2. **Process / Organize** (Amber `#f0b429`) - Triage & organize. Items get assigned destinations (Backlog, Reference, Incubating, Someday, Questions, Waiting, Trash, + custom). Processing Panel slides in from the right on any page.

3. **Commit / Schedule** (Green `#3dd68c`) - Scheduled, actionable items. Calendar with day/week views. Google Calendar integration.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + CSS custom properties (Bloom design system)
- **UI Components:** Radix UI primitives (shadcn/ui pattern)
- **Animations:** Framer Motion
- **Database:** Supabase (PostgreSQL + Auth + Real-time + Storage for attachments)
- **AI:** OpenAI API (GPT-4)
- **Payments:** Stripe
- **Fonts:** Geist Sans (primary), Geist Mono (code)
- **Drag & Drop:** @dnd-kit
- **Rich Editor:** Tiptap (for Pages)
- **State:** Zustand (stores/ui.ts)
- **Deployment:** Vercel

## Repository Structure

```
offmind/
├── app/
│   ├── (auth)/             # Login, signup pages
│   ├── (dashboard)/        # Protected app pages
│   │   ├── today/          # Default landing — overdue, scheduled, starred
│   │   ├── inbox/          # Capture layer — unprocessed items
│   │   ├── organize/       # All items by destination (columns/list/grid views)
│   │   ├── schedule/       # Calendar deep dive (day/week views)
│   │   ├── backlog/        # Backlog deep dive (priority-sortable)
│   │   ├── waiting-for/    # Waiting For deep dive (grouped by contact)
│   │   ├── spaces/         # Spaces management + [id] detail
│   │   ├── projects/       # Projects management + [id] detail
│   │   ├── pages/          # Pages (Tiptap editor) + [id] detail
│   │   ├── settings/       # Settings + billing + destinations + custom fields
│   │   ├── search/         # Global search
│   │   ├── home/           # Redirect → /today
│   │   ├── review/         # Redirect → /organize
│   │   ├── commit/         # Redirect → /schedule
│   │   └── layout.tsx      # Dashboard layout (sidebar, header, command palette, processing panel)
│   ├── api/                # API routes (ai/, stripe/, telegram/, extension/, waitlist/)
│   ├── globals.css         # Bloom design system tokens + global styles
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   └── page.tsx            # Landing page
├── components/
│   ├── layout/             # Sidebar (tree nav), Header, CaptureBar (text+image+audio), CommandPalette
│   ├── processing/         # ProcessingPanel (40% width, expandable, replaces ItemDetailPanel)
│   ├── organize/           # ColumnView, ListView, GridView
│   ├── items/              # ItemCard (with attachment indicators)
│   ├── ai/                 # AIAssistant, BulkAIActions, AISuggestionBadge
│   ├── onboarding/         # OnboardingFlow
│   ├── subscription/       # SubscriptionStatus, PricingSection
│   ├── shared/             # EmptyState, LoadingState, IconPicker, ColorPicker
│   └── ui/                 # Radix/shadcn primitives
├── hooks/                  # useAudioRecorder, useSubscription, etc.
├── lib/
│   ├── supabase/           # client.ts, server.ts, middleware.ts, storage.ts
│   └── utils/              # constants.ts, dates.ts, helpers
├── stores/                 # Zustand stores (ui.ts with processingPanel, organizeViewType, sidebarTree)
├── types/                  # database.ts (includes Attachment type), index.ts
├── packages/
│   ├── capture-desktop/    # Electron quick-capture app
│   └── ...
├── public/                 # Static assets
└── supabase/               # Database migrations and config
```

## Navigation (Sidebar)

### Primary Navigation
- **Today** (Sun icon, ⌘0) — default landing, shows overdue + scheduled + completed
- **Inbox** (Inbox icon, ⌘1) — unprocessed items, badge with count
- **Organize** (Columns icon, ⌘2) — all items by destination (columns/list/grid views)

### Destination Deep Dives
- **Schedule** (Calendar icon, ⌘3) — calendar day/week views
- **Backlog** (ListTodo icon) — priority-sortable list
- **Waiting For** (Clock icon) — grouped by contact

### Spaces Tree (collapsible)
- Space > Project > Pages — tree hierarchy in sidebar
- Spaces expandable to show projects, projects expandable to show pages

### Settings (bottom)

## Key UX Patterns

### Processing Panel
- Opens from ANY page when clicking an item
- 40% width right-side panel, expandable to full width
- Semi-transparent backdrop overlay
- Auto-saves every field change (500ms debounce)
- Destination buttons, scheduling fields, space/project selectors
- Controlled by Zustand: `processingPanelOpen`, `processingItemId`, `processingPanelExpanded`

### CaptureBar
- Persistent at bottom of all dashboard views
- Supports: text, image upload, audio recording
- Attachments stored in Supabase Storage, referenced in `items.attachments` JSON column

### Organize Views
- **Columns** (default): One column per destination, horizontal scroll
- **List**: Collapsible destination groups, compact rows
- **Grid**: Card grid grouped by destination sections

## Visual Identity (Bloom Design System — Hybrid Teal + Terracotta)

- **Product accent (Teal):** `#2dd4bf` (dark) / `#0d9488` (light) — navigation, AI indicators, focus states, interactive controls, progress. The product's interactive personality.
- **CTA accent (Terracotta):** `#c2410c` (dark) / `#b93d0a` (light) — conversion buttons, landing page, pricing, marketing. Warmth that drives action.
- **Logo:** Teal-to-terracotta gradient (bridges both accents)
- **Secondary:** Sage green `#65a30d`, Lavender `#7c3aed`
- **Layer colors:** Warm blue (capture), Golden amber (process), Warm emerald (commit)
- **Dark mode:** Warm charcoal backgrounds (#1a1614 base)
- **Light mode:** Warm cream backgrounds (#faf8f5 base, white cards)
- **Radius:** Large everywhere (rounded-2xl), organic & soft
- **Shadows:** Warm brown-tinted, thick and tactile

## Keyboard Shortcuts

- Cmd+K: Command palette
- Cmd+J: AI assistant
- Cmd+N: Focus capture bar
- Cmd+\: Toggle sidebar
- Cmd+Shift+N: New page
- Cmd+0: Today
- Cmd+1: Inbox
- Cmd+2: Organize
- Cmd+3: Schedule
- Cmd+,: Settings
- Escape: Close processing panel

## Coding Conventions

- Use TypeScript strictly
- Server components by default, 'use client' only when needed
- Supabase for all data operations (use existing lib/supabase patterns)
- Framer Motion for animations (keep them subtle and fast)
- Follow existing component patterns in components/ui/
- CSS variables for all design tokens (defined in globals.css)
- Tailwind for layout and spacing, CSS variables for colors
- All API routes use Next.js route handlers in app/api/

## What NOT to Do

- Don't remove or break existing features
- Don't change the database schema unless absolutely necessary
- Don't replace Radix/shadcn components with custom implementations
- Don't over-animate (subtle, fast, purposeful only)
- Don't use amber as the brand accent (amber is the Process layer)
- Don't use terracotta (`--cta-*`) for product UI elements — use teal (`--accent-*`). Terracotta is only for CTA/marketing/conversion elements.
- Don't hardcode color hex values — always use CSS variable tokens (`var(--accent-base)`, `var(--cta-base)`, etc.)
