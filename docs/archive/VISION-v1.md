# OffMind — Product Vision

**Created:** 2026-03-11
**Status:** Active — directional, not specification
**Positioning reference:** `~/.vault/projects/offmind-dev/positioning.md`
**Brand strategy reference:** `~/.vault/projects/offmind-dev/brand-strategy.md`

---

## The One-Sentence Vision

**OffMind is a personal workspace that learns how you think and builds the structure you need.**

---

## The Problem (Why OffMind Exists)

People who think constantly — entrepreneurs, creators, knowledge workers — face a split market:

- **Fast capture, no evolution.** Apple Notes, Bear, Google Keep. Thoughts enter but never grow. 2,000 notes and nothing to show for it.
- **Powerful organization, high friction.** Notion, Obsidian, Tana. Thoughts could grow, but most people abandon the system before it works. 30+ minutes of setup before a single capture.

Nobody bridges both. The gap between "capture instantly" and "organize powerfully" is where every tool fails — and where OffMind lives.

---

## The Core Mechanic: Compound Thinking

OffMind's value comes from a 3-layer pipeline:

```
CAPTURE  →  ORGANIZE  →  COMMIT
(grab it)   (route it)   (do it)
```

**Capture:** Zero-friction. Any thought in seconds. No decisions at capture time.

**Organize:** Route items to destinations that match their nature (Backlog, Schedule, Questions, Reference, Someday/Maybe, custom). Organize into Spaces and Projects. Items evolve from sentences into rich pages.

**Commit:** Today view. Schedule. Time-committed actions. The bridge from "organized thinking" to "real-world doing."

What makes this a compound mechanic (not just a pipeline):
- Items don't just move — they **grow**. A sentence becomes subtasks, becomes a project, becomes a page.
- Destinations aren't folders — they're **behavioral contexts**. Items adapt their tools based on where they live.
- Weekly review **resurfaces what's dying**. Nothing stays buried. Every thought gets its moment.
- Over time, your workspace reflects your actual thinking patterns — not a template you copied.

---

## The Vision Gap: From "You Organize" to "The System Organizes"

Today, OffMind's pipeline works but requires the user to do all the organizing. The system provides containers; the user fills them. This is simpler than Notion's upfront system design — but it's still manual work deferred.

The vision is a system that **creates structure from your behavior**:

### Level 1: Pattern Recognition
The system notices what you're doing and suggests structure.

- After many items, AI detects themes and suggests projects. One confirmation → project created with related items routed.
- As you confirm AI routing suggestions, the system learns your patterns. Confidence rises. High-confidence items get auto-routed with an undo option.
- Stale items get surfaced proactively, not just during weekly review.
- The system suggests new destinations based on emerging patterns in your captures.

### Level 2: Structure Generation
The system builds what you need before you know you need it.

- Auto-generated dashboards based on your actual usage — project health, stale items, upcoming deadlines, destination balance. No design required.
- When items accumulate enough context (subtasks, links, related items), the system offers to scaffold a page with everything connected.
- Weekly review adapts to your patterns — focuses on where you're falling behind, not a generic checklist.
- Spaces and projects get suggested structure based on common patterns (a "Work" space might get Meeting Notes, Follow-ups, Decisions as suggested destinations).

### Level 3: Compound Intelligence
The system connects dots you haven't connected yet.

- Cross-item synthesis: "You captured 5 thoughts this month about X. Here's a summary page connecting them."
- Temporal patterns: "You plan best on Mondays. You capture most on commutes. Here's your rhythm."
- Knowledge emergence: when enough items accumulate on a topic, the system generates a knowledge map — everything you know about that topic, assembled from fragments.
- The weekly review becomes a thinking partner: "You said you'd decide on X by Friday. Here's what you've captured about it since then."

**These levels are directional, not specified.** The exact implementation needs deeper product thinking. What matters is the trajectory: from "user organizes manually" → "system learns and proposes structure" → "system synthesizes knowledge."

---

## What This Means for the Product

### The Differentiator Against Notion

Notion: "Here are powerful blocks. Build whatever you want."
OffMind: "Just dump everything in. We'll build the structure together."

This is not "simpler Notion." It's a fundamentally different relationship between user and tool. Notion assumes the user is an architect. OffMind assumes the user is a thinker who needs an architect.

### The AI Stance (Unchanged)

AI proposes, user decides. Always. Even at Level 3, the system suggests synthesis — it doesn't reorganize without consent. The trust model is sacred.

But the *quality and ambition* of what AI proposes increases dramatically:
- Level 0 (today): "Route this to Backlog?"
- Level 1: "Create a project called 'Apartment Search' with these 8 related items?"
- Level 2: "Here's a dashboard for your Work space based on your patterns."
- Level 3: "You've been thinking about career transition for 3 weeks. Here's everything you've captured, synthesized."

### The Emotional Arc

The user journey maps to the brand's emotional territory:

1. **First session:** Relief. "I captured 10 thoughts in 2 minutes. They're safe."
2. **First week:** Confidence. "I can see where everything is. Nothing is lost."
3. **First month:** Trust. "The system knows my patterns. It's suggesting things I would have done myself."
4. **Ongoing:** Partnership. "My workspace reflects how I think. It grows with me."

This is the transition from **scattered anxiety** to **calm confidence** — the emotional territory OffMind owns.

---

## What This Means for the Brand

### Logo Direction

The logo must express this vision, not just the current product:

**Must communicate:**
- Transition (scattered → settled)
- Living system (grows, not stores)
- Warmth (Caregiver archetype — quiet guardian)
- Simplicity that contains depth

**Must avoid:**
- Precision/rigidity (crystals, geometric shapes) — Obsidian territory
- Power/achievement (bold marks, sharp angles) — Todoist territory
- AI/tech signaling (gradients, orbs) — Mem territory
- Completion symbols (checkmarks, boxes) — task manager territory
- Monochrome coldness — Notion territory

### Competitive White Space

From analysis of 18 competitor logos: nobody in this space expresses warmth, organic growth, or emotional transition. The category is cold, geometric, and technical. The Caregiver archetype is completely unclaimed.

Full competitive analysis: see logo-ideation session notes.

### Color Territory

Warm teal is directionally correct — calming, natural, unclaimed by direct competitors. Should lean slightly warmer (green-teal over blue-teal). Consider warm neutrals (sand, warm gray) as complement.

---

## Principles

1. **Capture is sacred.** Nothing should ever slow down the moment of capture.
2. **Structure is earned, not demanded.** The system builds structure from behavior, never requires it upfront.
3. **AI serves, never controls.** Every AI action is a proposal. The user decides.
4. **Nothing dies.** Every thought captured gets its moment — through reviews, surfacing, and connections.
5. **Simple to start, deep when ready.** Day 1 is effortless. Month 3 is powerful. The system reveals depth progressively.
6. **Your workspace, your thinking.** No templates, no "best practices" imposed. The structure that emerges is yours — shaped by how you actually think, not how someone else thinks you should.

---

## Open Questions (For Future Product Sessions)

- How exactly does Level 1 auto-clustering work at the UX level? What's the trigger, the UI, the confirmation flow?
- Where's the line between helpful proactive suggestions and annoying notifications?
- How does the system handle users who WANT manual control and don't want AI structure suggestions?
- What data does the system need to collect to enable Level 2/3? Privacy implications?
- How do we communicate the compound mechanic on the landing page without jargon?
- When does OffMind migrate from "personal workspace" to "thinking workspace" category? What triggers the shift?
