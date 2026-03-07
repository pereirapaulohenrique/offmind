# OffMind — Architecture Reference

**Created:** 2026-03-07
**Type:** Reference
**Status:** Active

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 16.1.6 | App Router, SSR, API routes |
| Language | TypeScript | 5.x | Type safety |
| UI | React | 19.2.3 | Server + Client Components |
| Styling | Tailwind CSS | 4.x | Atomic CSS with CSS variables |
| Components | shadcn/ui (Radix) | 29 components | Headless accessible primitives |
| Icons | Lucide React | 0.563.0 | 563 SVG icons |
| State | Zustand | 5.0.11 | Client state management |
| Server State | TanStack React Query | 5.90.20 | Caching, mutations, refetch |
| Validation | Zod | 4.3.6 | Schema validation (API + forms) |
| Animation | Framer Motion | 12.31.1 | Page transitions, micro-interactions |
| Editor | Tiptap | 3.19.0 | Rich text (code blocks, links, tasks) |
| Drag & Drop | @dnd-kit | 6.3.1 | Sortable lists, kanban |
| Dates | date-fns | 4.1.0 | Date formatting and calculations |
| Auth | Supabase Auth | 2.94.1 | Magic link, password, OAuth |
| Database | Supabase (PostgreSQL) | 2.94.1 | RLS, realtime subscriptions |
| Storage | Supabase Storage | — | File attachments |
| AI | Anthropic SDK | 0.72.1 | Claude API for all AI features |
| Payments | Stripe | 20.3.0 | One-time founding member checkout |
| Email | Resend | 6.9.2 | Transactional email |
| Analytics | PostHog | 1.352.0 | Product analytics (client + server) |
| Errors | Sentry | 10.39.0 | Error tracking and alerting |
| Calendar | Google APIs | 171.4.0 | Calendar read integration |
| Bot | Telegram Bot API | — | Capture via Telegram |
| Fonts | Geist | 1.7.0 | Sans + Mono font family |
| Testing | Playwright | 1.58.2 | E2E testing |

---

## Directory Structure

```
offmind/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group (login, signup, callback)
│   ├── (dashboard)/              # Protected routes (all app pages)
│   │   ├── archive/
│   │   ├── backlog/
│   │   ├── commit/
│   │   ├── home/
│   │   ├── inbox/
│   │   ├── items/[id]/
│   │   ├── organize/
│   │   ├── pages/ + pages/[id]/
│   │   ├── projects/ + projects/[id]/
│   │   ├── review/
│   │   ├── schedule/
│   │   ├── settings/
│   │   ├── spaces/ + spaces/[id]/
│   │   ├── today/
│   │   ├── waiting-for/
│   │   └── layout.tsx            # Dashboard layout (server)
│   ├── api/                      # API routes (17+ endpoints)
│   │   ├── account/              # Account deletion
│   │   ├── ai/                   # 14 AI endpoints
│   │   ├── auth/                 # Desktop session
│   │   ├── capture/              # Item capture
│   │   ├── export/               # Data export
│   │   ├── extension/            # Browser extension
│   │   ├── feedback/             # User feedback
│   │   ├── integrations/         # Google Calendar OAuth
│   │   ├── seed/                 # Dev data seeding
│   │   ├── stripe/               # Checkout, portal, webhook
│   │   ├── telegram/             # Bot webhook
│   │   └── waitlist/             # Waitlist signup
│   ├── help/                     # Help page
│   ├── privacy/                  # Privacy policy
│   ├── terms/                    # Terms of service
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── global-error.tsx          # Global error boundary
│   ├── opengraph-image.tsx       # OG image generator
│   └── twitter-image.tsx         # Twitter card generator
│
├── components/
│   ├── ai/                       # AI assistant, bulk actions
│   ├── analytics/                # PostHog provider
│   ├── brand/                    # Logo
│   ├── capture/                  # Capture target pill
│   ├── editor/                   # Tiptap rich text editor
│   ├── icons/                    # Icon registry
│   ├── inbox/                    # Compact + grid views
│   ├── item-detail/              # Activity, chips, relations, subtasks
│   ├── items/                    # Cards, drag-drop, edit modal
│   ├── layout/                   # Sidebar, Header, CaptureBar, CommandPalette
│   ├── marketing/                # Waitlist form
│   ├── onboarding/               # Onboarding wizard
│   ├── organize/                 # Column, grid, list views
│   ├── pages/                    # Page capture queue
│   ├── process/                  # Focus, kanban, table views
│   ├── processing/               # Right-side processing panel
│   ├── schedule/                 # Google Calendar events
│   ├── shared/                   # Empty states, error boundary, loading, feedback
│   ├── subscription/             # Pricing cards, status
│   ├── ui/                       # shadcn/ui (29 components)
│   └── providers.tsx             # Root providers
│
├── hooks/                        # Custom React hooks (9)
├── lib/                          # Services and utilities
│   ├── ai/                       # Anthropic client + prompts
│   ├── analytics/                # PostHog init + events + server
│   ├── constants/                # GTD layer definitions
│   ├── email/                    # Resend client + templates
│   ├── integrations/             # Google Calendar
│   ├── stripe/                   # Stripe client
│   ├── supabase/                 # Client, server, admin, middleware, storage
│   ├── telegram/                 # Bot handler + media
│   ├── utils/                    # Dates, fractional index, soft delete
│   └── validations/              # Zod schemas + validator
│
├── stores/                       # Zustand stores (7)
├── types/                        # TypeScript types + Supabase generated
├── docs/                         # Project documentation
└── public/                       # Static assets
```

---

## Data Model (Core Tables)

```
profiles
  id (UUID, PK, = auth.users.id)
  email
  full_name
  avatar_url
  timezone
  settings (JSONB)
  onboarding_completed (boolean)

subscriptions
  id (UUID, PK)
  user_id (FK → profiles)
  stripe_customer_id
  stripe_subscription_id
  status (active | trialing | canceled | past_due)
  plan (starter | builder | believer)
  trial_ends_at

destinations
  id (UUID, PK)
  user_id (FK → profiles)
  name
  slug (inbox | backlog | reference | someday | questions | waiting | trash)
  icon
  color
  position (fractional index)

items
  id (UUID, PK)
  user_id (FK → profiles)
  title
  notes (rich text)
  layer (capture | process | commit)
  destination_id (FK → destinations)
  space_id (FK → spaces)
  project_id (FK → projects)
  page_id (FK → pages)
  priority (low | medium | high | urgent)
  effort
  energy
  scheduled_at (timestamptz)
  due_at (timestamptz)
  completed_at (timestamptz)
  archived_at (timestamptz, soft delete)
  position (fractional index)
  ai_suggestion (JSONB)
  created_at, updated_at

spaces
  id, user_id, name, icon, color, position

projects
  id, user_id, space_id, name, icon, color, description, position

pages
  id, user_id, space_id, project_id, title, content (rich text), position

subtasks
  id, item_id, title, completed, position

contacts
  id, user_id, name, email, phone
```

---

## Authentication Flow

```
Browser                    Supabase Auth               App
  |                            |                        |
  |--- Login (magic link) ---->|                        |
  |<--- Email with OTP --------|                        |
  |--- Verify OTP ------------>|                        |
  |<--- Session cookie --------|                        |
  |                            |                        |
  |--- Request (cookie) ------>|--- middleware.ts ------>|
  |                            |   (refresh session)    |
  |<--- Response --------------|<-----------------------|
```

- Magic link (email OTP) or password auth
- Session stored in secure, httpOnly cookies
- `middleware.ts` refreshes session on every request
- Public routes: `/`, `/login`, `/signup`, `/callback`, `/privacy`, `/terms`, `/help`, `/api/*`
- Protected routes: everything else (redirect to `/login` if no session)

---

## State Architecture

```
Server (SSR)                    Client
┌──────────────┐     props     ┌──────────────────┐
│ Dashboard    │──────────────>│ Sidebar          │
│ layout.tsx   │               │ Header           │
│ (fetch user, │               │ ContentArea      │
│  spaces,     │               └──────────────────┘
│  projects,   │                      │
│  pages,      │               ┌──────┴──────────┐
│  inbox)      │               │ Zustand Stores   │
└──────────────┘               │  items.ts        │
                               │  ui.ts           │
                               │  pages.ts        │
                               │  filters.ts      │
                               │  subtasks.ts     │
                               │  subscription.ts │
                               │  capture-target  │
                               └─────────────────┘
                                      │
                               ┌──────┴──────────┐
                               │ React Query      │
                               │ (server state    │
                               │  cache, refetch) │
                               └─────────────────┘
                                      │
                               ┌──────┴──────────┐
                               │ Supabase Client  │
                               │ (realtime subs)  │
                               └─────────────────┘
```

**Pattern:** Server components fetch initial data → pass as props → client components hydrate Zustand stores → mutations go through API routes → React Query invalidates → Supabase realtime broadcasts changes.

---

## AI Endpoints (14)

| Endpoint | Purpose | Input | Output |
|---|---|---|---|
| `/api/ai/smart-capture` | Parse capture text | text | title, destination, date, priority |
| `/api/ai/suggest-destination` | Suggest where item belongs | item | destination + confidence |
| `/api/ai/extract-date` | Extract date from text | text | ISO date |
| `/api/ai/generate-title` | Clean up item title | raw text | formatted title |
| `/api/ai/suggest-subtasks` | Break item into subtasks | item | subtask[] |
| `/api/ai/expand-notes` | Expand short notes | notes | expanded notes |
| `/api/ai/enhance-writing` | Improve/continue/summarize | text, action | enhanced text |
| `/api/ai/draft-page` | Draft page from item | item | page content |
| `/api/ai/brainstorm` | Generate related ideas | topic | idea[] |
| `/api/ai/cluster-items` | Group similar items | item[] | cluster[] |
| `/api/ai/bulk-process` | Batch categorize items | item[] | suggestion[] |
| `/api/ai/stale-items` | Find neglected items | user_id | stale_item[] |
| `/api/ai/suggest-promotions` | Items to promote/schedule | user_id | promotion[] |
| `/api/ai/review-summary` | Weekly review summary | week data | summary text |
| `/api/ai/migrate-titles` | Batch clean titles | item[] | title[] |

All endpoints: Zod-validated input, rate-limited, auth-required, Sentry error capture.

---

## API Route Patterns

```typescript
// Standard API route structure
export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Validate input
  const body = await request.json();
  const validation = schema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });

  // 3. Rate limit (AI routes)
  const rateLimitResult = await checkRateLimit(user.id);
  if (!rateLimitResult.allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

  // 4. Business logic
  try {
    const result = await doWork(validation.data);
    return NextResponse.json(result);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## Design System Summary

Full spec: `docs/01-DESIGN-SYSTEM.md`

**Dark mode (primary):**
- Background: 7-level warm charcoal (`#1a1614` → `#564f48`)
- Text: Warm cream whites (`#f5efe8` primary, `#a89e93` secondary)
- Accent: Teal (`#2dd4bf` base, surgical precision)
- CTA: Terracotta (`#c2410c` for marketing only)
- Borders: Warm translucent (`rgba(196, 145, 100, 0.10-0.28)`)

**Typography:** Geist Sans (body) + Geist Mono (code). Scale: 0.64rem to 3.052rem.

**Components:** All shadcn/ui primitives customized via CSS variables for dark-first design.

---

## Key Patterns

| Pattern | Implementation |
|---|---|
| Optimistic updates | `stores/items.ts`: `optimisticUpdate()` + `revertOptimisticUpdate()` |
| Soft deletes | `archived_at` timestamp, filtered in queries |
| Fractional indexing | `lib/utils/fractional-index.ts` for drag-and-drop ordering |
| Error boundaries | 3 levels: `global-error.tsx`, `ErrorBoundary` component, per-route `error.tsx` |
| Empty states | 10 pre-built variants in `components/shared/EmptyState.tsx` |
| Loading skeletons | 4 variants + page-level skeletons in `components/shared/` |
| Realtime sync | `components/layout/RealtimeProvider.tsx` with Supabase subscriptions |
| Command palette | `Cmd+K` via `components/layout/CommandPalette.tsx` using cmdk |
| Quick capture | `Cmd+J` via `components/layout/QuickCapture.tsx` |

---

## Environment Variables

```bash
# Required for all environments
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=

# Required for production
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=
NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID=
SENTRY_ORG=
SENTRY_PROJECT=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Optional
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
RESEND_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Coding Conventions

- **Path alias:** `@/*` maps to project root
- **Component files:** PascalCase (`ItemCard.tsx`)
- **Utility files:** camelCase (`api-utils.ts`)
- **Server components:** Default (no `'use client'` directive)
- **Client components:** Explicit `'use client'` at top
- **Page pattern:** `page.tsx` (server, fetch data) + `client.tsx` (client, interactive UI)
- **Imports:** Group by: React/Next → external libs → internal components → types
- **Styling:** Tailwind classes via `cn()` utility. No inline styles except dynamic values.
- **Forms:** Controlled components with Zustand or local state. Zod validation.
- **Error handling:** try/catch in API routes, ErrorBoundary in UI, Sentry for capture.
