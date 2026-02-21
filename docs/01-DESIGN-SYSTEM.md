# OffMind Design System

## Philosophy

OffMind's design is **calm, premium, and focused**. The app should feel like a quiet room where you think clearly - not a dashboard screaming for attention. Every element earns its place. Color is used intentionally: teal for the brand, layer colors for workflow context, and warm neutrals for everything else.

Dark mode is the flagship experience. Light mode is fully supported from day one for non-tech users.

---

## Color Tokens

### Backgrounds (Dark Mode)

Warm charcoal - not cold zinc, not hot amber. Subtly warm to feel human without being distracting.

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-base` | `#0e0e11` | Page background |
| `--bg-surface` | `#141418` | Sidebar, panels |
| `--bg-elevated` | `#1b1b20` | Cards, dropdowns |
| `--bg-hover` | `#222228` | Hover states |
| `--bg-active` | `#2c2c34` | Active/pressed states |
| `--bg-card` | `#18181d` | Card backgrounds |

### Backgrounds (Light Mode)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-base` | `#fafaf9` | Page background (warm white) |
| `--bg-surface` | `#f5f5f3` | Sidebar, panels |
| `--bg-elevated` | `#ffffff` | Cards, dropdowns |
| `--bg-hover` | `#f0f0ed` | Hover states |
| `--bg-active` | `#e8e8e4` | Active/pressed states |
| `--bg-card` | `#ffffff` | Card backgrounds |

### Borders

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--border-subtle` | `#1f1f27` | `#f0f0ed` | Dividers, subtle separators |
| `--border-default` | `#2a2a33` | `#e5e5e0` | Card borders, inputs |
| `--border-emphasis` | `#3d3d4a` | `#d4d4ce` | Focused inputs, emphasis |

### Text

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--text-primary` | `#ededf0` | `#1a1a1e` | Headings, body text |
| `--text-secondary` | `#9e9eac` | `#6b6b78` | Descriptions, labels |
| `--text-muted` | `#6a6a78` | `#9e9eac` | Placeholders, hints |
| `--text-disabled` | `#484854` | `#c4c4cc` | Disabled elements |

### Hybrid Accent System (Teal + Terracotta)

OffMind uses a **dual-accent system** where color carries intent:

- **Teal (`--accent-*`)** = Product UI. Navigation, AI indicators, focus states, interactive controls, progress, checkboxes, selection. The product's interactive personality.
- **Terracotta (`--cta-*`)** = CTA/Marketing. Conversion buttons, landing page badges, pricing CTAs, waitlist forms, email templates. Warmth that drives action.

The logo bridges both colors with a teal-to-terracotta gradient.

#### Product Accent (Teal)

Used for: active navigation, focus rings, links, interactive highlights, capture bar glow, AI feature indicators, checkboxes, toggles, progress bars.

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--accent-base` | `#2dd4bf` | `#0d9488` | Primary accent |
| `--accent-hover` | `#5eead4` | `#14b8a6` | Hover state |
| `--accent-active` | `#14b8a6` | `#0f766e` | Pressed state |
| `--accent-subtle` | `rgba(45, 212, 191, 0.10)` | `rgba(13, 148, 136, 0.06)` | Subtle backgrounds |
| `--accent-border` | `rgba(45, 212, 191, 0.25)` | `rgba(13, 148, 136, 0.22)` | Accent borders |
| `--accent-glow` | `rgba(45, 212, 191, 0.08)` | `rgba(13, 148, 136, 0.08)` | Glow/shadow effects |

#### CTA Accent (Terracotta)

Used for: CTA buttons on landing page, pricing section buttons, waitlist form submit, "EARLY BIRD" badges, step number badges, marketing emails.

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--cta-base` | `#c2410c` | `#b93d0a` | CTA buttons |
| `--cta-hover` | `#ea580c` | `#d4520f` | Hover state |
| `--cta-active` | `#9a3412` | `#9a3412` | Pressed state |
| `--cta-subtle` | `rgba(194, 65, 12, 0.10)` | `rgba(185, 61, 10, 0.06)` | Badge backgrounds |
| `--cta-border` | `rgba(194, 65, 12, 0.25)` | `rgba(185, 61, 10, 0.22)` | CTA borders |
| `--cta-glow` | `rgba(194, 65, 12, 0.08)` | `rgba(185, 61, 10, 0.08)` | CTA glow effects |

#### Gradient Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--gradient-accent` | `linear-gradient(135deg, teal-base, teal-hover)` | Product UI gradients |
| `--gradient-cta` | `linear-gradient(135deg, terracotta-base, terracotta-hover)` | CTA button gradients |

### Layer Colors (Functional, Not Brand)

These are strictly functional - they indicate which workflow layer an item belongs to. They should NEVER be used as general UI accents.

| Layer | Color | Hex | Background | Border |
|-------|-------|-----|------------|--------|
| Capture | Blue | `#60a5fa` | `rgba(96, 165, 250, 0.07)` | `rgba(96, 165, 250, 0.20)` |
| Process | Amber | `#fbbf24` | `rgba(251, 191, 36, 0.07)` | `rgba(251, 191, 36, 0.20)` |
| Commit | Green | `#34d399` | `rgba(52, 211, 153, 0.07)` | `rgba(52, 211, 153, 0.20)` |

In light mode, layer backgrounds increase opacity to `0.08` and borders to `0.25` for visibility.

### Destination Colors

| Destination | Color | Hex |
|-------------|-------|-----|
| Backlog | Blue | `#60a5fa` |
| Reference | Purple | `#a78bfa` |
| Incubating | Amber | `#fbbf24` |
| Someday | Gray | `#6b7280` |
| Questions | Pink | `#f472b6` |
| Waiting | Orange | `#fb923c` |
| Trash | Red | `#f87171` |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#34d399` | Success states, completion |
| `--warning` | `#fbbf24` | Warnings, attention needed |
| `--error` | `#f87171` | Errors, destructive actions |
| `--info` | `#60a5fa` | Informational |

---

## Typography

### Font Family
- **Primary:** `'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif`
- **Monospace:** `'Geist Mono', monospace` (for code, keyboard shortcuts)

### Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display | 28px | 700 | 1.2 | Landing page hero |
| Heading 1 | 22px | 600 | 1.3 | Page titles (e.g., "Inbox", "Process") |
| Heading 2 | 16px | 600 | 1.4 | Section headers |
| Body | 14px | 400-450 | 1.5 | Default body text |
| Body Small | 13px | 400-500 | 1.4 | Card titles, nav items |
| Caption | 12px | 400-500 | 1.4 | Timestamps, metadata |
| Label | 11px | 600 | 1.3 | Section labels, badges, uppercase labels |
| Tiny | 10px | 500 | 1.2 | Keyboard shortcuts, AI confidence |

### Letter Spacing
- Headings: `-0.3px` (tighter)
- Section labels (uppercase): `0.5px - 0.8px`
- Body: default (0)

---

## Spacing

Follow Tailwind's 4px base grid. Key values:
- `4px` (1) - Tight gaps
- `8px` (2) - Standard small gap
- `12px` (3) - Card internal gaps
- `16px` (4) - Card padding, section gaps
- `20px` (5) - Content area padding
- `24px` (6) - Section spacing
- `32px` (8) - Large section breaks
- `48px` (12) - Page-level spacing

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Small elements: tags, badges, inputs |
| `--radius` | `10px` | Default: cards, buttons, dropdowns |
| `--radius-lg` | `14px` | Large: modals, process card |
| `--radius-xl` | `20px` | Extra large: capture bar, hero elements |
| `--radius-full` | `9999px` | Circular: avatars, dots, badges |

---

## Shadows

Dark mode shadows use true black for depth. Light mode uses softer neutral shadows.

| Name | Dark | Light | Usage |
|------|------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | `0 1px 2px rgba(0,0,0,0.06)` | Subtle lift |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | `0 4px 12px rgba(0,0,0,0.08)` | Cards, dropdowns |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.5)` | `0 8px 32px rgba(0,0,0,0.12)` | Modals, floating elements |
| `--shadow-glow` | `0 0 20px var(--accent-glow)` | `0 0 20px var(--accent-glow)` | Capture bar, interactive focus |

---

## Layout Constants

| Token | Value | Notes |
|-------|-------|-------|
| `--sidebar-width` | `252px` | Expanded sidebar |
| `--sidebar-collapsed` | `68px` | Collapsed sidebar (default state) |
| `--header-height` | `56px` | Top header bar |
| `--capture-bar-height` | `64px` | Persistent capture bar |
| `--content-max-width` | `1200px` | Max content width |
| `--content-padding` | `24px` | Content area horizontal padding |

---

## Component Patterns

### Buttons

**Primary (teal accent):**
- Background: `var(--accent)`
- Text: `#0e0e11` (dark on teal)
- Hover: `var(--accent-hover)`
- Active: `var(--accent-active)`
- Border radius: `var(--radius)`
- Padding: `7px 14px`
- Font: 13px, weight 500

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
- Border: `1px solid var(--border-default)`
- Border radius: `var(--radius)`
- Padding: `16px`
- Hover: border `var(--border-emphasis)`, background `var(--bg-elevated)`, translateY(-1px), shadow-md
- Layer indicator: 3px left border in layer color (when applicable) OR 8px dot

### Navigation Items

- Padding: `8px 10px`
- Border radius: `var(--radius-sm)`
- Font: 13.5px, weight 450
- Color: `var(--text-secondary)`
- Hover: background `var(--bg-hover)`, color `var(--text-primary)`
- Active: background `var(--accent-subtle)`, color `var(--accent)`
- Layer-active: background in layer-bg, color in layer color

### Input Fields

- Background: `var(--bg-elevated)`
- Border: `1px solid var(--border-default)`
- Border radius: `var(--radius-sm)`
- Padding: `8px 12px`
- Font: 14px
- Focus: border `var(--accent-border)`, box-shadow `0 0 0 2px var(--accent-glow)`

### Tags/Badges

- Font: 11px, weight 500
- Padding: `2px 8px`
- Border radius: `4px`
- Background: destination color at 12% opacity
- Text: destination color

### Capture Bar (Persistent)

- Position: fixed at bottom, full width minus sidebar
- Background: `var(--bg-card)` with `backdrop-filter: blur(12px)`
- Border: `1px solid var(--border-default)`
- Border radius: `var(--radius-xl)` (20px)
- Height: 64px
- Focus: border `var(--accent-border)`, glow shadow
- Icon: teal colored
- Placeholder: `var(--text-muted)`
- Always visible on all dashboard pages (except mobile - consider toggle)

### Tooltips

- Background: `var(--bg-elevated)`
- Border: `1px solid var(--border-default)`
- Font: 12px
- Border radius: `var(--radius-sm)`
- Used on collapsed sidebar icons

---

## Animation Guidelines

All animations use Framer Motion. Keep them **subtle and fast**.

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Page transition | 200ms | ease-out | fadeIn on route change |
| Card hover | 150ms | ease | translateY, shadow change |
| Card enter (list) | 150ms | ease-out | fadeIn + slideUp, staggered 30ms |
| Sidebar expand | 200ms | ease-in-out | Width transition |
| Modal open | 200ms | spring (stiffness 300, damping 30) | Scale + fade |
| Completion | 300ms | ease | Flash green, strikethrough |
| Process card swap | 250ms | ease-out | SlideOut current + SlideIn next |
| Toast | 200ms | ease | SlideUp from bottom |

**Rules:**
- No animation longer than 300ms
- No bouncy springs that feel playful (this is a serious productivity tool)
- Stagger list items at 30ms intervals max
- Prefer opacity + translateY over scale for list items
- Process card (tinder) uses directional slide based on action

---

## Dark / Light Mode Implementation

- Use CSS custom properties for ALL colors (no hardcoded Tailwind colors for themed elements)
- Dark mode is default (`:root` / `html.dark`)
- Light mode via `html.light` class
- Toggle in Settings (store preference in localStorage + user profile)
- Respect `prefers-color-scheme` on first visit
- All design tokens defined twice in globals.css: once in `:root` (dark), once in `.light` (light)

---

## Logo

The OffMind logo is a gradient sphere (violet `#7c5cfc` to teal `#2dd4bf`) with a subtle inner arc. It represents thoughts flowing out of the mind into clarity.

- App icon: 28x28px sphere
- Favicon: sphere only
- Full logo: sphere + "OffMind" text (Geist Sans 600, 15px)
- Used in: sidebar header, landing page, auth pages, favicon
