# OffMind: Item Evolution Roadmap

> "Items should grow, not just move." The evolution layer where raw thoughts mature into valuable outputs.

## Vision

OffMind's core promise: zero-friction capture with a complete processing pipeline so every capture reaches its highest potential. Phase 1 (routing to destinations) is done. This roadmap covers everything needed to make items **evolve** after routing.

---

## 1. Destination-Contextual Interaction

When you open an item from different destinations, the page adapts its tools:

### Backlog — Task Management Mode
- Subtasks / checklist with progress bar (3/7)
- Priority selector (Low, Medium, High, Urgent)
- Effort estimate (Quick, Small, Medium, Large)
- Quick actions: "Schedule it", "Convert to Project", "Start a Page"

### Schedule — Time Management Mode
- Calendar placement (date + time range)
- Recurrence (daily, weekly, custom)
- Quick actions: "Done", "Reschedule", "Defer to Backlog"
- Post-completion prompt: "Create meeting notes?" -> spawns a Page

### Waiting For — Follow-up Mode
- Contact field with autocomplete
- Expected response date + overdue indicator
- Follow-up reminder scheduling
- "Response received" -> triggers routing to next destination
- Mini communication log (timestamped notes thread)

### Someday/Maybe — Incubation Mode
- Review date ("reconsider on March 15")
- Maturity indicator: Raw Idea -> Developing -> Ready to Act
- "Promote to Backlog" one-click
- Related ideas clustering

### Reference — Knowledge Mode
- Rich notes or link to a Page
- Tags for retrieval
- Source/origin tracking
- "Expand into Page" for deeper writing

### Questions — Inquiry Mode
- Dedicated "Answer" field (separate from notes)
- "Answered" action -> routes the answer to Reference or a Page
- Research notes area

---

## 2. The Growth Path: Item -> Task -> Project -> Page

Items have a natural evolution:

```
Capture (raw thought)
  |
Task (actionable, in Backlog/Schedule)
  |
Project (complex, multi-step, has subtasks)
  |
Page (the output — a document, plan, article, decision)
```

Not every item follows the full path. A grocery list stays a task. But a startup idea might go: capture -> someday -> backlog task -> project with subtasks -> multiple pages (business plan, pitch deck, research).

### Key actions at each stage:
- **"Add subtasks"** — any item can grow a checklist. When subtasks > 5 or complexity warrants it, offer "Convert to Project"
- **"Convert to Project"** — item becomes a project within a Space, inherits title/notes/subtasks, original item links back
- **"Start a Page"** — item spawns a Page pre-filled with its content. The item keeps a link to "its" page. The page shows "born from [item]"

---

## 3. Pages as the Output Layer

Pages are where thoughts become *real things*. The integration with items is bidirectional.

**Items are seeds, Pages are fruits.**

### Item -> Page:
- Any item has a "Start Page" action
- Page is pre-seeded with item title + notes
- Destination-aware templates:
  - Schedule item -> Meeting Notes template
  - Backlog item -> Task Brief template
  - Question -> Research Document template
- The item keeps a `page_id` reference — visible as a chip: "Linked Page"

### Page -> Items:
- Pages have a "Linked Items" sidebar section showing all items that contributed
- From within a Page, you can create new items (action items from meeting notes)
- Items created from a Page inherit its project/space context

---

## 4. Item Relations

- **"Related to"** soft links between items
- **"Blocked by / Blocks"** hard dependencies
- When viewing an item, see its constellation of related items
- AI can suggest: "This looks related to 3 other items about X"

---

## 5. AI-Powered Evolution

- AI suggests when a Someday item seems "ready" based on recent activity
- AI offers to break complex tasks into subtasks
- AI drafts a Page from accumulated notes + subtasks
- AI identifies clusters: "You have 5 captures about marketing — combine into a project?"
- **Always suggesting, never acting autonomously — user decides**

---

## 6. Weekly Review (GTD Ritual)

Guided flow:
1. Inbox zero check
2. Backlog priority review
3. Someday/Maybe reconsider
4. Waiting For follow-ups
5. Schedule next week

Includes completion celebration + streak tracking. This is where OffMind becomes a *practice*, not just a tool.

---

## 7. Enhanced Destination Dashboards

### Backlog
- View modes: List (grouped by project/priority), Board (Kanban by priority)
- Subtask progress bars on cards
- Stats header: total items, overdue, completed this week

### Schedule
- Unscheduled items sidebar (drag onto calendar)
- Agenda view alongside calendar

### Waiting For
- Overdue highlighting
- "Days waiting" indicator
- Contact summary cards at top

---

## 8. Architecture Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Item detail route | `/items/[id]` (not `/backlog/[id]`) | Items move between destinations — URL stays stable |
| Triage vs deep work | ProcessingPanel for Inbox/Organize; full page for everything else | Inbox is fast triage (panel is perfect). Post-routing needs room. |
| Item page structure | Single adaptive page with contextual sections | One component, not six. Reads destination and renders accordingly. |
| Subtask storage | Separate `subtasks` table | Simpler than items, avoids polluting items queries |
| Page linking | Bidirectional via `pages.item_id` FK | Already existed in schema |

---

## Implementation Status

### Phase 1 — Foundation (DONE)
- [x] Subtasks table + Zustand store + CRUD components
- [x] `/items/[id]` adaptive detail page (centered single-column)
- [x] Destination-specific fields (Priority, Effort, Waiting For, Follow Up, etc.)
- [x] "Start a Page" + bidirectional item-page linking
- [x] Navigation: Backlog, Schedule, Waiting For, Organize -> `/items/[id]`
- [x] ProcessingPanel preserved for Inbox/Organize triage
- [x] "Move to another destination" dropdown (replaces grid)
- [x] Items clickable from Spaces and Projects detail pages
- [x] TiptapEditor prose rendering fix (custom CSS styles)
- [x] Multi-column field layout (destination fields + schedule/organize side-by-side)

### Phase 2 — Deeper Contextual Features (DONE)
- [x] Multi-column field layout (reduce scrolling)
- [x] Recurrence for scheduled items (daily, weekdays, weekly, biweekly, monthly + auto-create next occurrence)
- [x] Post-completion prompts ("Create meeting notes?" / "Create follow-up?")
- [x] Maturity indicator for Someday/Maybe
- [ ] Communication log / follow-up thread for Waiting For
- [x] Overdue indicators on Waiting For dashboard
- [x] Destination-aware Page templates (Meeting Notes, Task Brief, Research, Reference)

### Phase 3 — Growth Path (DONE)
- [x] "Convert to Project" action (item -> project with inherited data)
- [x] Item Relations ("Related to", "Blocked by / Blocks") — search, add, remove, visual grouping
- [x] Promote subtasks to standalone items
- [x] "Born from" breadcrumb on Pages
- [x] "Promote to Backlog" one-click for Someday/Maybe items

### Phase 4 — Weekly Review (DONE)
- [x] Guided review flow UI (7-step wizard with step indicator)
- [x] Inbox zero check
- [x] Backlog priority review (inline priority picker + stale item archival)
- [x] Someday/Maybe reconsider (promote to backlog, keep, archive)
- [x] Waiting For follow-ups audit (follow-up sent, response received, extend +7d)
- [x] Schedule next week planning (overdue items, grouped schedule, inline date picker)
- [x] Streak tracking + celebration (profile.settings.review_streak, motivational messages)
- [x] Sidebar "Weekly Review" nav link under new "Tools" section

### Phase 5 — AI Evolution
- [ ] AI suggests Someday promotions
- [ ] AI breaks complex tasks into subtasks
- [ ] AI drafts Pages from accumulated notes
- [ ] AI identifies item clusters for project creation
- [ ] Always suggesting, user decides

### Phase 6 — Enhanced Dashboards (DONE)
- [x] Backlog: Board view (Kanban by priority)
- [x] Backlog: Stats header (total, priority count, triage needed)
- [x] Schedule: Unscheduled items sidebar (quick-schedule: today/tomorrow/next week/pick date)
- [x] Schedule: Agenda view (already existed, sidebar enhancement added)
- [x] Waiting For: Contact summary cards
- [x] Waiting For: "Days waiting" indicator
- [x] Waiting For: Overdue highlighting + follow-up date display
