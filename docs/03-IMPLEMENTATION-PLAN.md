# OffMind Implementation Plan

## Overview

We are creating a new branch from `main` and applying design + feature improvements WITHOUT breaking existing functionality. The main branch has a fully working app. We are:

1. Reskinning with the new teal + warm charcoal design system
2. Porting good ideas from the redesign branch (CaptureBar, FocusProcess)
3. Adding missing features (Table view, light mode, new AI features)
4. Ensuring 100% feature coverage - every route, every interaction works

**Branch strategy:** Create new branch `design-refresh` from `main`. Never touch `main`.

---

## Phase 1: Design System Foundation

### Step 1.1: Update CSS Variables (globals.css)

Replace the current color tokens with the new design system. Reference: `docs/01-DESIGN-SYSTEM.md`.

**Changes:**
- Background colors: current `#08080c` base → `#0e0e11` (warmer)
- Accent: current violet `#7c5cfc` → teal `#2dd4bf`
- All accent-derived values (hover, active, subtle, border, glow)
- Border colors: update to warmer values
- Text colors: slight warmth adjustment
- Add light mode block (`.light { ... }` with all light mode tokens)
- Add shadow tokens
- Keep layer colors (blue/amber/green) exactly as they are
- Keep destination colors exactly as they are
- Keep layout constants but update sidebar default

**Files to modify:**
- `app/globals.css`

### Step 1.2: Update Tailwind Config

Ensure Tailwind config maps to the new CSS variables correctly. Add any missing color mappings.

**Files to modify:**
- `tailwind.config.ts`

### Step 1.3: Theme Toggle

Add dark/light mode support:
- Add theme state to Zustand store (`stores/ui.ts`)
- Add `useEffect` in root layout to apply `dark`/`light` class to `<html>`
- Persist preference in localStorage
- Respect `prefers-color-scheme` on first visit
- Add theme toggle to Settings page

**Files to modify:**
- `stores/ui.ts`
- `app/layout.tsx`
- `app/(dashboard)/settings/client.tsx`

---

## Phase 2: Layout Changes

### Step 2.1: Sidebar Default Collapsed

Change sidebar to default to collapsed state (68px) instead of expanded (252px).

**Changes:**
- Update Zustand store default: `sidebarCollapsed: true`
- Ensure collapsed sidebar shows:
  - Logo sphere (no text)
  - Nav icons with tooltips
  - Capture badge (count) visible even when collapsed
  - Spaces/Projects/Pages icons that navigate to list pages
  - Expand button (chevron right)
  - Settings icon
- Ensure expand/collapse transition is smooth (200ms)
- On expand: show full nav with text labels, sections, lists

**Files to modify:**
- `stores/ui.ts` (default state)
- `components/layout/Sidebar.tsx` (collapsed layout, tooltips, expand button)

### Step 2.2: Add Persistent Capture Bar

Port `CaptureBar.tsx` from the redesign branch and integrate into dashboard layout.

**Port from redesign branch:**
- `components/layout/CaptureBar.tsx`

**Adapt for new design:**
- Change amber accent → teal accent on focus
- Position: fixed bottom, left offset by sidebar width
- Glassmorphic background with backdrop blur
- Keyboard shortcut: Cmd+N to focus
- Enter to submit, Escape to blur
- Creates items in capture layer with source 'web'
- Toast notification on capture
- Add bottom padding to main content area to prevent overlap

**Files to modify:**
- `app/(dashboard)/layout.tsx` (add CaptureBar component)
- `components/layout/CaptureBar.tsx` (port and adapt)
- Content areas may need `pb-20` to avoid capture bar overlap

### Step 2.3: Update Header

Keep the header but update styling:
- Apply new border colors
- Update search trigger styling
- Ensure avatar uses new accent gradient

**Files to modify:**
- `components/layout/Header.tsx`

---

## Phase 3: Component Reskinning

### Step 3.1: Update All UI Primitives

Go through every component in `components/ui/` and update hardcoded colors to use CSS variables. Most already use Tailwind classes that should map correctly, but verify:

- `button.tsx` - Primary variant should use teal
- `input.tsx` - Focus ring should use teal
- `card.tsx` - Background and border from tokens
- `dialog.tsx` - Overlay and content colors
- `dropdown-menu.tsx` - Background, hover, borders
- `badge.tsx` - Verify color variants
- `command.tsx` - Command palette styling
- `tabs.tsx` - Active tab indicator
- All other primitives

**Files to modify:**
- All files in `components/ui/`

### Step 3.2: Update Navigation Item Styling

Update sidebar nav items to use new active state colors:
- Default active → teal (accent-subtle bg, accent color)
- Capture active → blue (layer-capture)
- Process active → amber (layer-process)
- Commit active → green (layer-commit)

**Files to modify:**
- `components/layout/Sidebar.tsx`

### Step 3.3: Update Item Cards

Update `ItemCard.tsx` and related card components:
- Card backgrounds from tokens
- Hover effects matching design system
- Layer color dots/borders
- Destination tag colors
- AI suggestion styling (teal accent for AI indicators)

**Files to modify:**
- `components/items/ItemCard.tsx`
- `components/items/ItemDetailPanel.tsx`

### Step 3.4: Update AI Components

- AI Assistant modal: teal accent for action cards
- Bulk AI Actions: update dropdown styling
- AI Suggestion Badge: teal highlight for AI indicators

**Files to modify:**
- `components/ai/AIAssistant.tsx`
- `components/ai/BulkAIActions.tsx`
- `components/ai/AISuggestionBadge.tsx`

---

## Phase 4: Feature Additions

### Step 4.1: Port FocusProcess Component

Port `FocusProcess.tsx` from the redesign branch and integrate into the Process page.

**Port from redesign branch:**
- `components/process/FocusProcess.tsx`

**Adapt for new design:**
- Update colors to use new tokens
- AI suggestion button uses teal accent
- Amber border on the process card (layer color)
- Keyboard shortcuts: 1-9 for destinations, S schedule, D delete, → skip
- Animation: slide out/in between items
- Empty state: "Inbox clear!" celebration

**Integration:**
- Add view toggle to Process page: Focus | Kanban | List | Table
- Focus is default view
- Store view preference in Zustand

**Files to modify:**
- `components/process/FocusProcess.tsx` (port and adapt)
- `app/(dashboard)/process/client.tsx` (add view toggle, integrate Focus view)
- `stores/ui.ts` (add processViewType state)

### Step 4.2: Add Table View

Create a new Table view component for the Process page.

**Features:**
- Spreadsheet-style layout
- Columns: checkbox, title, destination, space, project, created date, source
- Sortable columns (click header to sort)
- Filterable (dropdown filters per column)
- Click row to open item detail side panel
- Inline destination editing (dropdown in cell)
- Responsive: horizontal scroll on smaller screens

**Files to create:**
- `components/process/TableView.tsx`

**Files to modify:**
- `app/(dashboard)/process/client.tsx` (add Table to view toggle)

### Step 4.3: New AI Features

Add the following AI capabilities:

**4.3.1: AI Daily Summary**
- New API endpoint: `app/api/ai/daily-summary/route.ts`
- Analyzes today's committed items + inbox count + overdue items
- Returns a 2-3 sentence summary of what to focus on
- Display on Home page as a dismissable card above stats
- Refresh button to regenerate

**4.3.2: Natural Language Task Creation**
- Enhance the capture bar and AI Assistant
- Parse natural language: "remind me to call dentist next Thursday at 2pm"
- Auto-extract: title, date/time, suggested destination
- If date detected → auto-schedule (skip straight to commit layer)
- If no date → normal capture flow

**4.3.3: AI Schedule Suggestions**
- New API endpoint: `app/api/ai/suggest-schedule/route.ts`
- For items in process layer without schedule
- Suggests optimal times based on existing commitments
- Shows in Process page as an action: "AI: Schedule 5 items"
- Confirmation dialog with suggested times, user can adjust

**Files to create:**
- `app/api/ai/daily-summary/route.ts`
- `app/api/ai/suggest-schedule/route.ts`

**Files to modify:**
- `app/(dashboard)/home/client.tsx` (daily summary card)
- `components/layout/CaptureBar.tsx` (natural language parsing)
- `components/ai/AIAssistant.tsx` (add daily summary + natural language actions)
- `app/api/ai/smart-capture/route.ts` (enhance with date extraction)

### Step 4.4: Google Calendar Integration

Display Google Calendar events alongside committed tasks.

**Implementation:**
- OAuth2 flow for Google Calendar API
- Settings page: "Connect Google Calendar" button
- Fetch events for the current view range
- Display in Commit view:
  - Agenda: inline with tasks, distinguished by dashed border + external icon
  - Day: shown in time slots
  - Week: shown in day columns
- Read-only (events are not editable in OffMind)
- Sync on page load + manual refresh button

**Files to create:**
- `app/api/calendar/auth/route.ts` (OAuth flow)
- `app/api/calendar/events/route.ts` (fetch events)
- `lib/google-calendar.ts` (API client)

**Files to modify:**
- `app/(dashboard)/settings/client.tsx` (Connect Calendar section)
- `app/(dashboard)/commit/client.tsx` (display events)

---

## Phase 5: Page-Level Polish

### Step 5.1: Home Page

- Update greeting styling
- Stat cards: use new card styling from design system
- Each stat card colored by its layer (blue/amber/green/teal)
- Recent captures: card grid with new design
- Today's commitments: list with checkboxes
- Add AI daily summary card (from Step 4.3.1)

### Step 5.2: Capture Page

- "Inbox" title in capture blue
- Quick capture with blue border accent
- Item cards with 3px left border in blue
- AI suggestion badges with teal accent
- "Process All" button in primary teal
- Source indicators on each item
- Bulk AI dropdown

### Step 5.3: Process Page

- View toggle: Focus (default) | Kanban | List | Table
- Each view properly styled
- Bulk AI dropdown
- Process title in amber

### Step 5.4: Commit Page

- View toggle: Agenda (default) | Day | Week
- Date navigation
- Green left borders on items
- Green checkboxes
- Reschedule dropdown
- Google Calendar events (Phase 4.4)
- Commit title in green

### Step 5.5: Spaces, Projects, Pages

- Update card styling to new design system
- Color pickers, icon pickers match new palette
- Page editor: verify Tiptap styling works with new tokens

### Step 5.6: Settings

- Add Appearance section with theme toggle
- Add Google Calendar connection section
- Update all form styling
- Update destination management styling

### Step 5.7: Landing Page

- Redesign with teal accent
- Update hero: "Clear your mind. Own your day." with teal gradient
- Feature grid matches new design system
- Pricing cards match new design system
- CTA buttons use teal primary

### Step 5.8: Auth Pages

- Update card styling
- Teal accent for buttons and links
- Logo with new brand colors

---

## Phase 6: Onboarding

### Step 6.1: Update OnboardingFlow

- Keep the 5-step flow
- Update styling to new design system
- Layer-colored steps (blue → amber → green)
- Teal accent for CTA buttons
- Ensure it shows only on first visit

**Files to modify:**
- `components/onboarding/OnboardingFlow.tsx`

---

## Phase 7: Testing & Polish

### Step 7.1: Route Verification

Test EVERY route is accessible and functional:
- [ ] `/` - Landing page
- [ ] `/login` - Login
- [ ] `/signup` - Signup
- [ ] `/home` - Home dashboard
- [ ] `/capture` - Inbox
- [ ] `/process` - Process (all 4 views)
- [ ] `/commit` - Commit (all 3 views)
- [ ] `/spaces` - Spaces list
- [ ] `/spaces/[id]` - Space detail
- [ ] `/projects` - Projects list
- [ ] `/projects/[id]` - Project detail
- [ ] `/pages` - Pages list
- [ ] `/pages/[id]` - Page editor
- [ ] `/settings` - Settings
- [ ] `/search` - Search

### Step 7.2: Feature Verification

- [ ] Quick capture from capture bar
- [ ] Quick capture from Cmd+N
- [ ] Process items in Focus view
- [ ] Drag and drop in Kanban
- [ ] Table view with sorting
- [ ] Complete/uncomplete items
- [ ] Reschedule items
- [ ] AI destination suggestions
- [ ] Bulk AI actions
- [ ] AI Assistant (Cmd+J)
- [ ] Command Palette (Cmd+K)
- [ ] Sidebar collapse/expand
- [ ] Dark/Light mode toggle
- [ ] Onboarding flow
- [ ] Create/edit/delete spaces
- [ ] Create/edit/delete projects
- [ ] Create/edit pages with Tiptap
- [ ] Settings all sections work
- [ ] Responsive on mobile widths
- [ ] Real-time updates (open 2 tabs, capture in one, see in other)

### Step 7.3: Performance

- Verify no layout shift on page load
- Verify sidebar animation is smooth
- Verify capture bar doesn't cause scroll issues
- Verify no excessive re-renders in list views
- Verify kanban drag performance with 50+ items

---

## Implementation Order

Execute phases in order. Within each phase, steps can be parallelized where they don't depend on each other.

1. **Phase 1** (Foundation) - Must be first, everything depends on it
2. **Phase 2** (Layout) - Depends on Phase 1
3. **Phase 3** (Reskinning) - Depends on Phase 1, can overlap with Phase 2
4. **Phase 4** (Features) - Depends on Phases 1-2
5. **Phase 5** (Polish) - Depends on Phases 1-4
6. **Phase 6** (Onboarding) - Depends on Phase 5
7. **Phase 7** (Testing) - After everything else

Estimated file changes: ~40-50 files modified, ~5-8 files created.
