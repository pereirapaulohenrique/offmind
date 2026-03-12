# OffMind Design System

> Updated: 2026-03-12. Supersedes all prior design tokens (zinc+teal, warm charcoal+terracotta v1).
> Visual reference: `tinker/design-reference.html`

## Philosophy

OffMind's design is **light but precise**. The app should feel like a quiet room where you think clearly — warm, calm, and crafted. Every element earns its place. Color is used intentionally: terracotta for interactivity and brand accent, warm neutrals for surfaces, and functional colors for workflow context.

The design draws from warm minimal productivity tools (mymind, Craft energy) rather than cold SaaS dashboards (Linear, Vercel). White cards with real shadows on warm cream backgrounds create depth hierarchy. Spacing, shadows, and surface layers do the work — not aggressive color.

Light mode is the flagship experience. Dark mode uses warm charcoal tones (not cool zinc).

---

## Color Tokens

### Accent

Terracotta `#c27a5a` — unique in the competitive space (competitors cluster on blue/purple/green). Connects to clay, craft, warmth, and the Caregiver archetype.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--accent` | `#c27a5a` | `#c27a5a` | Primary accent |
| `--accent-hover` | `#b06d4f` | `#d4a088` | Hover state |
| `--accent-subtle` | `rgba(194,122,90,0.08)` | `rgba(194,122,90,0.08)` | Subtle backgrounds, badges |
| `--accent-border` | `rgba(194,122,90,0.15)` | `rgba(194,122,90,0.15)` | Accent borders |
| `--accent-text` | `#a65f3e` | `#d4a088` | Text on subtle backgrounds |

### Backgrounds (Light Mode — Flagship)

Warm cream progression. Surface hierarchy: sidebar < page background < elevated cards.

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-sidebar` | `#f4f3f1` | Sidebar background |
| `--bg-base` | `#faf9f7` | Page background |
| `--bg-card` | `#ffffff` | Cards, panels (elevated) |
| `--bg-elevated` | `#ffffff` | Dropdowns, popovers |
| `--bg-hover` | `rgba(0,0,0,0.03)` | Hover states |
| `--bg-active` | `rgba(0,0,0,0.05)` | Active/pressed states |
| `--bg-page` | `#f0efed` | Outer page chrome (if needed) |

### Backgrounds (Dark Mode)

Warm charcoal — 2% warm shift, not cool zinc. Inspired by Claude Desktop's approach.

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-sidebar` | `#141312` | Sidebar background |
| `--bg-base` | `#1a1918` | Page background |
| `--bg-card` | `#1f1e1d` | Cards, panels |
| `--bg-elevated` | `#252423` | Dropdowns, popovers |
| `--bg-hover` | `rgba(255,255,255,0.03)` | Hover states |
| `--bg-active` | `rgba(255,255,255,0.05)` | Active/pressed states |

### Borders

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--border-subtle` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.04)` | Card borders, dividers |
| `--border-default` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.06)` | Input borders, separators |
| `--border-emphasis` | `rgba(0,0,0,0.1)` | `rgba(255,255,255,0.1)` | Focused inputs, hover borders |

### Text

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--text-primary` | `#1c1b1a` | `#ededec` | Headings, body text |
| `--text-secondary` | `#6b6560` | `#8c8680` | Descriptions, labels |
| `--text-muted` | `#8c8680` | `#6b6560` | Placeholders, hints |
| `--text-tertiary` | `#a09890` | `#5a5550` | Timestamps, metadata, disabled |

### Layer Colors (Functional, Not Brand)

These indicate workflow layer context. Never used as general UI accents.

| Layer | Color | Hex | Background | Border |
|-------|-------|-----|------------|--------|
| Capture | Blue | `#60a5fa` | `rgba(96, 165, 250, 0.07)` | `rgba(96, 165, 250, 0.20)` |
| Route | Amber | `#fbbf24` | `rgba(251, 191, 36, 0.07)` | `rgba(251, 191, 36, 0.20)` |
| Compound | Green | `#34d399` | `rgba(52, 211, 153, 0.07)` | `rgba(52, 211, 153, 0.20)` |

### Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--status-active` | `#c27a5a` | Active/new items (terracotta) |
| `--status-pending` | `#e8c95a` | Pending/waiting |
| `--status-neutral` | `#c4bab0` (light) / `#5a5550` (dark) | Unrouted, neutral |
| `--success` | `#34d399` | Completion, success |
| `--warning` | `#fbbf24` | Attention needed |
| `--error` | `#f87171` | Errors, destructive |
| `--info` | `#60a5fa` | Informational |

---

## Typography

### Font Family
- **Primary:** `'DM Sans', system-ui, -apple-system, sans-serif`
- **Monospace:** `'DM Sans', monospace` (keyboard shortcuts, codes)

DM Sans is used for both the product UI and the logo wordmark (Bold 700, all lowercase). Single font family — no secondary display font needed. DM Sans handles both display and body with its optical size axis.

### Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display | 3.25rem | 700 | 1.08 | Landing page hero headline |
| Heading 1 | 1.25rem | 700 | 1.3 | Page titles (Inbox, Pages) |
| Heading 2 | 1.15rem | 600 | 1.4 | Section headers |
| Body | 0.875rem | 400 | 1.5 | Default body text |
| Body Small | 0.8125rem | 400-500 | 1.4 | Card titles, nav items |
| Caption | 0.8rem | 400-500 | 1.4 | Descriptions, card text |
| Label | 0.65rem | 600 | 1.3 | Section labels (uppercase, letter-spacing 0.08em) |
| Tiny | 0.65rem | 500 | 1.2 | Badges, AI confidence, tag text |

### Letter Spacing
- Headings: `-0.01em` to `-0.02em` (slightly tighter)
- Section labels (uppercase): `0.08em` to `0.1em`
- Body: default (0)

---

## Spacing

Follow a 4px base grid. Key values:
- `4px` (1) — Tight gaps
- `8px` (2) — Standard small gap
- `12px` (3) — Card internal gaps
- `16px` (4) — Card padding, section gaps
- `20px` (5) — Content area padding
- `24px` (6) — Section spacing
- `32px` (8) — Large section breaks
- `48px` (12) — Page-level spacing

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `0.35rem` | Tags, badges, tabs |
| `--radius` | `0.5rem` | Nav items, buttons, inputs |
| `--radius-md` | `0.6rem` | CTA buttons |
| `--radius-lg` | `0.75rem` | Cards, capture bar, dropdowns |
| `--radius-xl` | `1rem` | App frame, modals, hero sections |
| `--radius-full` | `9999px` | Avatars, status dots, pills |

---

## Shadows

Light mode uses layered soft shadows for the "light but precise" feeling. Dark mode uses darker, subtler shadows.

| Name | Light | Dark | Usage |
|------|-------|------|-------|
| `--shadow-card` | `0 1px 2px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.03)` | `0 1px 3px rgba(0,0,0,0.2)` | Cards, items |
| `--shadow-card-hover` | `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)` | `0 2px 8px rgba(0,0,0,0.3)` | Card hover state |
| `--shadow-elevated` | `0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06), 0 24px 60px rgba(0,0,0,0.06)` | `0 4px 16px rgba(0,0,0,0.4)` | App frame, modals, dropdowns |
| `--shadow-capture` | `0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)` | `0 1px 3px rgba(0,0,0,0.2)` | Capture bar |

---

## Layout Constants

| Token | Value | Notes |
|-------|-------|-------|
| `--sidebar-width` | `240px` | Expanded sidebar |
| `--sidebar-collapsed` | `68px` | Collapsed sidebar |
| `--content-max-width` | `1400px` | Max content width |
| `--content-padding` | `2rem` | Content area horizontal padding |

---

## Icons

**Library:** [Lucide](https://lucide.dev) — consistent stroke-based icons.

| Context | Icon | Lucide Name |
|---------|------|-------------|
| Inbox | Tray with arrow | `inbox` |
| Quick Capture | Lightning | `zap` |
| Backlog | Archive box | `archive` |
| Ideas | Light bulb | `lightbulb` |
| Questions | Help circle | `help-circle` |
| Schedule | Calendar | `calendar` |
| Pages | File with text | `file-text` |
| Projects | Folder | `folder` |
| Weekly Review | Refresh arrows | `refresh-cw` |
| Settings | Gear | `settings` |
| Search | Magnifying glass | `search` |
| Filters | Sliders | `sliders-horizontal` |
| AI suggestion | Sparkles | `sparkles` |
| Add/Capture | Plus | `plus` |

**Icon styling:**
- Size: `16px` in sidebar, `16px` in toolbar buttons
- Stroke: `currentColor`, width `1.75`
- Fill: `none`
- Opacity: `0.5` default, `0.8` active

---

## Component Patterns

### Buttons

**Primary (terracotta):**
- Background: `var(--accent)`
- Text: `#ffffff`
- Hover: `var(--accent-hover)`
- Border radius: `var(--radius)`
- Padding: `0.4rem 1rem`
- Font: 0.8rem, weight 600

**Ghost/Secondary:**
- Background: transparent
- Border: `1px solid var(--border-default)`
- Text: `var(--text-secondary)`
- Hover: background `var(--bg-hover)`, border `var(--border-emphasis)`

**Destructive:**
- Background: `rgba(248, 113, 113, 0.1)`
- Text: `var(--error)`
- Border: `1px solid rgba(248, 113, 113, 0.2)`

### Cards

- Background: `var(--bg-card)`
- Border: `1px solid var(--border-subtle)`
- Border radius: `var(--radius-lg)` (0.75rem)
- Padding: `1rem 1.25rem`
- Shadow: `var(--shadow-card)`
- Hover: shadow `var(--shadow-card-hover)`, border `var(--border-emphasis)`

### Navigation Items

- Padding: `0.45rem 0.75rem`
- Border radius: `var(--radius)` (0.5rem)
- Font: 0.8125rem, weight 400
- Color: `var(--text-secondary)`
- Hover: background `var(--bg-hover)`
- Active: background `var(--accent-subtle)`, font-weight 600, color `var(--text-primary)`

### Capture Bar

- Position: bottom of content area
- Background: `var(--bg-card)`
- Border: `1px solid var(--border-default)`
- Border radius: `var(--radius-lg)` (0.75rem)
- Shadow: `var(--shadow-capture)`
- Hover: border `var(--border-emphasis)`, enhanced shadow
- Placeholder: `var(--text-muted)`
- Keyboard shortcut badge in top-right

### AI Suggestion Badges

- Background: `var(--accent-subtle)`
- Text: `var(--accent-text)`
- Border radius: `var(--radius-full)` (pill)
- Font: 0.65rem, weight 500
- Icon: Lucide `sparkles` at 12px

### Tags

- Font: 0.65rem, weight 500
- Padding: `0.15rem 0.55rem`
- Border radius: `var(--radius-sm)`
- Default: border `var(--border-default)`, bg `rgba(0,0,0,0.02)`, text `var(--text-secondary)`
- Accent tag: bg `var(--accent-subtle)`, text `var(--accent-text)`, no border

---

## Animation Guidelines

All animations use Framer Motion. Keep them **subtle and fast**.

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Page transition | 200ms | ease-out | fadeIn on route change |
| Card hover | 150ms | ease | Shadow + border change |
| Card enter (list) | 150ms | ease-out | fadeIn + slideUp, staggered 30ms |
| Sidebar expand | 200ms | ease-in-out | Width transition |
| Modal open | 200ms | spring | Scale + fade |
| Toast | 200ms | ease | SlideUp from bottom |

**Rules:**
- No animation longer than 300ms
- No bouncy springs (calm, not playful)
- Stagger list items at 30ms intervals max
- Prefer opacity + translateY over scale for list items

---

## Dark / Light Mode Implementation

- Use CSS custom properties for ALL colors
- Light mode is default (`:root`)
- Dark mode via `html.dark` class or `.dark-frame` context
- Toggle in Settings (localStorage + user profile)
- Respect `prefers-color-scheme` on first visit
- All tokens defined in globals.css with light/dark variants

---

## Logo

The OffMind logo is an **open loop** mark — a soft, organic circle with an intentional opening. It represents thoughts finding their way out, the moment of clarity, the Caregiver gently guiding.

**Mark:**
- Open loop with humanist feel (uneven, organic, not geometric)
- Monochrome: dark `#333332` on light backgrounds, `#ededec` on dark backgrounds
- Terracotta lives in the UI (buttons, badges, status dots), not the logo
- Source SVG: `offmind-logo-2.svg` (clean/flat, no gradients)
- Scales from 16px favicon to full-width hero

**Wordmark:**
- "offmind" in DM Sans Bold (700), all lowercase
- Letter-spacing: `-0.01em`
- Color: inherits from context (dark on light, light on dark)

**Usage:**
- Sidebar: mark (26px) + wordmark text
- Landing page: mark + wordmark centered above hero
- Favicon: mark only, simplified at 16px
- Auth pages: mark + wordmark
- Email: mark + wordmark

**Files:**
- Production SVG: `offmind-logo-2.svg` (Downloads, to be moved to `/public`)
- Design reference: `tinker/design-reference.html`
