# OffMind Screen Specifications

Every screen in the app, described in full. Implementation must cover ALL screens listed here.

---

## Global Layout

### Dashboard Shell
All dashboard pages share this layout:

```
┌──────────────────────────────────────────────────────────┐
│ [Sidebar]  │  [Header: title + search + avatar]          │
│ 68px       │──────────────────────────────────────────────│
│ collapsed  │                                              │
│            │  [Content Area]                              │
│ (252px     │  max-width: 1200px                          │
│  expanded) │  padding: 24px                              │
│            │                                              │
│            │                                              │
│            │──────────────────────────────────────────────│
│            │  [Capture Bar - fixed bottom]                │
└──────────────────────────────────────────────────────────┘
```

### Sidebar (Collapsed - Default State, 68px)

```
┌────────┐
│ [Logo] │  OffMind sphere, centered
│        │
│ [Home] │  Icon only, tooltip on hover
│ [Capt] │  Icon + badge (count), tooltip
│ [Proc] │  Icon only, tooltip
│ [Comm] │  Icon only, tooltip
│ ────── │  Divider
│ [Spac] │  Grid icon, tooltip "Spaces"
│ [Proj] │  Folder icon, tooltip "Projects"
│ [Page] │  File icon, tooltip "Pages"
│        │
│        │  (flex spacer)
│        │
│ [Expd] │  ChevronRight icon to expand
│ [Sett] │  Gear icon, tooltip "Settings"
└────────┘
```

### Sidebar (Expanded, 252px)

```
┌──────────────────────┐
│ [Logo] OffMind  [<<] │  Logo + name + collapse button
│                      │
│ Home            ^0   │
│ Capture    [7]  ^1   │  Badge with inbox count
│ Process         ^2   │
│ Commit          ^3   │
│ ──────────────────── │
│ SPACES               │  Section title (uppercase, muted)
│   ● Work             │  Color dot + name
│   ● Personal         │
│   ● Side Projects    │
│   + Add Space        │  Muted, teal on hover
│                      │
│ PROJECTS             │
│   [O] OffMind v1     │  Icon letter + name
│   [N] Nodal AI       │
│   + Add Project      │
│                      │
│ PAGES                │
│   📄 Product Roadmap │  Recent 5 pages
│   📄 Meeting Notes   │
│   + New Page         │
│ ──────────────────── │
│ Settings             │
└──────────────────────┘
```

Active nav item uses:
- Home active: teal accent (accent-subtle bg, accent text)
- Capture active: blue (layer-capture-bg, layer-capture text)
- Process active: amber (layer-process-bg, layer-process text)
- Commit active: green (layer-commit-bg, layer-commit text)

### Header (56px)

```
┌──────────────────────────────────────────────────────────┐
│ [Icon] Page Title              [🔍 Search... ^K]  [PH]  │
└──────────────────────────────────────────────────────────┘
```

- Left: Current page icon + title
- Center-right: Search trigger (opens Command Palette)
- Right: User avatar with dropdown menu (profile, settings, sign out)

### Capture Bar (Fixed Bottom, 64px)

```
┌──────────────────────────────────────────────────────────┐
│  ⊕  Capture a thought, task, idea, link...      ^Space  │
└──────────────────────────────────────────────────────────┘
```

- Spans full width minus sidebar
- Teal icon, muted placeholder text
- On focus: teal border glow, expand slightly
- Enter to submit, Escape to blur
- Shift+Enter for multiline
- On submit: creates item in capture layer, shows toast, clears input
- Shortcut: Cmd+N focuses the capture bar

---

## Screen 1: Home (`/home`)

The dashboard overview. Shows the user's current state across all three layers.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Good [morning/afternoon/evening], [Name]                │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Inbox    │ │Processing│ │ Today    │ │Completed │   │
│  │ 7       │ │ 3       │ │ 5       │ │ 12      │   │
│  │ to proc. │ │ need dec.│ │committed │ │this week │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  RECENT CAPTURES                      View All →        │
│  ┌─────────────────┐ ┌─────────────────┐                │
│  │ ● Title...      │ │ ● Title...      │                │
│  │ [Backlog] 2m    │ │ [Waiting] 15m   │                │
│  └─────────────────┘ └─────────────────┘                │
│  ┌─────────────────┐ ┌─────────────────┐                │
│  │ ● Title...      │ │ ● Title...      │                │
│  │ [Incubating] 1h │ │ [Reference] 3h  │                │
│  └─────────────────┘ └─────────────────┘                │
│                                                          │
│  TODAY'S COMMITMENTS                   View All →        │
│  ☐ Write product brief          Friday · Work           │
│  ☑ Review auth middleware PR     Done 2h ago             │
│  ☐ Call dentist                  Today · Personal        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Data Required
- User profile (name, onboarding status)
- Inbox count (items WHERE layer = 'capture')
- Processing count (items WHERE layer = 'process' AND destination IS NULL)
- Today's committed items (items WHERE layer = 'commit' AND scheduled_at = today)
- Completed today count
- Completed this week count
- Recent 5 items (any layer, ordered by created_at DESC)
- Spaces count, projects count

### Interactions
- Click stat cards → navigate to respective page
- Click "View All" → navigate to capture/commit page
- Click commitment → toggle complete
- First visit → show OnboardingFlow overlay

### Onboarding Flow (First Visit Only)
5-step overlay:
1. Welcome: "Welcome to OffMind, [name]!"
2. Capture: "Brain dump everything" (blue themed)
3. Process: "AI helps you organize" (amber themed)
4. Commit: "Schedule what matters" (green themed)
5. Ready: "Start capturing!" with CTA button

---

## Screen 2: Capture / Inbox (`/capture`)

The inbox where unprocessed thoughts live.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  Inbox  [7 items]                    [Filter] [Process]  │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ ⊕ Quick capture...                          ^Space  ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │▎● Research competitor pricing...                    ││
│  │▎  [AI: Backlog ★]                           2m ago  ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │▎● Call dentist to reschedule...                     ││
│  │▎  [AI: Waiting ★]                          15m ago  ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │▎● Idea: weekly digest email...                      ││
│  │▎  [AI: Incubating ★]                        1h ago  ││
│  └──────────────────────────────────────────────────────┘│
│  ...                                                     │
└──────────────────────────────────────────────────────────┘
```

### Features
- Title "Inbox" in capture blue
- Item count badge
- Quick capture input at top (blue border accent)
- Filter button (dropdown: by source, by date)
- "Process All" primary button → navigates to Process page in Focus mode
- Each card:
  - 3px left border in capture blue
  - Item title
  - AI destination suggestion badge (if available) with confidence
  - Source indicator (Manual, Telegram, Chrome extension, Voice)
  - Timestamp
  - Hover: shows action buttons (AI suggest, move to destination, delete)
- Bulk AI Actions dropdown (top right area)
- Real-time updates via Supabase subscription
- Empty state: "Your inbox is clear!" with illustration

### Data Required
- Items WHERE layer = 'capture', ordered by created_at DESC
- Destinations list
- Spaces and projects (for move actions)

---

## Screen 3: Process (`/process`)

Where items get organized into destinations.

### View Toggle
Three views available, switchable via toggle buttons in the header area:
- **Focus** (default) - Tinder-style one-at-a-time
- **Kanban** - Drag-and-drop columns by destination
- **List** - Simple list grouped by destination
- **Table** - Spreadsheet-style view with columns for title, destination, space, project, dates

### Focus View (Default)

```
┌──────────────────────────────────────────────────────────┐
│  Process  [3 of 7]              [Focus] [Kanban] [List]  │
│                                                          │
│              ┌──────────────────────────┐                │
│              │ ○ PROCESSING ITEM        │                │
│              │                          │                │
│              │ Research competitor       │                │
│              │ pricing models for       │                │
│              │ OffMind launch           │                │
│              │                          │                │
│              │ Notes preview text...    │                │
│              │                          │                │
│              │ Where does this belong?  │                │
│              │                          │                │
│              │ [★Backlog] [Reference]   │                │
│              │ [Incubating] [Someday]   │                │
│              │ [Questions] [Waiting]    │                │
│              │ [Trash]                  │                │
│              │                          │                │
│              │ [Assign Space] [Project] │                │
│              │                          │                │
│              │──────────────────────────│                │
│              │ 3/7      [Skip] [Confirm]│                │
│              └──────────────────────────┘                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### Focus View Features
- Single card centered, max-width ~480px
- Amber border accent (process layer)
- Progress counter: "3 / 7 items"
- Item title (large, bold)
- Item notes preview
- Destination grid: all available destinations as buttons
  - AI-suggested destination highlighted with teal accent + star icon
  - Other destinations in default ghost style
- "Assign Space" and "Add to Project" buttons
- Skip button (ghost), Confirm & Next button (primary teal)
- Keyboard shortcuts: 1-9 for destinations, S for schedule, D for delete, → for skip
- Animation: current card slides out, next slides in
- Empty state: "Inbox clear!" with celebration

### Kanban View

```
┌─────────────────────────────────────────────────────────────────┐
│  Process  [15 items]                [Focus] [Kanban] [List]     │
│                                                                  │
│  Backlog     │ Reference  │ Incubating │ Waiting   │ Someday    │
│  ──────────  │ ──────────  │ ──────────  │ ──────── │ ──────────│
│  ┌────────┐  │ ┌────────┐  │ ┌────────┐  │          │           │
│  │ Item 1 │  │ │ Item 4 │  │ │ Item 6 │  │          │           │
│  └────────┘  │ └────────┘  │ └────────┘  │          │           │
│  ┌────────┐  │ ┌────────┐  │             │          │           │
│  │ Item 2 │  │ │ Item 5 │  │             │          │           │
│  └────────┘  │ └────────┘  │             │          │           │
│  ┌────────┐  │             │             │          │           │
│  │ Item 3 │  │             │             │          │           │
│  └────────┘  │             │             │          │           │
└─────────────────────────────────────────────────────────────────┘
```

- Drag and drop between columns (@dnd-kit)
- Each column has destination name + count
- Cards show title, notes preview, action buttons on hover
- Quick schedule button per card
- Uncategorized column for items without destination

### List View
- Items grouped by destination in collapsible sections
- Each section: destination name with color dot + count
- Items: checkbox, title, notes preview, actions

### Table View
- Spreadsheet-style with sortable/filterable columns:
  - Title
  - Destination (color-coded tag)
  - Space
  - Project
  - Created date
  - Source
- Click row to open item detail panel
- Inline editing where possible

### Data Required
- Items WHERE layer = 'process', ordered by updated_at DESC
- Destinations list
- Spaces and projects

---

## Screen 4: Commit (`/commit`)

Calendar/schedule view for committed tasks.

### View Toggle
- **Agenda** (default) - Chronological list grouped by date
- **Day** - Single day with time slots
- **Week** - 7-day grid

### Agenda View

```
┌──────────────────────────────────────────────────────────┐
│  Committed  [5 today]          [Agenda] [Day] [Week]     │
│                                                          │
│  [Today] [This Week] [Upcoming]                          │
│                                                          │
│  TODAY — Thursday, Feb 6                                 │
│  ┌──────────────────────────────────────────────────────┐│
│  │▎☐ Write product brief     Friday · Work · OffMind   ││
│  │▎                                       [Questions]  ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │▎☑ Review auth middleware   Done 2h ago              ││
│  │▎                                       [Reference]  ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │▎☐ Call dentist             Today · Personal         ││
│  │▎                                        [Waiting]   ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  TOMORROW — Friday, Feb 7                               │
│  ┌──────────────────────────────────────────────────────┐│
│  │▎☐ Investor meeting prep    9:00 AM · Work           ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  [Google Calendar events shown inline with subtle        │
│   different styling - dashed border, external icon]      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Features
- Commit green title
- Count badge (today's items)
- Time filter tabs: Today, This Week, Upcoming
- Date navigation: ← Today → buttons
- Items grouped by date with date headers
- Each item:
  - 3px left border in commit green
  - Checkbox (circle style, green when checked)
  - Title (strikethrough when complete)
  - Due date/time, space, project metadata
  - Destination tag
  - Hover: reschedule dropdown, unschedule, delete
- Completed items: muted styling, checked circle
- Reschedule options: Today, Tomorrow, Next week, Pick date
- Unschedule: moves back to process layer
- Google Calendar events: displayed with dashed border + external link icon
- Bulk AI: suggest schedule for unscheduled process items

### Day View
- 24-hour time grid (scrollable)
- Tasks placed at their scheduled times
- Google Calendar events shown alongside
- Click empty slot to schedule an item

### Week View
- 7-column grid (Mon-Sun)
- Date headers with day name and number
- Tasks as small cards in day columns
- Drag to reschedule between days

### Data Required
- Items WHERE layer = 'commit', ordered by scheduled_at
- Google Calendar events (via API integration)
- Destinations for tags

---

## Screen 5: Spaces (`/spaces`)

### List View

```
┌──────────────────────────────────────────────────────────┐
│  Spaces                                    [+ New Space] │
│                                                          │
│  ┌──────────────────┐ ┌──────────────────┐               │
│  │ ● Work           │ │ ● Personal       │               │
│  │ 3 projects       │ │ 1 project        │               │
│  │ 12 items         │ │ 5 items          │               │
│  └──────────────────┘ └──────────────────┘               │
│  ┌──────────────────┐                                    │
│  │ ● Side Projects  │                                    │
│  │ 2 projects       │                                    │
│  │ 8 items          │                                    │
│  └──────────────────┘                                    │
└──────────────────────────────────────────────────────────┘
```

- Grid of space cards
- Each card: color dot, name, project count, item count
- Click → space detail
- Create dialog: name, icon picker, color picker

### Space Detail (`/spaces/[id]`)
- Space name with color dot
- Projects in this space
- All items in this space (across all layers)
- Filter by layer, destination
- Edit/delete space

---

## Screen 6: Projects (`/projects`)

### List View
- Projects grouped by space
- "Unassigned" section for projects without a space
- Each project card: icon, name, description preview, item count, space badge
- Create dialog: name, description, icon, color, space assignment

### Project Detail (`/projects/[id]`)
- Project name with icon
- Description
- Items in this project (across all layers)
- Filter by layer, destination
- Progress indicator (completed / total)
- Edit/archive/delete

---

## Screen 7: Pages (`/pages`)

### List View
- Grid of page cards (3 columns)
- Search bar at top
- Filter by space, project
- Each card: page icon/emoji, title, last updated, space/project badges, favorite star
- Create button: creates "Untitled" page and opens editor

### Page Editor (`/pages/[id]`)
- Full Tiptap rich text editor
- Title field (large, editable)
- Toolbar: formatting, headings, lists, code, links, images
- Space/project assignment dropdowns
- Favorite toggle
- Auto-save
- Breadcrumb: Pages > [Page Title]

---

## Screen 8: Settings (`/settings`)

Sections stacked vertically:

1. **Subscription** - Current plan, upgrade button, Stripe portal link
2. **Telegram Bot** - Connection status, generate code, instructions
3. **Browser Extension** - API key generation, copy, revoke
4. **Profile** - Email (read-only), full name (editable)
5. **Appearance** - Theme toggle (dark/light/system)
6. **Destinations** - List all, create custom, edit (icon, color, name), delete custom
7. **Danger Zone** - Sign out button

---

## Screen 9: Search (`/search`)

- Triggered from Command Palette or dedicated route
- Full-text search across items, pages, projects
- Results grouped by type
- Click result to navigate

---

## Screen 10: Command Palette (Overlay, Cmd+K)

- Modal overlay with search input
- Quick actions: New Item, New Page, Settings
- Navigation: Home, Capture, Process, Commit, Spaces, Projects, Pages
- Search results: items, pages, projects matching query
- Keyboard navigable (arrow keys + enter)

---

## Screen 11: AI Assistant (Overlay, Cmd+J)

- Modal overlay
- Action cards:
  1. Smart Capture - input + auto-categorize
  2. Expand Notes - brief → detailed
  3. Extract Date - natural language → date
  4. Brainstorm - topic → ideas list
  5. Daily Summary - generate today's focus (NEW)
  6. Natural Language Create - "remind me to..." → creates item (NEW)
- Each action: input → result → copy/apply/new

---

## Screen 12: Landing Page (`/`)

- Hero: "Clear your mind. Own your day." with teal gradient on key phrase
- Subtitle: "The calm productivity system for overthinkers"
- CTA: "Get Started Free" + "Watch Demo"
- How it works: 3-step (Capture → Process → Commit) with layer colors
- Features grid: AI Processing, Spaces & Projects, Rich Pages, Quick Capture (all channels), Privacy, Time Blocking
- "For Overthinkers" section
- Pricing: Free ($0) and Pro ($9/mo) with feature comparison
- Waitlist/signup CTA
- Footer

---

## Screen 13: Auth Pages (`/login`, `/signup`)

- Centered card layout
- OffMind logo + name at top
- Tabs: Password / Magic Link
- Form fields with validation
- Error/success messages
- Link to alternate page (login ↔ signup)
- "14-day free trial" messaging on signup

---

## Mobile / Responsive

- Sidebar hidden, replaced by hamburger menu (Sheet/drawer)
- Header: hamburger + logo + avatar
- Capture bar: full width, fixed bottom
- Cards: single column
- Process Focus: full screen card
- Kanban: horizontal scroll
- Table: horizontal scroll with sticky first column
- All modals: full screen on mobile
