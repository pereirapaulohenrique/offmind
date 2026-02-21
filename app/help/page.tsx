import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Inbox,
  ArrowRightLeft,
  CalendarCheck,
  HelpCircle,
  BookOpen,
  Keyboard,
  Plug,
  MessageSquare,
  Chrome,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';
import { OffMindLogo } from '@/components/brand/OffMindLogo';

export const metadata: Metadata = {
  title: 'Help Center | OffMind',
  description:
    'Learn how to use OffMind effectively. FAQ, workflow guides, keyboard shortcuts, and integration setup.',
};

/* =============================================================================
   Help Center Page
   Server Component — no 'use client'
============================================================================= */

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background bloom-surface">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] warm-glass">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-subtle)] group-hover:bg-[var(--accent-base)]/15 transition-colors duration-200">
              <OffMindLogo size={24} />
            </div>
            <span
              className="text-lg font-semibold tracking-tight text-foreground"
              style={{ letterSpacing: '-0.02em' }}
            >
              OffMind
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md tactile-press"
              style={{
                background: 'var(--gradient-accent)',
                color: '#fef3e8',
                border: 'none',
              }}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ================================================================
            HERO
        ================================================================ */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)]">
          <div className="gradient-mesh absolute inset-0" />
          <div className="relative container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--accent-hover)]">
                <HelpCircle className="h-3.5 w-3.5" />
                Help Center
              </div>
              <h1
                className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl"
                style={{ letterSpacing: '-0.03em' }}
              >
                How can we help?
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                Everything you need to get the most out of OffMind. From
                getting started to advanced workflows.
              </p>
            </div>

            {/* Quick nav cards */}
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <QuickNavCard
                href="#faq"
                icon={HelpCircle}
                label="FAQ"
              />
              <QuickNavCard
                href="#workflow"
                icon={BookOpen}
                label="Workflow"
              />
              <QuickNavCard
                href="#shortcuts"
                icon={Keyboard}
                label="Shortcuts"
              />
              <QuickNavCard
                href="#integrations"
                icon={Plug}
                label="Integrations"
              />
            </div>
          </div>
        </section>

        {/* ================================================================
            FAQ
        ================================================================ */}
        <section id="faq" className="py-16 sm:py-24 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <SectionHeader
                icon={HelpCircle}
                label="FAQ"
                title="Frequently Asked Questions"
                description="Quick answers to the most common questions about OffMind."
              />

              <div className="mt-12 space-y-4">
                <FAQCard
                  question="What is OffMind?"
                  answer="OffMind is a GTD (Getting Things Done) productivity app designed for overthinkers. It gives you a simple three-layer workflow: Capture everything that's on your mind, Organize it with AI-assisted suggestions, and Commit to what matters today. The goal is simple: get it off your mind so you can focus."
                />
                <FAQCard
                  question="How is OffMind different from Notion or Todoist?"
                  answer="Notion is powerful but complex. It's a workspace, not a task system. Todoist is simple but rigid. OffMind sits in the sweet spot: a fast, flexible system built on GTD principles where AI handles the organizing so you can focus on doing. You never have to think about where something goes."
                />
                <FAQCard
                  question="What does the AI actually do?"
                  answer="When you capture a thought, AI analyzes it and suggests which category it belongs to: your backlog, reference material, a someday idea, your calendar, etc. It also extracts dates and priorities from natural language. You always have the final say; AI saves you the mental effort of sorting everything yourself."
                />
                <FAQCard
                  question="Is my data private and secure?"
                  answer="Yes. Your data is stored securely and encrypted. We don't sell your data, show ads, or use your content for AI training. Your thoughts are yours alone. Private by design."
                />
                <FAQCard
                  question="Can I capture items from outside the web app?"
                  answer="Absolutely. You can capture from the web app, a Telegram bot (@OffMindBot), a Chrome extension, and a desktop app with a global hotkey. Every capture method sends to the same inbox. More capture methods (mobile app, email forwarding) are coming soon."
                />
                <FAQCard
                  question="What happens after the free trial?"
                  answer="After 14 days, you choose a plan to continue. Your data is never deleted. If you don't subscribe, you keep read-only access to everything you've captured and organized. We also offer a lifetime deal for early supporters."
                />
                <FAQCard
                  question="Can I import from other tools?"
                  answer="Import support for Todoist, Notion, and CSV files is on the roadmap. For now, you can use the capture bar or Telegram bot to quickly add items manually."
                />
                <FAQCard
                  question="Does OffMind work on mobile?"
                  answer="The web app is fully responsive and works on any device with a browser. A native mobile app for iOS and Android is in development."
                />
                <FAQCard
                  question="What are Spaces and Projects?"
                  answer="Spaces let you organize by area of life (Work, Personal, Health, Side Projects). Inside each Space, you can create Projects (time-bound efforts) and Pages (rich documents). Items can be assigned to a Space and Project for full context."
                />
                <FAQCard
                  question="How do I get help or report a bug?"
                  answer="You can reach us at support@offmind.ai or through the in-app feedback button. We read every message and respond within 24 hours."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            WORKFLOW GUIDE
        ================================================================ */}
        <section
          id="workflow"
          className="border-y border-[var(--border-subtle)] bg-[var(--bg-inset)] py-16 sm:py-24 lg:py-28"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <SectionHeader
                icon={BookOpen}
                label="Workflow Guide"
                title="The 3-Layer System"
                description="OffMind is built on the GTD methodology. Everything flows through three layers: Capture, Organize, and Commit."
              />

              {/* Layer 1: Capture */}
              <div className="mt-14 space-y-10">
                <WorkflowLayer
                  number={1}
                  icon={Inbox}
                  title="Capture"
                  subtitle="Get it out of your head"
                  color="capture"
                  description="The first layer is pure brain dump. When a thought, task, or idea pops into your head, capture it instantly. Don't think about where it goes, don't organize it, don't prioritize it. Just get it out."
                  details={[
                    'Use the persistent capture bar at the bottom of any page (Cmd+N to focus)',
                    'Type naturally: "Call dentist next Tuesday" or "Research competitor pricing"',
                    'Attach images or record audio notes directly in the capture bar',
                    'Capture from anywhere: Telegram bot, Chrome extension, or desktop app',
                    'Everything lands in your Inbox, unprocessed and safe',
                  ]}
                  tip="The goal of capture is speed. Under 2 seconds. The faster you capture, the less your brain holds onto, and the calmer you feel."
                />

                {/* Connector */}
                <div className="flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]">
                    <ChevronRight className="h-4 w-4 rotate-90 text-[var(--text-muted)]" />
                  </div>
                </div>

                {/* Layer 2: Organize */}
                <WorkflowLayer
                  number={2}
                  icon={ArrowRightLeft}
                  title="Organize"
                  subtitle="AI helps you sort it"
                  color="process"
                  description="Once your inbox has items, it's time to process them. Open any item and the Processing Panel slides in from the right. AI suggests a destination, and you approve or change it with one click."
                  details={[
                    'Click any item from any page to open the Processing Panel',
                    'AI analyzes each item and suggests a destination (Backlog, Reference, Someday, Schedule, etc.)',
                    'Set a due date, assign to a Space/Project, add priority, or write notes',
                    'Every change auto-saves (no save button needed)',
                    'Custom destinations: create your own categories beyond the defaults',
                  ]}
                  tip="Process your inbox regularly, ideally once or twice a day. The fewer items sitting unprocessed, the less mental weight you carry."
                />

                {/* Connector */}
                <div className="flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]">
                    <ChevronRight className="h-4 w-4 rotate-90 text-[var(--text-muted)]" />
                  </div>
                </div>

                {/* Layer 3: Commit */}
                <WorkflowLayer
                  number={3}
                  icon={CalendarCheck}
                  title="Commit"
                  subtitle="Focus on today"
                  color="commit"
                  description="The final layer is where action happens. Items that have a scheduled date appear on your calendar and in the Today view. This is your daily focus. Everything else stays organized in the background, out of sight and out of mind."
                  details={[
                    'The Today view (Cmd+0) shows overdue items, today\'s scheduled tasks, and starred items',
                    'Schedule view (Cmd+3) gives you day and week calendar views',
                    'Drag items to time slots for time blocking',
                    'Complete tasks with a single click (satisfying animation included)',
                    'Google Calendar integration keeps everything in sync',
                  ]}
                  tip="Only commit to what you can realistically do today. A short, focused list beats a long, overwhelming one every time."
                />
              </div>

              {/* Summary flow */}
              <div className="mt-16 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8" style={{ boxShadow: 'var(--shadow-card)' }}>
                <h3
                  className="text-lg font-bold text-foreground"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  The daily rhythm
                </h3>
                <div className="mt-4 space-y-3">
                  <FlowStep number="1" text="Throughout the day, capture everything that comes to mind. Don't filter, don't organize." />
                  <FlowStep number="2" text="Once or twice a day, open your Inbox and process items. AI suggests where each one goes." />
                  <FlowStep number="3" text="Each morning (or evening), review your Today view and commit to a focused set of tasks." />
                  <FlowStep number="4" text="Work through your committed items. Everything else is safely stored and organized." />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            KEYBOARD SHORTCUTS
        ================================================================ */}
        <section id="shortcuts" className="py-16 sm:py-24 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <SectionHeader
                icon={Keyboard}
                label="Keyboard Shortcuts"
                title="Work at the speed of thought"
                description="OffMind is designed for keyboard-first navigation. Learn these shortcuts and you'll fly through your workflow."
              />

              <div className="mt-12">
                <div
                  className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  {/* Table header */}
                  <div className="flex items-center border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-3">
                    <span className="w-40 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      Shortcut
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      Action
                    </span>
                  </div>

                  {/* Shortcut rows */}
                  <ShortcutGroup title="Global">
                    <ShortcutRow keys={['Cmd', 'K']} action="Open command palette" />
                    <ShortcutRow keys={['Cmd', 'J']} action="Open AI assistant" />
                    <ShortcutRow keys={['Cmd', 'N']} action="Focus capture bar" />
                    <ShortcutRow keys={['Cmd', '\\']} action="Toggle sidebar" />
                    <ShortcutRow keys={['Cmd', 'Shift', 'N']} action="Create new page" />
                    <ShortcutRow keys={['Cmd', ',']} action="Open settings" />
                  </ShortcutGroup>

                  <ShortcutGroup title="Navigation">
                    <ShortcutRow keys={['Cmd', '0']} action="Go to Today" />
                    <ShortcutRow keys={['Cmd', '1']} action="Go to Inbox" />
                    <ShortcutRow keys={['Cmd', '2']} action="Go to Organize" />
                    <ShortcutRow keys={['Cmd', '3']} action="Go to Schedule" />
                  </ShortcutGroup>

                  <ShortcutGroup title="Processing">
                    <ShortcutRow keys={['Escape']} action="Close processing panel" last />
                  </ShortcutGroup>
                </div>

                <p className="mt-4 text-sm text-[var(--text-muted)]">
                  On Windows/Linux, use <kbd className="inline-flex items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]">Ctrl</kbd> instead of <kbd className="inline-flex items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]">Cmd</kbd>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            INTEGRATIONS
        ================================================================ */}
        <section
          id="integrations"
          className="border-y border-[var(--border-subtle)] bg-[var(--bg-inset)] py-16 sm:py-24 lg:py-28"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <SectionHeader
                icon={Plug}
                label="Integrations"
                title="Connect your tools"
                description="Extend OffMind with integrations that bring capture and scheduling closer to where you already work."
              />

              <div className="mt-12 space-y-8">
                {/* Telegram Integration */}
                <IntegrationCard
                  icon={MessageSquare}
                  title="Telegram Bot"
                  status="available"
                  description="Capture thoughts instantly from Telegram. Send a message and it appears in your OffMind inbox within seconds."
                  steps={[
                    'Open Telegram and search for @OffMindBot',
                    'Start a conversation and tap "Start" or send /start',
                    'The bot will ask you to connect your OffMind account. Tap the link provided.',
                    'Log in to your OffMind account and authorize the connection.',
                    'Done. Any message you send to @OffMindBot is captured to your inbox.',
                  ]}
                  tips={[
                    'Send text messages for quick thoughts and tasks',
                    'Send images to capture visual references',
                    'Send voice messages for hands-free capture (audio is saved as an attachment)',
                    'Forward messages from other chats to capture them',
                  ]}
                />

                {/* Chrome Extension */}
                <IntegrationCard
                  icon={Chrome}
                  title="Chrome Extension"
                  status="coming"
                  description="Capture thoughts, save tabs, and clip web pages directly from your browser. One click to capture, zero friction."
                  steps={[
                    'Install the OffMind extension from the Chrome Web Store (link coming soon)',
                    'Click the OffMind icon in your browser toolbar',
                    'Log in with your OffMind account credentials',
                    'Use the extension popup to type a quick thought or clip the current page',
                    'Items appear in your OffMind inbox instantly',
                  ]}
                  tips={[
                    'Use the keyboard shortcut (Ctrl+Shift+O) to open the extension popup instantly',
                    'Right-click any text on a page and select "Send to OffMind" to capture a selection',
                    'The extension captures the page URL and title automatically when clipping',
                    'Pin the extension to your toolbar for one-click access',
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            STILL NEED HELP?
        ================================================================ */}
        <section className="py-16 sm:py-24 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--accent-hover)]">
                <Sparkles className="h-3.5 w-3.5" />
                We're here to help
              </div>
              <h2
                className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl"
                style={{ letterSpacing: '-0.02em' }}
              >
                Still have questions?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Reach out anytime. We read every message and respond within 24
                hours.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="mailto:support@offmind.ai"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--bg-hover)] tactile-press"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  Email support@offmind.ai
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-subtle)]">
                <OffMindLogo size={20} />
              </div>
              <span className="font-semibold tracking-tight text-foreground">
                OffMind
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
              <Link
                href="/privacy"
                className="hover:text-muted-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-muted-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/help"
                className="text-[var(--accent-hover)] hover:text-foreground transition-colors"
              >
                Help
              </Link>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              &copy; 2026 OffMind
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =============================================================================
   Quick Nav Card
============================================================================= */
function QuickNavCard({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <a
      href={href}
      className="bloom-card flex flex-col items-center gap-2 p-4 text-center inner-light card-hover"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-hover)]">
        <Icon className="h-5 w-5 text-[var(--text-secondary)]" />
      </div>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </a>
  );
}

/* =============================================================================
   Section Header
============================================================================= */
function SectionHeader({
  icon: Icon,
  label,
  title,
  description,
}: {
  icon: React.ElementType;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--accent-hover)]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <h2
        className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl"
        style={{ letterSpacing: '-0.02em' }}
      >
        {title}
      </h2>
      <p className="mt-4 text-lg text-muted-foreground">{description}</p>
    </div>
  );
}

/* =============================================================================
   FAQ Card (static, no accordion since this is a server component)
============================================================================= */
function FAQCard({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 sm:px-6 sm:py-5 list-none [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold text-foreground sm:text-base pr-4">
          {question}
        </span>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-open:rotate-90" />
      </summary>
      <div className="border-t border-[var(--border-subtle)] px-5 py-4 sm:px-6 sm:py-5">
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          {answer}
        </p>
      </div>
    </details>
  );
}

/* =============================================================================
   Workflow Layer Card
============================================================================= */
function WorkflowLayer({
  number,
  icon: Icon,
  title,
  subtitle,
  color,
  description,
  details,
  tip,
}: {
  number: number;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: 'capture' | 'process' | 'commit';
  description: string;
  details: string[];
  tip: string;
}) {
  const colorMap = {
    capture: {
      bg: 'bg-[var(--layer-capture-bg)]',
      border: 'border-[var(--layer-capture-border)]',
      text: 'text-[var(--layer-capture)]',
      tipBg: 'bg-[var(--layer-capture-bg)]',
      tipBorder: 'border-[var(--layer-capture-border)]',
    },
    process: {
      bg: 'bg-[var(--layer-process-bg)]',
      border: 'border-[var(--layer-process-border)]',
      text: 'text-[var(--layer-process)]',
      tipBg: 'bg-[var(--layer-process-bg)]',
      tipBorder: 'border-[var(--layer-process-border)]',
    },
    commit: {
      bg: 'bg-[var(--layer-commit-bg)]',
      border: 'border-[var(--layer-commit-border)]',
      text: 'text-[var(--layer-commit)]',
      tipBg: 'bg-[var(--layer-commit-bg)]',
      tipBorder: 'border-[var(--layer-commit-border)]',
    },
  };

  const c = colorMap[color];

  return (
    <div
      className={`rounded-2xl border ${c.border} ${c.bg} p-6 sm:p-8`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${c.border} bg-[var(--bg-surface)]`}
        >
          <Icon className={`h-7 w-7 ${c.text}`} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: 'var(--gradient-accent)',
                color: '#fef3e8',
              }}
            >
              {number}
            </span>
            <h3
              className="text-xl font-bold text-foreground"
              style={{ letterSpacing: '-0.01em' }}
            >
              {title}
            </h3>
          </div>
          <p className={`mt-0.5 text-sm font-medium ${c.text}`}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="mt-5 text-sm leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>

      {/* Details list */}
      <ul className="mt-5 space-y-2.5">
        {details.map((detail, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <ChevronRight
              className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${c.text}`}
            />
            <span className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {detail}
            </span>
          </li>
        ))}
      </ul>

      {/* Tip */}
      <div
        className={`mt-6 rounded-xl border ${c.tipBorder} ${c.tipBg} px-4 py-3`}
      >
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          <span className={`font-semibold ${c.text}`}>Tip:</span> {tip}
        </p>
      </div>
    </div>
  );
}

/* =============================================================================
   Flow Step
============================================================================= */
function FlowStep({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{
          background: 'var(--gradient-accent)',
          color: '#fef3e8',
        }}
      >
        {number}
      </span>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {text}
      </p>
    </div>
  );
}

/* =============================================================================
   Shortcut Group
============================================================================= */
function ShortcutGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 px-5 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

/* =============================================================================
   Shortcut Row
============================================================================= */
function ShortcutRow({
  keys,
  action,
  last,
}: {
  keys: string[];
  action: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center px-5 py-3 ${
        last ? '' : 'border-b border-[var(--border-subtle)]'
      }`}
    >
      <div className="flex w-40 items-center gap-1.5">
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)]">
              {key === 'Cmd' ? (
                <span className="flex items-center gap-0.5">
                  <Command className="h-3 w-3" />
                </span>
              ) : (
                key
              )}
            </kbd>
            {i < keys.length - 1 && (
              <span className="mx-0.5 text-[var(--text-muted)]">+</span>
            )}
          </span>
        ))}
      </div>
      <span className="text-sm text-[var(--text-secondary)]">{action}</span>
    </div>
  );
}

/* =============================================================================
   Integration Card
============================================================================= */
function IntegrationCard({
  icon: Icon,
  title,
  status,
  description,
  steps,
  tips,
}: {
  icon: React.ElementType;
  title: string;
  status: 'available' | 'coming';
  description: string;
  steps: string[];
  tips: string[];
}) {
  return (
    <div
      className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-hover)]">
            <Icon className="h-6 w-6 text-[var(--text-secondary)]" />
          </div>
          <div>
            <h3
              className="text-lg font-bold text-foreground"
              style={{ letterSpacing: '-0.01em' }}
            >
              {title}
            </h3>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          </div>
        </div>
        {status === 'available' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--layer-commit-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--layer-commit)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--layer-commit)]" />
            Available
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-hover)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Coming soon
          </span>
        )}
      </div>

      {/* Setup Steps */}
      <div className="px-6 py-5">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          Setup guide
        </h4>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-hover)] text-[10px] font-bold text-[var(--text-secondary)]">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Tips */}
      <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 px-6 py-5">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Tips
        </h4>
        <ul className="space-y-2">
          {tips.map((tipText, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--accent-hover)]" />
              <span className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {tipText}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
