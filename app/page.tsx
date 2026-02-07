import Link from 'next/link';
import {
  Inbox,
  ArrowRightLeft,
  CalendarCheck,
  Sparkles,
  FolderOpen,
  FileText,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  ArrowRight,
  Check,
  Terminal,
  Keyboard,
  Activity,
  Cpu,
  Database,
  Command,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaitlistForm } from '@/components/marketing/WaitlistForm';
import { OffMindLogo } from '@/components/brand/OffMindLogo';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* ================================================================
          NAVIGATION — Neural Glass Header
      ================================================================ */}
      <header className="neural-glass sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <nav className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <OffMindLogo size={26} />
            <span
              className="font-[family-name:var(--font-geist-mono)] text-sm font-semibold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              OffMind
            </span>
            <span className="data-label ml-1 hidden sm:inline">v2.0</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="mr-2 hidden items-center gap-1.5 md:flex">
              <span className="kbd-hint">Ctrl</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.625rem' }}>+</span>
              <span className="kbd-hint">K</span>
              <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                to search
              </span>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 text-xs font-medium shadow-[var(--shadow-neon)]">
              <Link href="/signup">
                Initialize
                <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ================================================================
            HERO SECTION — Terminal-Style Text Reveal
        ================================================================ */}
        <section className="relative overflow-hidden">
          {/* Grid background + gradient mesh */}
          <div className="neural-grid-animated absolute inset-0" />
          <div className="gradient-mesh absolute inset-0" />

          {/* Radial glow at center */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '800px',
              height: '600px',
              background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)',
            }}
          />

          <div className="relative container mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              {/* Status badge */}
              <div
                className="mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1"
                style={{
                  border: '1px solid var(--ai-border)',
                  background: 'var(--ai-subtle)',
                }}
              >
                <div className="status-indicator" style={{ background: '#8b5cf6', boxShadow: '0 0 6px rgba(139,92,246,0.5)' }} />
                <span className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: '#8b5cf6' }}>
                  AI-Enhanced GTD System
                </span>
              </div>

              {/* Terminal text block */}
              <div className="mb-6 w-full max-w-2xl text-left sm:text-center">
                <div className="inline-block">
                  <p
                    className="font-[family-name:var(--font-geist-mono)] text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {'>'} system.init()
                  </p>
                </div>
              </div>

              {/* Main heading */}
              <h1
                className="text-4xl font-bold sm:text-6xl lg:text-7xl"
                style={{ letterSpacing: '-0.05em', color: 'var(--text-primary)' }}
              >
                Initialize{' '}
                <span className="bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] bg-clip-text text-transparent">
                  mind.
                </span>
                <br />
                <span style={{ color: 'var(--text-secondary)' }}>
                  Process thoughts.
                </span>
                <br />
                <span
                  className="bg-gradient-to-r from-[#00d4ff] via-[#00d4ff] to-[#34d399] bg-clip-text text-transparent"
                >
                  Execute commitments.
                </span>
              </h1>

              <p
                className="mt-8 max-w-xl text-sm leading-relaxed sm:text-base"
                style={{ color: 'var(--text-secondary)' }}
              >
                The power-user productivity system for overthinkers. Capture everything,
                process with AI precision, commit to what matters. Keyboard-first. Data-dense.
                Built for control.
              </p>

              {/* Stats row */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
                <div className="text-center">
                  <p className="counter-animate text-2xl font-bold" style={{ color: 'var(--accent-base)' }}>
                    10,847
                  </p>
                  <p className="data-label mt-1">thoughts captured</p>
                </div>
                <div
                  className="hidden h-8 w-px sm:block"
                  style={{ background: 'var(--border-subtle)' }}
                />
                <div className="text-center">
                  <p className="counter-animate text-2xl font-bold" style={{ color: 'var(--accent-base)' }}>
                    99.7%
                  </p>
                  <p className="data-label mt-1">organized</p>
                </div>
                <div
                  className="hidden h-8 w-px sm:block"
                  style={{ background: 'var(--border-subtle)' }}
                />
                <div className="text-center">
                  <p className="counter-animate text-2xl font-bold" style={{ color: 'var(--accent-base)' }}>
                    &lt;2s
                  </p>
                  <p className="data-label mt-1">capture time</p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2 px-8 font-medium neural-glow">
                  <Link href="/signup">
                    <Terminal className="h-4 w-4" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  <Link href="#how-it-works">
                    See How It Works
                    <span className="kbd-hint ml-1">Space</span>
                  </Link>
                </Button>
              </div>

              <p className="mt-4 font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                14-day free trial. No credit card required.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================
            HOW IT WORKS — 3 HUD Panels with Data Flow Lines
        ================================================================ */}
        <section
          id="how-it-works"
          className="relative py-24 sm:py-28"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}
        >
          {/* Subtle grid overlay */}
          <div className="neural-grid absolute inset-0 opacity-50" />

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="data-label mb-3">System Architecture</p>
              <h2
                className="text-2xl font-bold tracking-tight sm:text-4xl"
                style={{ letterSpacing: '-0.04em', color: 'var(--text-primary)' }}
              >
                Three-layer execution pipeline
              </h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Based on GTD methodology, enhanced with AI for deterministic output
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-3">
              {/* Connecting data-flow lines (visible on desktop) */}
              <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden sm:block">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between px-20">
                    <div className="h-px flex-1 data-flow" />
                    <div className="mx-4 h-px flex-1 data-flow" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
              </div>

              <ProcessStep
                number="01"
                icon={Inbox}
                title="Capture"
                description="Zero-friction brain dump. Web, mobile, Telegram, extension. Every input channel covered."
                color="blue"
                shortcut="Ctrl+N"
                metric="< 2 sec"
                metricLabel="avg capture time"
              />
              <ProcessStep
                number="02"
                icon={ArrowRightLeft}
                title="Process"
                description="AI-powered triage. One item at a time. Smart suggestions with confidence scores. Approve or override."
                color="amber"
                shortcut="Ctrl+2"
                metric="94.2%"
                metricLabel="AI accuracy"
              />
              <ProcessStep
                number="03"
                icon={CalendarCheck}
                title="Commit"
                description="Scheduled, actionable items. Calendar view. Only see what you committed to. Execute with precision."
                color="green"
                shortcut="Ctrl+3"
                metric="3.2x"
                metricLabel="completion rate"
              />
            </div>
          </div>
        </section>

        {/* ================================================================
            FEATURES GRID — Dense 3-Column with Scanlines
        ================================================================ */}
        <section className="py-24 sm:py-28" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="data-label mb-3">Feature Matrix</p>
              <h2
                className="text-2xl font-bold tracking-tight sm:text-4xl"
                style={{ letterSpacing: '-0.04em', color: 'var(--text-primary)' }}
              >
                Everything you need. Nothing you don&apos;t.
              </h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Dense feature set for power users who demand control
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Sparkles}
                title="AI Processing"
                description="Smart categorization and scheduling suggestions based on your patterns"
                shortcut="Ctrl+J"
                metric="94%"
                metricLabel="accuracy"
                color="violet"
              />
              <FeatureCard
                icon={FolderOpen}
                title="Spaces & Projects"
                description="Organize by life areas. Work, personal, health - separate contexts"
                shortcut="Ctrl+P"
                metric="Unlimited"
                metricLabel="spaces"
                color="blue"
              />
              <FeatureCard
                icon={FileText}
                title="Rich Pages"
                description="Notion-like documents linked to your tasks for deeper thinking"
                shortcut="Ctrl+Shift+N"
                metric="Block"
                metricLabel="editor"
                color="violet"
              />
              <FeatureCard
                icon={Zap}
                title="Quick Capture"
                description="Telegram bot, browser extension, and mobile-first web app"
                shortcut="Ctrl+N"
                metric="<2s"
                metricLabel="capture"
                color="cyan"
              />
              <FeatureCard
                icon={Shield}
                title="Privacy First"
                description="Your data stays yours. Self-hostable. No ads, no tracking, no exceptions"
                shortcut=""
                metric="E2E"
                metricLabel="encrypted"
                color="green"
              />
              <FeatureCard
                icon={Clock}
                title="Time Blocking"
                description="Turn processed items into scheduled commitments. Calendar sync."
                shortcut="Ctrl+T"
                metric="GCal"
                metricLabel="integrated"
                color="amber"
              />
            </div>
          </div>
        </section>

        {/* ================================================================
            DASHBOARD PREVIEW — Mock Terminal/HUD
        ================================================================ */}
        <section
          className="py-24 sm:py-28"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="data-label mb-3">Live Preview</p>
              <h2
                className="text-2xl font-bold tracking-tight sm:text-4xl"
                style={{ letterSpacing: '-0.04em', color: 'var(--text-primary)' }}
              >
                Your command center
              </h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Information-dense dashboard built for power users
              </p>
            </div>

            <div className="mx-auto mt-14 max-w-5xl">
              <div
                className="neural-card scan-line overflow-hidden"
                style={{ borderColor: 'rgba(0,212,255,0.12)' }}
              >
                {/* Terminal header bar */}
                <div
                  className="flex items-center justify-between border-b px-4 py-2.5"
                  style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-inset)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="flex items-center gap-2">
                      <OffMindLogo size={14} />
                      <span className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                        offmind.ai/dashboard
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="status-indicator" />
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                      connected
                    </span>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="neural-grid p-5 sm:p-6" style={{ background: 'var(--bg-base)' }}>
                  {/* Greeting + date row */}
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Good morning, Paulo
                      </p>
                      <p className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                        Friday, Feb 7, 2026 / 08:42:15
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="kbd-hint">Ctrl</span>
                      <span className="kbd-hint">K</span>
                    </div>
                  </div>

                  {/* Three-column layer cards */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* Capture Column */}
                    <DashboardColumn
                      label="Capture"
                      icon={Inbox}
                      count={7}
                      color="#60a5fa"
                      colorBg="rgba(96, 165, 250, 0.06)"
                      colorBorder="rgba(96, 165, 250, 0.15)"
                      items={[
                        'Research new hosting providers',
                        'Book dentist appointment',
                        'Review team proposal draft',
                        'Buy birthday gift for mom',
                      ]}
                    />

                    {/* Process Column */}
                    <DashboardColumn
                      label="Process"
                      icon={ArrowRightLeft}
                      count={3}
                      color="#fbbf24"
                      colorBg="rgba(251, 191, 36, 0.06)"
                      colorBorder="rgba(251, 191, 36, 0.15)"
                      items={[
                        'Sort Q1 budget items',
                        'Categorize client feedback',
                        'Triage backlog queue',
                      ]}
                      active
                    />

                    {/* Commit Column */}
                    <DashboardColumn
                      label="Commit"
                      icon={CalendarCheck}
                      count={4}
                      color="#34d399"
                      colorBg="rgba(52, 211, 153, 0.06)"
                      colorBorder="rgba(52, 211, 153, 0.15)"
                      items={[
                        'Ship feature branch v2.1',
                        'Team standup @ 10:00',
                        'Deploy staging server',
                        'Code review PR #847',
                      ]}
                    />
                  </div>

                  {/* Terminal-style status bar */}
                  <div
                    className="mt-4 flex items-center justify-between rounded-md px-3 py-2"
                    style={{
                      background: 'var(--bg-inset)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--accent-base)' }}>{'>'}</span> ready
                      </span>
                      <span className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                        14 items / 4 due today
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                        AI: <span style={{ color: '#34d399' }}>active</span>
                      </span>
                      <span className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                        sync: <span style={{ color: '#34d399' }}>ok</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            BUILT FOR POWER USERS — Stats Dashboard Section
        ================================================================ */}
        <section className="py-24 sm:py-28" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="text-center">
                <p className="data-label mb-3">Performance Metrics</p>
                <h2
                  className="text-2xl font-bold tracking-tight sm:text-4xl"
                  style={{ letterSpacing: '-0.04em', color: 'var(--text-primary)' }}
                >
                  Built for overthinkers who demand control
                </h2>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  If you have 47 browser tabs and 3 note apps, you&apos;re in the right place
                </p>
              </div>

              {/* Stats grid */}
              <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={Zap}
                  value="<100ms"
                  label="Response time"
                  detail="p99 latency"
                />
                <StatCard
                  icon={Database}
                  value="99.99%"
                  label="Uptime SLA"
                  detail="last 90 days"
                />
                <StatCard
                  icon={Cpu}
                  value="GPT-4"
                  label="AI Engine"
                  detail="latest model"
                />
                <StatCard
                  icon={Activity}
                  value="Real-time"
                  label="Sync Speed"
                  detail="all devices"
                />
              </div>

              {/* Feature highlights */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="neural-card p-5">
                  <div
                    className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(96,165,250,0.10)' }}
                  >
                    <Inbox className="h-4 w-4" style={{ color: '#60a5fa' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Instant brain dump
                  </p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Capture from anywhere in under 2 seconds. Think it, capture it, forget it.
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    <span className="kbd-hint">Ctrl</span>
                    <span className="kbd-hint">N</span>
                    <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>quick capture</span>
                  </div>
                </div>

                <div className="neural-card p-5">
                  <div
                    className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: 'var(--ai-subtle)' }}
                  >
                    <Sparkles className="h-4 w-4" style={{ color: 'var(--ai-accent)' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    AI organizes for you
                  </p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Stop spending mental energy on categorization. AI suggests, you approve.
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    <span className="kbd-hint">Ctrl</span>
                    <span className="kbd-hint">J</span>
                    <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>AI assist</span>
                  </div>
                </div>

                <div className="neural-card p-5">
                  <div
                    className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(52,211,153,0.10)' }}
                  >
                    <CalendarCheck className="h-4 w-4" style={{ color: '#34d399' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Focus on today
                  </p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Only see what you committed to. Everything else is safely stored away.
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    <span className="kbd-hint">Ctrl</span>
                    <span className="kbd-hint">3</span>
                    <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>commit view</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            PRICING — Dark Glass Cards with Technical Spec-Sheet Styling
        ================================================================ */}
        <section
          className="py-24 sm:py-28"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="data-label mb-3">Pricing Schema</p>
              <h2
                className="text-2xl font-bold tracking-tight sm:text-4xl"
                style={{ letterSpacing: '-0.04em', color: 'var(--text-primary)' }}
              >
                Simple, honest pricing
              </h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Start free. Upgrade when you&apos;re ready.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2">
              {/* Free Tier */}
              <div className="neural-card overflow-hidden p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="data-label">Tier: Free</p>
                    <h3 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Starter
                    </h3>
                  </div>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ border: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}
                  >
                    <Terminal className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </div>

                <div className="mt-5 flex items-baseline gap-1">
                  <span
                    className="counter-animate text-4xl font-bold"
                    style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
                  >
                    $0
                  </span>
                  <span className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                    /month
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>For getting started</p>

                <div className="my-6 h-px" style={{ background: 'var(--border-subtle)' }} />

                <ul className="space-y-3">
                  <PricingFeature>Up to 100 items</PricingFeature>
                  <PricingFeature>3 spaces</PricingFeature>
                  <PricingFeature>Basic AI suggestions</PricingFeature>
                  <PricingFeature>Web capture</PricingFeature>
                </ul>

                <Button asChild className="mt-8 w-full" variant="outline" style={{ borderColor: 'var(--border-default)' }}>
                  <Link href="/signup">
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs">deploy --free</span>
                  </Link>
                </Button>
              </div>

              {/* Pro Tier */}
              <div
                className="relative overflow-hidden rounded-lg p-6 gradient-border sm:p-8"
                style={{
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <div
                  className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.3), transparent)' }}
                />

                <div
                  className="absolute left-4 top-4 rounded-full px-2 py-0.5 text-xs font-medium sm:left-auto sm:right-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))',
                    border: '1px solid rgba(0,212,255,0.20)',
                    color: 'var(--accent-base)',
                  }}
                >
                  Recommended
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="data-label" style={{ color: 'rgba(0,212,255,0.70)' }}>Tier: Pro</p>
                    <h3 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Power User
                    </h3>
                  </div>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg pulse-cyan"
                    style={{ border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.08)' }}
                  >
                    <Zap className="h-4 w-4" style={{ color: 'var(--accent-base)' }} />
                  </div>
                </div>

                <div className="mt-5 flex items-baseline gap-1">
                  <span
                    className="counter-animate text-4xl font-bold"
                    style={{ color: 'var(--accent-base)', letterSpacing: '-0.04em' }}
                  >
                    $9
                  </span>
                  <span className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                    /month
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>For serious productivity</p>

                <div className="my-6 h-px" style={{ background: 'var(--border-subtle)' }} />

                <ul className="space-y-3">
                  <PricingFeature accent>Unlimited items</PricingFeature>
                  <PricingFeature accent>Unlimited spaces & projects</PricingFeature>
                  <PricingFeature accent>Advanced AI processing</PricingFeature>
                  <PricingFeature accent>Telegram & extension capture</PricingFeature>
                  <PricingFeature accent>API access</PricingFeature>
                  <PricingFeature accent>Priority support</PricingFeature>
                </ul>

                <Button asChild className="mt-8 w-full font-medium neural-glow">
                  <Link href="/signup">
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs">deploy --pro</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            CTA + WAITLIST — Terminal-Style Input
        ================================================================ */}
        <section className="py-24 sm:py-28" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div
                className="mb-6 inline-flex items-center gap-2"
              >
                <Terminal className="h-4 w-4" style={{ color: 'var(--accent-base)' }} />
                <span className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--accent-base)' }}>
                  system.ready()
                </span>
              </div>

              <h2
                className="text-2xl font-bold tracking-tight sm:text-4xl"
                style={{ letterSpacing: '-0.04em', color: 'var(--text-primary)' }}
              >
                Ready to initialize?
              </h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Join the waitlist for early access and exclusive updates.
              </p>

              <WaitlistForm />

              <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                Or{' '}
                <Link href="/signup" className="underline underline-offset-4 transition-colors hover:text-[var(--accent-base)]" style={{ color: 'var(--text-secondary)' }}>
                  sign up now
                </Link>{' '}
                to start using OffMind today.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================================
          FOOTER — Minimal, Monospace, Keyboard Reference
      ================================================================ */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            {/* Logo + tagline */}
            <div>
              <div className="flex items-center gap-2">
                <OffMindLogo size={22} />
                <span
                  className="font-[family-name:var(--font-geist-mono)] text-sm font-semibold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  OffMind
                </span>
              </div>
              <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                The productivity system for overthinkers
              </p>
            </div>

            {/* Keyboard shortcuts reference */}
            <div className="hidden lg:block">
              <p className="data-label mb-3">Keyboard Shortcuts</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <FooterShortcut keys={['Ctrl', 'K']} label="Command palette" />
                <FooterShortcut keys={['Ctrl', 'J']} label="AI assistant" />
                <FooterShortcut keys={['Ctrl', 'N']} label="Quick capture" />
                <FooterShortcut keys={['Ctrl', '\\']} label="Toggle sidebar" />
                <FooterShortcut keys={['Ctrl', '1']} label="Capture view" />
                <FooterShortcut keys={['Ctrl', '2']} label="Process view" />
                <FooterShortcut keys={['Ctrl', '3']} label="Commit view" />
                <FooterShortcut keys={['Ctrl', ',']} label="Settings" />
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-8">
              <div>
                <p className="data-label mb-3">Product</p>
                <ul className="space-y-2">
                  <li>
                    <Link href="#how-it-works" className="text-xs transition-colors hover:text-[var(--accent-base)]" style={{ color: 'var(--text-secondary)' }}>
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-xs transition-colors hover:text-[var(--accent-base)]" style={{ color: 'var(--text-secondary)' }}>
                      Changelog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-xs transition-colors hover:text-[var(--accent-base)]" style={{ color: 'var(--text-secondary)' }}>
                      API Docs
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="data-label mb-3">Legal</p>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-xs transition-colors hover:text-[var(--accent-base)]" style={{ color: 'var(--text-secondary)' }}>
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-xs transition-colors hover:text-[var(--accent-base)]" style={{ color: 'var(--text-secondary)' }}>
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="mt-8 flex items-center justify-between pt-6"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <p className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
              &copy; 2026 OffMind. Built with precision.
            </p>
            <div className="flex items-center gap-2">
              <div className="status-indicator" />
              <span className="font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
                all systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =======================================================================
   COMPONENT: ProcessStep — HUD Panel for How It Works
======================================================================= */
function ProcessStep({
  number,
  icon: Icon,
  title,
  description,
  color,
  shortcut,
  metric,
  metricLabel,
}: {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'blue' | 'amber' | 'green';
  shortcut: string;
  metric: string;
  metricLabel: string;
}) {
  const colorMap = {
    blue: {
      accent: '#60a5fa',
      bg: 'rgba(96, 165, 250, 0.06)',
      border: 'rgba(96, 165, 250, 0.15)',
      glow: 'rgba(96, 165, 250, 0.08)',
    },
    amber: {
      accent: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.06)',
      border: 'rgba(251, 191, 36, 0.15)',
      glow: 'rgba(251, 191, 36, 0.08)',
    },
    green: {
      accent: '#34d399',
      bg: 'rgba(52, 211, 153, 0.06)',
      border: 'rgba(52, 211, 153, 0.15)',
      glow: 'rgba(52, 211, 153, 0.08)',
    },
  };

  const c = colorMap[color];

  return (
    <div
      className="hud-border neural-panel relative rounded-lg p-5 sm:p-6"
      style={{
        background: c.bg,
        borderColor: c.border,
      }}
    >
      {/* Step number */}
      <div className="mb-4 flex items-center justify-between">
        <span
          className="font-[family-name:var(--font-geist-mono)] text-xs font-bold"
          style={{ color: c.accent, opacity: 0.7 }}
        >
          {number}
        </span>
        <div className="flex items-center gap-1">
          {shortcut.split('+').map((key, i) => (
            <span key={i} className="kbd-hint">{key}</span>
          ))}
        </div>
      </div>

      {/* Icon */}
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
          boxShadow: `0 0 20px ${c.glow}`,
        }}
      >
        <Icon className="h-5 w-5" style={{ color: c.accent }} />
      </div>

      {/* Title */}
      <h3
        className="text-base font-semibold"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>

      {/* Metric */}
      <div className="mt-4 flex items-baseline gap-2" style={{ borderTop: `1px solid ${c.border}`, paddingTop: '12px' }}>
        <span className="counter-animate text-lg font-bold" style={{ color: c.accent }}>
          {metric}
        </span>
        <span className="data-label" style={{ color: `${c.accent}80` }}>
          {metricLabel}
        </span>
      </div>
    </div>
  );
}

/* =======================================================================
   COMPONENT: FeatureCard — Dense Feature Grid Card
======================================================================= */
function FeatureCard({
  icon: Icon,
  title,
  description,
  shortcut,
  metric,
  metricLabel,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  shortcut: string;
  metric: string;
  metricLabel: string;
  color: string;
}) {
  const colorMap: Record<string, { accent: string; bg: string }> = {
    cyan: { accent: '#00d4ff', bg: 'rgba(0, 212, 255, 0.08)' },
    violet: { accent: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
    blue: { accent: '#60a5fa', bg: 'rgba(96, 165, 250, 0.08)' },
    amber: { accent: '#fbbf24', bg: 'rgba(251, 191, 36, 0.08)' },
    green: { accent: '#34d399', bg: 'rgba(52, 211, 153, 0.08)' },
    rose: { accent: '#f472b6', bg: 'rgba(244, 114, 182, 0.08)' },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className="neural-card scan-line group relative overflow-hidden p-5 card-hover">
      {/* Header row: icon + metric */}
      <div className="flex items-start justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: c.bg }}
        >
          <Icon className="h-4 w-4" style={{ color: c.accent }} />
        </div>
        <div className="text-right">
          <p className="counter-animate text-sm font-bold" style={{ color: c.accent }}>
            {metric}
          </p>
          <p className="data-label" style={{ fontSize: '0.5625rem' }}>
            {metricLabel}
          </p>
        </div>
      </div>

      {/* Title */}
      <h3
        className="mt-3 text-sm font-semibold"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>

      {/* Shortcut */}
      {shortcut && (
        <div className="mt-3 flex items-center gap-1">
          {shortcut.split('+').map((key, i) => (
            <span key={i} className="kbd-hint">{key}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* =======================================================================
   COMPONENT: DashboardColumn — Mock Dashboard Column
======================================================================= */
function DashboardColumn({
  label,
  icon: Icon,
  count,
  color,
  colorBg,
  colorBorder,
  items,
  active,
}: {
  label: string;
  icon: React.ElementType;
  count: number;
  color: string;
  colorBg: string;
  colorBorder: string;
  items: string[];
  active?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: colorBg,
        border: `1px solid ${colorBorder}`,
      }}
    >
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ background: `${color}15` }}
          >
            <Icon className="h-3 w-3" style={{ color }} />
          </div>
          <span className="data-label" style={{ color: `${color}cc` }}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {active && (
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
            />
          )}
          <span
            className="counter-animate text-lg font-bold"
            style={{ color, lineHeight: 1 }}
          >
            {count}
          </span>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-md px-2.5 py-1.5 text-xs"
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            {item}
          </div>
        ))}
        {count > items.length && (
          <p className="px-2.5 font-[family-name:var(--font-geist-mono)] text-xs" style={{ color: 'var(--text-muted)' }}>
            +{count - items.length} more
          </p>
        )}
      </div>
    </div>
  );
}

/* =======================================================================
   COMPONENT: StatCard — Performance Metrics Card
======================================================================= */
function StatCard({
  icon: Icon,
  value,
  label,
  detail,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="neural-card p-5">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4" style={{ color: 'var(--accent-base)' }} />
        <span className="data-label">{detail}</span>
      </div>
      <p
        className="counter-animate mt-3 text-2xl font-bold"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
    </div>
  );
}

/* =======================================================================
   COMPONENT: PricingFeature — Checkmark List Item
======================================================================= */
function PricingFeature({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <li className="flex items-center gap-2.5">
      <div
        className="flex h-4 w-4 items-center justify-center rounded-full"
        style={{
          background: accent ? 'rgba(0,212,255,0.10)' : 'rgba(52,211,153,0.10)',
        }}
      >
        <Check className="h-2.5 w-2.5" style={{ color: accent ? '#00d4ff' : '#34d399' }} />
      </div>
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </span>
    </li>
  );
}

/* =======================================================================
   COMPONENT: FooterShortcut — Keyboard Shortcut Reference
======================================================================= */
function FooterShortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {keys.map((key, i) => (
          <span key={i} className="kbd-hint">{key}</span>
        ))}
      </div>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  );
}
