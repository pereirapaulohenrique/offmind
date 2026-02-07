# OffMind - Project Context for Claude Code

## What is OffMind?

OffMind is a GTD (Getting Things Done) productivity app for overthinkers. The core idea: **"Get it off your mind."** Users capture thoughts instantly from anywhere, AI helps organize them, and a focused workflow turns chaos into committed action.

**Target audience:** Knowledge workers, overthinkers, people with too many tabs and note apps.
**Business model:** Free tier + Pro at $9/month (Stripe integration exists).
**Domain:** offmind.ai

## Core Concept: The 3-Layer Workflow

Everything flows through three layers:

1. **Capture** (Blue `#60a5fa`) - Zero-friction brain dump. Thoughts, tasks, ideas, links pour in from any source: web app, persistent capture bar, Telegram bot, Chrome extension, desktop app. No organizing, no thinking - just dump it.

2. **Process** (Amber `#fbbf24`) - AI-assisted triage. One item at a time ("tinder for tasks"), the user decides where it goes. AI suggests destinations with confidence scores. Available destinations: Backlog, Reference, Incubating, Someday, Questions, Waiting, Trash, + custom user-created destinations.

3. **Commit** (Green `#34d399`) - Scheduled, actionable items. What you've committed to doing, with dates. Shows as an agenda/day/week view. Google Calendar integration to display external events alongside tasks.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS custom properties
- **UI Components:** Radix UI primitives (shadcn/ui pattern)
- **Animations:** Framer Motion
- **Database:** Supabase (PostgreSQL + Auth + Real-time subscriptions)
- **AI:** OpenAI API (GPT-4) for smart capture, destination suggestions, bulk processing
- **Payments:** Stripe (checkout, portal, webhooks)
- **Fonts:** Geist Sans (primary), Geist Mono (code)
- **Drag & Drop:** @dnd-kit
- **Rich Editor:** Tiptap (for Pages)
- **State:** Zustand (stores/ui.ts)
- **Deployment:** Vercel

## Repository Structure

```
mindbase/
├── app/
│   ├── (auth)/           # Login, signup pages
│   ├── (dashboard)/      # Protected app pages
│   │   ├── home/         # Dashboard home
│   │   ├── capture/      # Inbox / capture layer
│   │   ├── process/      # Processing / organizing layer
│   │   ├── commit/       # Calendar / committed items layer
│   │   ├── spaces/       # Spaces management + [id] detail
│   │   ├── projects/     # Projects management + [id] detail
│   │   ├── pages/        # Pages (Tiptap editor) + [id] detail
│   │   ├── settings/     # Settings + billing + destinations + integrations
│   │   ├── search/       # Global search
│   │   └── layout.tsx    # Dashboard layout (sidebar, header, command palette)
│   ├── api/              # API routes
│   │   ├── ai/           # AI endpoints (smart-capture, suggest, bulk, brainstorm, etc.)
│   │   ├── stripe/       # Payment endpoints
│   │   ├── telegram/     # Telegram bot endpoints
│   │   ├── extension/    # Chrome extension endpoints
│   │   └── waitlist/     # Waitlist signup
│   ├── globals.css       # Design system tokens + global styles
│   ├── layout.tsx        # Root layout (fonts, metadata)
│   └── page.tsx          # Landing page
├── components/
│   ├── layout/           # Sidebar, Header, MobileSidebar, CommandPalette, QuickCapture, CaptureBar
│   ├── items/            # ItemCard, ItemDetailPanel
│   ├── process/          # KanbanView, FocusProcess
│   ├── ai/               # AIAssistant, BulkAIActions, AISuggestionBadge
│   ├── onboarding/       # OnboardingFlow
│   ├── subscription/     # SubscriptionStatus, PricingSection
│   └── ui/               # Radix/shadcn primitives (button, dialog, card, etc.)
├── lib/                  # Utilities (supabase client, helpers)
├── stores/               # Zustand stores (ui.ts)
├── packages/
│   ├── capture-desktop/  # Electron quick-capture app
│   └── ...
├── public/               # Static assets
└── supabase/             # Database migrations and config
```

## Current State & What We're Doing

The `main` branch has a fully functional app with all features working. A redesign branch (`claude/review-app-design-BeZL5`) attempted a visual overhaul but broke navigation and lost features.

**We are creating a new branch from main** that:
1. Applies a new design system (teal accent + warm charcoal backgrounds) over the existing functional app
2. Ports the good ideas from the redesign (CaptureBar, FocusProcess) without breaking anything
3. Ensures every feature and route remains accessible

## Key Design Decisions

### Visual Identity
- **Brand accent:** Teal `#2dd4bf` (not the old violet, not the redesign's amber)
- **Backgrounds:** Warm charcoal (subtly warm, not cold zinc, not hot amber)
- **Layer colors:** Blue (capture), Amber (process), Green (commit) - functional, not brand
- **Both dark and light mode** from launch

### Layout
- **Sidebar:** Defaults to collapsed (68px icon-only), expandable to 252px
- **Header:** Kept (search/command palette trigger + user avatar)
- **Capture bar:** Persistent at bottom of all dashboard views
- **Content area:** Gets maximum space by default

### Navigation (Sidebar Items)
When expanded:
- Home (^0)
- Capture / Inbox with badge count (^1)
- Process (^2)
- Commit (^3)
- Divider
- Spaces section (list + "Add Space")
- Projects section (list + "Add Project")
- Pages section (recent 5 + "New Page")
- Divider
- Settings (bottom)

When collapsed:
- Logo (sphere)
- Home, Capture (with badge), Process, Commit icons
- Divider
- Spaces, Projects, Pages icons (navigate to list pages)
- Settings icon (bottom)
- All with tooltips

### Views
- **Home:** Stats overview, recent captures, today's commitments
- **Capture/Inbox:** List of unprocessed items + quick capture + AI suggestions + "Process All" button
- **Process:** Toggle between Focus (tinder-style, default) / Kanban / List / Table views
- **Commit:** Agenda/Day/Week views + Google Calendar events overlay
- **Spaces/Projects/Pages:** Management + detail views
- **Settings:** Profile, subscription, Telegram, extension, destinations, danger zone

### AI Features (All Kept)
1. Smart capture (auto-categorize on input)
2. Destination suggestions (single item, with confidence)
3. Bulk processing (categorize, find similar, cleanup, improve titles, suggest schedule)
4. AI assistant (Cmd+J): expand notes, extract dates, brainstorm
5. AI-generated daily summary
6. Natural language task creation
7. AI scheduling suggestions for uncommitted tasks

### Keyboard Shortcuts
- Cmd+K: Command palette
- Cmd+J: AI assistant
- Cmd+N: Focus capture bar
- Cmd+\: Toggle sidebar
- Cmd+Shift+N: New page
- Cmd+0 through Cmd+3: Navigate layers
- Cmd+,: Settings

## Coding Conventions

- Use TypeScript strictly
- Server components by default, 'use client' only when needed
- Supabase for all data operations (use existing lib/supabase patterns)
- Framer Motion for animations (keep them subtle and fast)
- Follow existing component patterns in components/ui/
- CSS variables for all design tokens (defined in globals.css)
- Tailwind for layout and spacing, CSS variables for colors
- Keep file structure consistent with existing patterns
- All API routes use Next.js route handlers in app/api/

## What NOT to Do

- Don't remove or break existing features
- Don't create a new navigation architecture (keep the 3-layer Capture/Process/Commit)
- Don't change the database schema unless absolutely necessary
- Don't replace Radix/shadcn components with custom implementations
- Don't over-animate (subtle, fast, purposeful only)
- Don't use amber as the brand accent (teal is the brand, amber is the Process layer)
